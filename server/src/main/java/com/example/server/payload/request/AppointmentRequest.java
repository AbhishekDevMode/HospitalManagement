package com.example.server.payload.request;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentRequest {
    private Long doctorId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
