package com.example.server.repository;

import com.example.server.entity.Patient;
import com.example.server.entity.PatientChart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientChartRepository extends JpaRepository<PatientChart, Long> {
    Optional<PatientChart> findByPatient(Patient patient);
}
