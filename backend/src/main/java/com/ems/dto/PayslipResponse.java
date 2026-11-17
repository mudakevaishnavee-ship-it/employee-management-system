package com.ems.dto;

import lombok.Data;

@Data
public class PayslipResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private Integer month;
    private Integer year;
    private Double basicSalary;
    private Double hra;
    private Double allowances;
    private Double deductions;
    private Double netSalary;
}
