package com.example.server.config;

import com.example.server.entity.Doctor;
import com.example.server.entity.Role;
import com.example.server.entity.User;
import com.example.server.repository.DoctorRepository;
import com.example.server.entity.Department;
import com.example.server.repository.DepartmentRepository;
import com.example.server.repository.UserRepository;
import com.example.server.repository.DoctorRepository;
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
    DepartmentRepository departmentRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Seed Admin
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@hospital.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ROLE_ADMIN);
            admin.setIsActive(true);
            userRepository.save(admin);
        }

        // Seed Departments
        if (departmentRepository.count() == 0) {
            String[] deps = {"Cardiology", "Neurology", "Diagnostic Medicine", "Dermatology", "Pediatrics"};
            for (String d : deps) {
                Department dept = new Department();
                dept.setName(d);
                dept.setDescription(d + " department");
                departmentRepository.save(dept);
            }
        }

        if (!userRepository.existsByUsername("drsmith")) {
            createDoctor("drsmith", "Dr. John Smith", "Cardiology", "Expert in heart diseases and cardiovascular health.");
        }
        if (!userRepository.existsByUsername("dradams")) {
            createDoctor("dradams", "Dr. Sarah Adams", "Neurology", "Specializes in brain and nervous system disorders.");
        }
        if (!userRepository.existsByUsername("drhouse")) {
            createDoctor("drhouse", "Dr. Gregory House", "Diagnostic Medicine", "Renowned diagnostician handling complex cases.");
        }
        if (!userRepository.existsByUsername("drjones")) {
            createDoctor("drjones", "Dr. Emily Jones", "Cardiology", "Specializes in echocardiography and preventive cardiology.");
        }
        if (!userRepository.existsByUsername("drdavis")) {
            createDoctor("drdavis", "Dr. Michael Davis", "Pediatrics", "Over 10 years of experience in pediatric care.");
        }
        if (!userRepository.existsByUsername("drlee")) {
            createDoctor("drlee", "Dr. Nancy Lee", "Dermatology", "Expert in clinical dermatology and skin diseases.");
        }
    }

    private void createDoctor(String username, String name, String specialization, String bio) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(username + "@hospital.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole(Role.ROLE_DOCTOR);
        user.setIsActive(true);
        userRepository.save(user);

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setName(name);
        doctor.setSpecialization(specialization);
        doctor.setBio(bio);
        doctor.setIsVerified(true);
        doctorRepository.save(doctor);
    }

}
