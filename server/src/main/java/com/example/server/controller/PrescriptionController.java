package com.example.server.controller;

import com.example.server.entity.Appointment;
import com.example.server.entity.Doctor;
import com.example.server.entity.Patient;
import com.example.server.entity.Prescription;
import com.example.server.entity.User;
import com.example.server.repository.AppointmentRepository;
import com.example.server.repository.DoctorRepository;
import com.example.server.repository.PatientRepository;
import com.example.server.repository.PrescriptionRepository;
import com.example.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    @Autowired
    PrescriptionRepository prescriptionRepository;

    @Autowired
    AppointmentRepository appointmentRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    DoctorRepository doctorRepository;

    @Autowired
    PatientRepository patientRepository;

    @PostMapping
    public ResponseEntity<?> createPrescription(@RequestBody Map<String, String> payload, Authentication authentication) {
        Optional<User> userOpt = userRepository.findByUsername(authentication.getName());
        Optional<Doctor> docOpt = doctorRepository.findByUser(userOpt.get());
        
        if (docOpt.isEmpty()) return ResponseEntity.badRequest().body("Only doctors can prescribe");

        Long appointmentId = Long.parseLong(payload.get("appointmentId"));
        Optional<Appointment> appOpt = appointmentRepository.findById(appointmentId);
        if (appOpt.isEmpty()) return ResponseEntity.badRequest().body("Appointment not found");

        Prescription prescription = new Prescription();
        prescription.setDoctor(docOpt.get());
        prescription.setPatient(appOpt.get().getPatient());
        prescription.setAppointment(appOpt.get());
        prescription.setMedicines(payload.get("medicines"));
        prescription.setInstructions(payload.get("instructions"));
        prescription.setPrescribedAt(LocalDateTime.now());

        prescriptionRepository.save(prescription);
        return ResponseEntity.ok("Prescription created successfully");
    }
}
