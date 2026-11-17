package com.ems.service;

import com.ems.dto.DepartmentDto;
import com.ems.entity.Department;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream().map(this::toDto).toList();
    }

    public DepartmentDto getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        return toDto(dept);
    }

    public DepartmentDto createDepartment(DepartmentDto dto) {
        if (departmentRepository.findByName(dto.getName()).isPresent()) {
            throw new BadRequestException("Department already exists");
        }
        Department dept = Department.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
        return toDto(departmentRepository.save(dept));
    }

    public DepartmentDto updateDepartment(Long id, DepartmentDto dto) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        dept.setName(dto.getName());
        dept.setDescription(dto.getDescription());
        return toDto(departmentRepository.save(dept));
    }

    public void deleteDepartment(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        if (dept.getEmployees() != null && !dept.getEmployees().isEmpty()) {
            throw new BadRequestException("Cannot delete department with employees");
        }
        departmentRepository.delete(dept);
    }

    private DepartmentDto toDto(Department dept) {
        DepartmentDto dto = new DepartmentDto();
        dto.setId(dept.getId());
        dto.setName(dept.getName());
        dto.setDescription(dept.getDescription());
        dto.setEmployeeCount(dept.getEmployees() != null ? dept.getEmployees().size() : 0);
        return dto;
    }
}
