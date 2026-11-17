package com.ems.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class EmployeeUpdateRequest {
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
    private Long departmentId;
    private String designation;
    private Double salary;
    private LocalDate dateOfJoining;
}
