package com.example.server.controller;

import com.example.server.entity.Doctor;
import com.example.server.entity.Patient;
import com.example.server.entity.Review;
import com.example.server.entity.User;
import com.example.server.repository.AppointmentRepository;
import com.example.server.repository.BlockedSlotRepository;
import com.example.server.repository.DoctorRepository;
import com.example.server.repository.PatientRepository;
import com.example.server.repository.ReviewRepository;
import com.example.server.repository.UserRepository;
import com.example.server.entity.BlockedSlot;
import com.example.server.entity.Appointment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    DoctorRepository doctorRepository;

    @Autowired
    ReviewRepository reviewRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PatientRepository patientRepository;

    @Autowired
    AppointmentRepository appointmentRepository;

    @Autowired
    BlockedSlotRepository blockedSlotRepository;

    @GetMapping
    public ResponseEntity<?> getAllDoctors() {
        return ResponseEntity.ok(doctorRepository.findAll());
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchDoctors(
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) Double minRating) {
        
        List<Doctor> doctors = doctorRepository.findAll();
        
        if (specialization != null && !specialization.isEmpty()) {
            doctors = doctors.stream()
                    .filter(d -> d.getSpecialization() != null && d.getSpecialization().equalsIgnoreCase(specialization))
                    .collect(Collectors.toList());
        }
        
        if (minRating != null) {
            doctors = doctors.stream()
                    .filter(d -> d.getRating() != null && d.getRating() >= minRating)
                    .collect(Collectors.toList());
        }
        
        return ResponseEntity.ok(doctors);
    }

    @PostMapping("/{doctorId}/reviews")
    public ResponseEntity<?> addReview(
            @PathVariable Long doctorId,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        
        Optional<Doctor> docOpt = doctorRepository.findById(doctorId);
        if (docOpt.isEmpty()) return ResponseEntity.badRequest().body("Doctor not found");
        
        Optional<User> userOpt = userRepository.findByUsername(authentication.getName());
        Optional<Patient> patOpt = patientRepository.findByUser(userOpt.get());
        
        if (patOpt.isEmpty()) return ResponseEntity.badRequest().body("Only patients can leave reviews");

        Review review = new Review();
        review.setDoctor(docOpt.get());
        review.setPatient(patOpt.get());
        review.setRating(Integer.parseInt(payload.get("rating")));
        review.setComment(payload.get("comment"));
        
        reviewRepository.save(review);
        
        // Update doctor's average rating
        Doctor doctor = docOpt.get();
        List<Review> allReviews = reviewRepository.findByDoctor(doctor);
        double avg = allReviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        doctor.setRating(avg);
        doctor.setReviewCount(allReviews.size());
        doctorRepository.save(doctor);
        
        return ResponseEntity.ok("Review added successfully");
    }

    @PutMapping("/{id}/availability")
    public ResponseEntity<?> updateAvailability(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<Doctor> opt = doctorRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.badRequest().body("Doctor not found");
        Doctor doctor = opt.get();

        if (payload.containsKey("workingDays")) doctor.setWorkingDays(payload.get("workingDays").toString());
        if (payload.containsKey("startTime")) doctor.setStartTime(payload.get("startTime").toString());
        if (payload.containsKey("endTime")) doctor.setEndTime(payload.get("endTime").toString());
        if (payload.containsKey("slotDuration")) doctor.setSlotDuration(Integer.parseInt(payload.get("slotDuration").toString()));

        doctorRepository.save(doctor);
        return ResponseEntity.ok("Availability updated successfully");
    }

    @PostMapping("/{id}/blocked-slots")
    public ResponseEntity<?> addBlockedSlot(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Optional<Doctor> opt = doctorRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.badRequest().body("Doctor not found");

        BlockedSlot slot = new BlockedSlot();
        slot.setDoctor(opt.get());
        slot.setStartTime(LocalDateTime.parse(payload.get("startTime")));
        slot.setEndTime(LocalDateTime.parse(payload.get("endTime")));
        slot.setReason(payload.get("reason"));

        blockedSlotRepository.save(slot);
        return ResponseEntity.ok("Slot blocked successfully");
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<?> getAvailableSlots(@PathVariable Long id, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Optional<Doctor> opt = doctorRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.badRequest().body("Doctor not found");
        Doctor doctor = opt.get();

        // Check if date falls in working days
        int dayOfWeek = date.getDayOfWeek().getValue();
        if (doctor.getWorkingDays() == null || !doctor.getWorkingDays().contains(String.valueOf(dayOfWeek))) {
            return ResponseEntity.ok(new ArrayList<>());
        }

        LocalTime start = LocalTime.parse(doctor.getStartTime());
        LocalTime end = LocalTime.parse(doctor.getEndTime());
        int duration = doctor.getSlotDuration() != null ? doctor.getSlotDuration() : 30;

        List<String> availableSlots = new ArrayList<>();
        LocalTime current = start;

        List<Appointment> existingAppointments = appointmentRepository.findByDoctor_User_Id(doctor.getUser().getId());
        List<BlockedSlot> blockedSlots = blockedSlotRepository.findByDoctorId(doctor.getId());

        while (current.plusMinutes(duration).isBefore(end) || current.plusMinutes(duration).equals(end)) {
            LocalDateTime slotStart = LocalDateTime.of(date, current);
            LocalDateTime slotEnd = slotStart.plusMinutes(duration);
            boolean isAvailable = true;

            for (Appointment app : existingAppointments) {
                if (!app.getStatus().equals("CANCELLED") && app.getStartTime().toLocalDate().equals(date)) {
                    if ((slotStart.isEqual(app.getStartTime()) || slotStart.isAfter(app.getStartTime())) && slotStart.isBefore(app.getEndTime())) {
                        isAvailable = false;
                        break;
                    }
                }
            }

            for (BlockedSlot bs : blockedSlots) {
                if (bs.getStartTime().toLocalDate().equals(date)) {
                     if ((slotStart.isEqual(bs.getStartTime()) || slotStart.isAfter(bs.getStartTime())) && slotStart.isBefore(bs.getEndTime())) {
                        isAvailable = false;
                        break;
                    }
                }
            }

            if (isAvailable) {
                availableSlots.add(current.format(DateTimeFormatter.ofPattern("HH:mm")));
            }
            current = current.plusMinutes(duration);
        }

        return ResponseEntity.ok(availableSlots);
    }
}
