package com.ems.dto;

import com.ems.enums.Role;
import lombok.Data;
import java.time.LocalDate;

@Data
public class EmployeeResponse {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private Long departmentId;
    private String departmentName;
    private String designation;
    private Double salary;
    private LocalDate dateOfJoining;
    private Role role;
}
