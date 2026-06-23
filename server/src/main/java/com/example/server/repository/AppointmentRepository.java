package com.example.server.repository;

import com.example.server.entity.Appointment;
import com.example.server.entity.Doctor;
import com.example.server.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByDoctor(Doctor doctor);
    List<Appointment> findByPatient(Patient patient);
    List<Appointment> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
    List<Appointment> findByPatient_User_Id(Long userId);
    List<Appointment> findByDoctor_User_Id(Long userId);
}
