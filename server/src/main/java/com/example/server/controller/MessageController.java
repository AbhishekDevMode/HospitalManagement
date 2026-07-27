package com.example.server.controller;

import com.example.server.entity.Message;
import com.example.server.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    MessageRepository messageRepository;

    @GetMapping("/{appointmentId}")
    public ResponseEntity<List<Message>> getChatHistory(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(messageRepository.findByAppointmentIdOrderByTimestampAsc(appointmentId));
    }
}
