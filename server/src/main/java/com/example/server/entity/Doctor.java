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


}
