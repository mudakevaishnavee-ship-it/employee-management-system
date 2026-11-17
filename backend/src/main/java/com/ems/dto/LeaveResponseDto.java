package com.ems.dto;

import com.ems.enums.LeaveStatus;
import com.ems.enums.LeaveType;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class LeaveResponseDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private LeaveStatus status;
    private String approvedByName;
    private LocalDateTime createdAt;
}
