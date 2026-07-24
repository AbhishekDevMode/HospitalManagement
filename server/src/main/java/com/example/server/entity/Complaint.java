package com.example.server.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name="complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="user_id", nullable = false)
    private User submittedBy;

    private String subject;
    
    @Column(columnDefinition = "TEXT")
    private String description;

    // OPEN, RESOLVED
    private String status = "OPEN";
    
    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;

    private LocalDateTime createdAt = LocalDateTime.now();
}
