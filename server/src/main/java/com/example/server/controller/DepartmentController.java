package com.example.server.controller;

import com.example.server.entity.Department;
import com.example.server.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "*")
public class DepartmentController {

    @Autowired
    private DepartmentRepository departmentRepository;

    @GetMapping
    public ResponseEntity<?> getAllDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> addDepartment(@RequestBody Department department) {
        return ResponseEntity.ok(departmentRepository.save(department));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDepartment(@PathVariable Long id, @RequestBody Department departmentDetails) {
        Optional<Department> opt = departmentRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.badRequest().body("Department not found");

        Department department = opt.get();
        department.setName(departmentDetails.getName());
        department.setDescription(departmentDetails.getDescription());

        return ResponseEntity.ok(departmentRepository.save(department));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id) {
        if (!departmentRepository.existsById(id)) {
            return ResponseEntity.badRequest().body("Department not found");
        }
        departmentRepository.deleteById(id);
        return ResponseEntity.ok("Department deleted");
    }
}
