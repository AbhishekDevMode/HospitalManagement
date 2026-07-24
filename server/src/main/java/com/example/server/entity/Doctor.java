package com.example.server.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name="doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name="user_id",nullable = false)
    private User user;

    private String name;
    private String specialization;
    private String bio;
    
    private Double rating = 0.0;
    private Integer reviewCount = 0;
    private Integer experienceYears = 0;

    private String workingDays = "1,2,3,4,5"; // Default Mon-Fri
    private String startTime = "09:00";
    private String endTime = "17:00";
    private Integer slotDuration = 30; // Minutes

    @Column(nullable = false)
    private Boolean isVerified = false;
}
