package com.example.server.config;

import com.example.server.entity.Doctor;
import com.example.server.entity.Role;
import com.example.server.entity.User;
import com.example.server.repository.DoctorRepository;
import com.example.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    UserRepository userRepository;

    @Autowired
    DoctorRepository doctorRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByUsername("drsmith")) {
            createDoctor("drsmith", "Dr. John Smith", "Cardiology", "Expert in heart diseases and cardiovascular health.");
        }
        if (!userRepository.existsByUsername("dradams")) {
            createDoctor("dradams", "Dr. Sarah Adams", "Neurology", "Specializes in brain and nervous system disorders.");
        }
        if (!userRepository.existsByUsername("drhouse")) {
            createDoctor("drhouse", "Dr. Gregory House", "Diagnostic Medicine", "Renowned diagnostician handling complex cases.");
        }
    }

    private void createDoctor(String username, String name, String specialization, String bio) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(username + "@hospital.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole(Role.ROLE_DOCTOR);
        userRepository.save(user);

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setName(name);
        doctor.setSpecialization(specialization);
        doctor.setBio(bio);
        doctorRepository.save(doctor);
    }
}
