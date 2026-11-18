package com.ems.dto;

import com.ems.enums.LeaveType;
import lombok.Data;

@Data
public class LeaveBalanceDto {
    private Long id;
    private LeaveType leaveType;
    private Integer totalLeaves;
    private Integer usedLeaves;
    private Integer year;
}
