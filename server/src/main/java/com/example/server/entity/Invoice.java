package com.example.server.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name="invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name="appointment_id", nullable = false)
    private Appointment appointment;

    @ManyToOne
    @JoinColumn(name="patient_id", nullable = false)
    private Patient patient;

    private Double amount;
    
    // PENDING, PAID, CANCELLED
    private String status = "PENDING";

    private LocalDateTime issueDate = LocalDateTime.now();
    private LocalDateTime paidDate;
}
