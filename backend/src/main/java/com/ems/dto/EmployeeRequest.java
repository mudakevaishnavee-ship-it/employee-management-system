package com.ems.dto;

import com.ems.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class EmployeeRequest {
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    @NotBlank @Email
    private String email;
    @NotBlank
    private String password;
    private String phone;
    private String address;
    @NotNull
    private Long departmentId;
    private String designation;
    @NotNull @Positive
    private Double salary;
    private LocalDate dateOfJoining;
    private Role role;
}
