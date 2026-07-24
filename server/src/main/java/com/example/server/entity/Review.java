package com.example.server.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name="reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name="patient_id", nullable = false)
    private Patient patient;

    private Integer rating; // 1 to 5
    private String comment;

    private LocalDateTime createdAt = LocalDateTime.now();
}
