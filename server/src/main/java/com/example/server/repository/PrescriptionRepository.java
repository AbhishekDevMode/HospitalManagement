package com.example.server.repository;

import com.example.server.entity.Patient;
import com.example.server.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatient(Patient patient);
    List<Prescription> findByAppointment_Id(Long appointmentId);
}
