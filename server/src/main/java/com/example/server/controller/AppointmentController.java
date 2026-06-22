package com.example.server.controller;


import com.example.server.repository.AppointmentRepository;
import com.example.server.repository.DoctorRepository;
import com.example.server.repository.PatientRepository;
import com.example.server.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
            return ResponseEntity.ok(appointmentRepository.findAll());
        } else if (role.equals("ROLE_DOCTOR")) {
            return ResponseEntity.ok(appointmentRepository.findAll());
        }

        return ResponseEntity.ok(appointmentRepository.findAll());
    }
}



