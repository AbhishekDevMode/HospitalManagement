package com.example.server.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name="health_records")
public class HealthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="patient_id", nullable = false)
    private Patient patient;

    private String fileName;
    private String fileType;
    private String filePath;

    private String description;
    
    private LocalDateTime uploadedAt = LocalDateTime.now();
}
