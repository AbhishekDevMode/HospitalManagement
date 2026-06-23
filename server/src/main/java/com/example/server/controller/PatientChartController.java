package com.example.server.controller;

import com.example.server.entity.Patient;
import com.example.server.entity.PatientChart;
import com.example.server.repository.PatientChartRepository;
import com.example.server.repository.PatientRepository;
import com.example.server.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/charts")
public class PatientChartController {

    @Autowired
    PatientChartRepository patientChartRepository;

    @Autowired
    PatientRepository patientRepository;

    @GetMapping("/my")
    public ResponseEntity<?> getMyChart(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Optional<Patient> patientOpt = patientRepository.findAll().stream()
                .filter(p -> p.getUser().getId().equals(userDetails.getId()))
                .findFirst();

        if (patientOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Patient not found");
        }

        Optional<PatientChart> chartOpt = patientChartRepository.findByPatient(patientOpt.get());
        if (chartOpt.isEmpty()) {
            PatientChart chart = new PatientChart();
            chart.setPatient(patientOpt.get());
            chart.setHistory("");
            return ResponseEntity.ok(patientChartRepository.save(chart));
        }

        return ResponseEntity.ok(chartOpt.get());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientChart(@PathVariable Long patientId) {
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (patientOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Patient not found");
        }

        Optional<PatientChart> chartOpt = patientChartRepository.findByPatient(patientOpt.get());
        if (chartOpt.isEmpty()) {
            PatientChart chart = new PatientChart();
            chart.setPatient(patientOpt.get());
            chart.setHistory("");
            return ResponseEntity.ok(patientChartRepository.save(chart));
        }

        return ResponseEntity.ok(chartOpt.get());
    }

    @PostMapping("/patient/{patientId}")
    public ResponseEntity<?> updatePatientChart(@PathVariable Long patientId, @RequestBody Map<String, String> payload) {
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (patientOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Patient not found");
        }

        Optional<PatientChart> chartOpt = patientChartRepository.findByPatient(patientOpt.get());
        PatientChart chart;
        if (chartOpt.isEmpty()) {
            chart = new PatientChart();
            chart.setPatient(patientOpt.get());
        } else {
            chart = chartOpt.get();
        }

        chart.setHistory(payload.get("history"));
        return ResponseEntity.ok(patientChartRepository.save(chart));
    }
}
