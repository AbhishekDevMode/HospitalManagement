package com.example.server.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignUpRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String password;

    @NotBlank
    private String role;

    @NotBlank
    private String name;

    private String email;

    private String contactNumber;

    private String specialization;
    private String bio;
}

