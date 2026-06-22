package com.example.server.controller;

import com.example.server.entity.Doctor;
import com.example.server.entity.Patient;
import com.example.server.entity.Role;
import com.example.server.entity.User;
import com.example.server.payload.request.LoginRequest;
import com.example.server.payload.request.SignUpRequest;
import com.example.server.payload.response.JwtResponse;
import com.example.server.payload.response.MessageResponse;
import com.example.server.repository.DoctorRepository;
import com.example.server.repository.PatientRepository;
import com.example.server.repository.UserRepository;
import com.example.server.security.JwtUtils;
import com.example.server.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PatientRepository patientRepository;

    @Autowired
    DoctorRepository doctorRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                null,
                role));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        // Create new user's account
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));

        String reqRole = signUpRequest.getRole();
        Role role = Role.ROLE_PATIENT; // default

        if ("DOCTOR".equalsIgnoreCase(reqRole)) {
            role = Role.ROLE_DOCTOR;
        } else if ("ADMIN".equalsIgnoreCase(reqRole)) {
            role = Role.ROLE_ADMIN;
        }
        user.setRole(role);
        userRepository.save(user);

        if (role == Role.ROLE_PATIENT) {
            Patient patient = new Patient();
            patient.setUser(user);
            patient.setName(signUpRequest.getName());
            patient.setContactNumber(signUpRequest.getContactNumber());
            patientRepository.save(patient);
        } else if (role == Role.ROLE_DOCTOR) {
            Doctor doctor = new Doctor();
            doctor.setUser(user);
            doctor.setName(signUpRequest.getName());
            doctor.setSpecialization(signUpRequest.getSpecialization());
            doctor.setBio(signUpRequest.getBio());
            doctorRepository.save(doctor);
        }

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
