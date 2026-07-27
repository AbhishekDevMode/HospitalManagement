package com.example.server.controller;

import com.example.server.entity.Complaint;
import com.example.server.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @GetMapping
    public ResponseEntity<?> getAllComplaints() {
        return ResponseEntity.ok(complaintRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> submitComplaint(@RequestBody Complaint complaint) {
        return ResponseEntity.ok(complaintRepository.save(complaint));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> resolveComplaint(@PathVariable Long id, @RequestBody Complaint complaintDetails) {
        Optional<Complaint> opt = complaintRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.badRequest().body("Complaint not found");

        Complaint complaint = opt.get();
        complaint.setStatus("RESOLVED");
        if (complaintDetails.getResolutionNotes() != null) {
            complaint.setResolutionNotes(complaintDetails.getResolutionNotes());
        }

        return ResponseEntity.ok(complaintRepository.save(complaint));
    }
}
