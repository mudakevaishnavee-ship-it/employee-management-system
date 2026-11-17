package com.ems.dto;

import com.ems.enums.LeaveType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class LeaveRequestDto {
    @NotNull
    private LeaveType leaveType;
    @NotNull
    private LocalDate startDate;
    @NotNull
    private LocalDate endDate;
    private String reason;
}
