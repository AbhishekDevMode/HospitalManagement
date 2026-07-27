package com.example.server.controller;

import com.example.server.entity.Invoice;
import com.example.server.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @GetMapping
    public ResponseEntity<?> getAllInvoices() {
        return ResponseEntity.ok(invoiceRepository.findAll());
    }
    
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientInvoices(@PathVariable Long patientId) {
        return ResponseEntity.ok(invoiceRepository.findByPatient_User_Id(patientId));
    }

    @PostMapping
    public ResponseEntity<?> createInvoice(@RequestBody Invoice invoice) {
        invoice.setIssueDate(LocalDateTime.now());
        invoice.setStatus("PENDING");
        return ResponseEntity.ok(invoiceRepository.save(invoice));
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<?> payInvoice(@PathVariable Long id) {
        Optional<Invoice> opt = invoiceRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.badRequest().body("Invoice not found");

        Invoice invoice = opt.get();
        invoice.setStatus("PAID");
        invoice.setPaidDate(LocalDateTime.now());
        
        return ResponseEntity.ok(invoiceRepository.save(invoice));
    }
}
