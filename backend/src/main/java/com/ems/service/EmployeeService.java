package com.ems.service;

import com.ems.dto.EmployeeRequest;
import com.ems.dto.EmployeeResponse;
import com.ems.dto.EmployeeUpdateRequest;
import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.entity.LeaveBalance;
import com.ems.entity.User;
import com.ems.enums.LeaveType;
import com.ems.enums.Role;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final PasswordEncoder passwordEncoder;

    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream().map(this::toResponse).toList();
    }

    public EmployeeResponse getEmployeeById(Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        return toResponse(emp);
    }

    public EmployeeResponse getEmployeeByUserId(Long userId) {
        Employee emp = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        return toResponse(emp);
    }

    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        Department dept = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.EMPLOYEE)
                .build();
        user = userRepository.save(user);

        Employee employee = Employee.builder()
                .user(user)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .department(dept)
                .designation(request.getDesignation())
                .salary(request.getSalary())
                .dateOfJoining(request.getDateOfJoining() != null ? request.getDateOfJoining() : LocalDate.now())
                .build();
        employee = employeeRepository.save(employee);

        initializeLeaveBalances(employee);

        return toResponse(employee);
    }

    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeUpdateRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (request.getFirstName() != null) employee.setFirstName(request.getFirstName());
        if (request.getLastName() != null) employee.setLastName(request.getLastName());
        if (request.getPhone() != null) employee.setPhone(request.getPhone());
        if (request.getAddress() != null) employee.setAddress(request.getAddress());
        if (request.getDesignation() != null) employee.setDesignation(request.getDesignation());
        if (request.getSalary() != null) employee.setSalary(request.getSalary());
        if (request.getDateOfJoining() != null) employee.setDateOfJoining(request.getDateOfJoining());

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            employee.setDepartment(dept);
        }

        return toResponse(employeeRepository.save(employee));
    }

    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        User user = employee.getUser();
        employeeRepository.delete(employee);
        userRepository.delete(user);
    }

    public List<EmployeeResponse> searchEmployees(String keyword) {
        return employeeRepository.search(keyword).stream().map(this::toResponse).toList();
    }

    public List<EmployeeResponse> getByDepartment(Long departmentId) {
        return employeeRepository.findByDepartmentId(departmentId).stream().map(this::toResponse).toList();
    }

    private void initializeLeaveBalances(Employee employee) {
        int currentYear = Year.now().getValue();
        for (LeaveType type : LeaveType.values()) {
            int total = switch (type) {
                case CASUAL -> 12;
                case SICK -> 10;
                case EARNED -> 15;
                case UNPAID -> 0;
            };
            LeaveBalance balance = LeaveBalance.builder()
                    .employee(employee)
                    .leaveType(type)
                    .totalLeaves(total)
                    .usedLeaves(0)
                    .year(currentYear)
                    .build();
            leaveBalanceRepository.save(balance);
        }
    }

    private EmployeeResponse toResponse(Employee emp) {
        EmployeeResponse res = new EmployeeResponse();
        res.setId(emp.getId());
        res.setUserId(emp.getUser().getId());
        res.setFirstName(emp.getFirstName());
        res.setLastName(emp.getLastName());
        res.setEmail(emp.getUser().getEmail());
        res.setPhone(emp.getPhone());
        res.setAddress(emp.getAddress());
        res.setDepartmentId(emp.getDepartment() != null ? emp.getDepartment().getId() : null);
        res.setDepartmentName(emp.getDepartment() != null ? emp.getDepartment().getName() : null);
        res.setDesignation(emp.getDesignation());
        res.setSalary(emp.getSalary());
        res.setDateOfJoining(emp.getDateOfJoining());
        res.setRole(emp.getUser().getRole());
        return res;
    }
}
