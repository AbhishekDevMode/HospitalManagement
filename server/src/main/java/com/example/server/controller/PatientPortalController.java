package com.example.server.controller;

import com.example.server.entity.*;
import com.example.server.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/portal")
public class PatientPortalController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PatientRepository patientRepository;

    @Autowired
    HealthRecordRepository healthRecordRepository;

    @Autowired
    AppointmentRepository appointmentRepository;

    @Autowired
    PrescriptionRepository prescriptionRepository;

    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping("/records/upload")
    public ResponseEntity<?> uploadRecord(@RequestParam("file") MultipartFile file,
                                          @RequestParam("description") String description,
                                          Authentication authentication) {
        try {
            Optional<User> userOpt = userRepository.findByUsername(authentication.getName());
            Optional<Patient> patOpt = patientRepository.findByUser(userOpt.get());
            if (patOpt.isEmpty()) return ResponseEntity.badRequest().body("Patient not found");

            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) dir.mkdirs();

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + fileName);
            Files.write(path, file.getBytes());

            HealthRecord record = new HealthRecord();
            record.setPatient(patOpt.get());
            record.setFileName(file.getOriginalFilename());
            record.setFileType(file.getContentType());
            record.setFilePath(path.toString());
            record.setDescription(description);
            record.setUploadedAt(LocalDateTime.now());
            healthRecordRepository.save(record);

            return ResponseEntity.ok("File uploaded successfully");
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Upload failed");
        }
    }

    @GetMapping("/timeline")
    public ResponseEntity<?> getTimeline(Authentication authentication) {
        Optional<User> userOpt = userRepository.findByUsername(authentication.getName());
        Optional<Patient> patOpt = patientRepository.findByUser(userOpt.get());
        if (patOpt.isEmpty()) return ResponseEntity.badRequest().body("Patient not found");

        Patient patient = patOpt.get();
        return getTimelineForPatient(patient);
    }

    @GetMapping("/timeline/patient/{id}")
    public ResponseEntity<?> getTimelineForDoctor(@PathVariable Long id, Authentication authentication) {
        // Assume authentication check for Doctor role is handled by Spring Security
        Optional<Patient> patOpt = patientRepository.findById(id);
        if (patOpt.isEmpty()) return ResponseEntity.badRequest().body("Patient not found");

        return getTimelineForPatient(patOpt.get());
    }

    private ResponseEntity<?> getTimelineForPatient(Patient patient) {
        List<Appointment> appointments = appointmentRepository.findByPatient_User_Id(patient.getUser().getId());
        List<HealthRecord> records = healthRecordRepository.findByPatient(patient);
        List<Prescription> prescriptions = prescriptionRepository.findByPatient(patient);

        Map<String, Object> timeline = new HashMap<>();
        timeline.put("appointments", appointments);
        timeline.put("records", records);
        timeline.put("prescriptions", prescriptions);

        return ResponseEntity.ok(timeline);
    }
}
