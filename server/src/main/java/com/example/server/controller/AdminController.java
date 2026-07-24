package com.example.server.controller;

import com.example.server.entity.Doctor;
import com.example.server.entity.Role;
import com.example.server.entity.User;
import com.example.server.entity.Appointment;
import com.example.server.entity.Invoice;
import com.example.server.repository.DoctorRepository;
import com.example.server.repository.UserRepository;
import com.example.server.repository.AppointmentRepository;
import com.example.server.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        long totalAppointments = appointmentRepository.count();
        long totalPatients = userRepository.findAll().stream().filter(u -> u.getRole() == Role.ROLE_PATIENT).count();
        long totalDoctors = doctorRepository.count();
        
        List<Invoice> invoices = invoiceRepository.findAll();
        double totalRevenue = invoices.stream()
                .filter(i -> "PAID".equals(i.getStatus()))
                .mapToDouble(Invoice::getAmount)
                .sum();

        // Calculate most booked doctors
        List<Appointment> allAppointments = appointmentRepository.findAll();
        Map<String, Long> doctorBookings = allAppointments.stream()
                .collect(Collectors.groupingBy(a -> a.getDoctor().getName(), Collectors.counting()));

        analytics.put("totalAppointments", totalAppointments);
        analytics.put("totalPatients", totalPatients);
        analytics.put("totalDoctors", totalDoctors);
        analytics.put("totalRevenue", totalRevenue);
        analytics.put("doctorBookings", doctorBookings);

        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.badRequest().body("User not found");
        
        User user = opt.get();
        user.setIsActive(user.getIsActive() == null ? false : !user.getIsActive());
        userRepository.save(user);
        
        return ResponseEntity.ok("User status updated");
    }

    @GetMapping("/doctors/unverified")
    public ResponseEntity<?> getUnverifiedDoctors() {
        List<Doctor> unverified = doctorRepository.findAll().stream()
                .filter(d -> d.getIsVerified() == null || !d.getIsVerified())
                .collect(Collectors.toList());
        return ResponseEntity.ok(unverified);
    }

    @PutMapping("/doctors/{id}/verify")
    public ResponseEntity<?> verifyDoctor(@PathVariable Long id) {
        Optional<Doctor> opt = doctorRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.badRequest().body("Doctor not found");
        
        Doctor doctor = opt.get();
        doctor.setIsVerified(true);
        doctorRepository.save(doctor);
        
        return ResponseEntity.ok("Doctor verified successfully");
    }
}
