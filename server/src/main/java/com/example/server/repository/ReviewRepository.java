package com.example.server.repository;

import com.example.server.entity.Doctor;
import com.example.server.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByDoctor(Doctor doctor);
}
