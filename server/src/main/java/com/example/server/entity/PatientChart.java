package com.example.server.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name="patient_charts")
public class PatientChart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name="patient_id",nullable = false)
    private Patient patient;

    @Convert(converter = CryptoConverter.class)
    @Column(columnDefinition = "TEXT")
    private String history;
}
