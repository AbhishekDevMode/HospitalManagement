package com.example.server.repository;

import com.example.server.entity.HealthRecord;
import com.example.server.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HealthRecordRepository extends JpaRepository<HealthRecord, Long> {
    List<HealthRecord> findByPatient(Patient patient);
}
