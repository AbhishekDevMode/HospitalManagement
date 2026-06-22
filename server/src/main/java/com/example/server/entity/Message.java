package com.example.server.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
@Entity
@Data
@Table(name="messages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long senderId;
    private Long receiverId;
    private String appointmentId;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime timestamp;

}
