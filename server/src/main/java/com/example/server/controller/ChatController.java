package com.example.server.controller;

import com.example.server.entity.Message;
import com.example.server.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessageRepository messageRepository;

    @MessageMapping("/chat")
    public void processMessage(@Payload Message chatMessage) {
        chatMessage.setTimestamp(LocalDateTime.now());
        Message savedMsg = messageRepository.save(chatMessage);

        // Broadcast to the specific appointment channel
        messagingTemplate.convertAndSend("/topic/appointment/" + chatMessage.getAppointmentId(), savedMsg);
    }
}
