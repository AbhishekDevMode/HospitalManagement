package com.example.server.controller;

import com.example.server.entity.Appointment;
import com.example.server.entity.Doctor;
import com.example.server.entity.Patient;
import com.example.server.payload.request.AppointmentRequest;
import com.example.server.payload.response.MessageResponse;
import com.example.server.repository.AppointmentRepository;
import com.example.server.repository.DoctorRepository;
import com.example.server.repository.PatientRepository;
import com.example.server.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    AppointmentRepository appointmentRepository;

    @Autowired
    PatientRepository patientRepository;

    @Autowired
    DoctorRepository doctorRepository;

    @GetMapping
    public ResponseEntity<?> getAppointments(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        if (role.equals("ROLE_PATIENT")) {
            return ResponseEntity.ok(appointmentRepository.findByPatient_User_Id(userDetails.getId()));
        } else if (role.equals("ROLE_DOCTOR")) {
            return ResponseEntity.ok(appointmentRepository.findByDoctor_User_Id(userDetails.getId()));
        }

        return ResponseEntity.ok(appointmentRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> bookAppointment(@RequestBody AppointmentRequest request, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Optional<Patient> patientOpt = patientRepository.findAll().stream()
                .filter(p -> p.getUser().getId().equals(userDetails.getId()))
                .findFirst();

        if (patientOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Patient not found"));
        }

        Optional<Doctor> doctorOpt = doctorRepository.findById(request.getDoctorId());
        if (doctorOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Doctor not found"));
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patientOpt.get());
        appointment.setDoctor(doctorOpt.get());
        appointment.setStartTime(request.getStartTime());
        appointment.setEndTime(request.getEndTime());
        appointment.setStatus("PENDING");

        appointmentRepository.save(appointment);

        return ResponseEntity.ok(new MessageResponse("Appointment booked successfully"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> statusMap) {
        Optional<Appointment> opt = appointmentRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Appointment not found"));
        }
        
        Appointment appointment = opt.get();
        appointment.setStatus(statusMap.get("status"));
        appointmentRepository.save(appointment);

        return ResponseEntity.ok(new MessageResponse("Status updated"));
    }
}
