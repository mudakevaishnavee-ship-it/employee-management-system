package com.ems.service;

import com.ems.dto.LeaveBalanceDto;
import com.ems.dto.LeaveRequestDto;
import com.ems.dto.LeaveResponseDto;
import com.ems.entity.Employee;
import com.ems.entity.LeaveBalance;
import com.ems.entity.LeaveRequest;
import com.ems.entity.User;
import com.ems.enums.LeaveStatus;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.LeaveBalanceRepository;
import com.ems.repository.LeaveRequestRepository;
import com.ems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public LeaveResponseDto applyLeave(String email, LeaveRequestDto dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new BadRequestException("End date must be after start date");
        }

        long days = ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate()) + 1;

        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeAndYear(employee.getId(), dto.getLeaveType(), Year.now().getValue())
                .orElseThrow(() -> new ResourceNotFoundException("Leave balance not found"));

        int remaining = balance.getTotalLeaves() - balance.getUsedLeaves();
        if (days > remaining) {
            throw new BadRequestException("Insufficient leave balance. Available: " + remaining + " days");
        }

        LeaveRequest leave = LeaveRequest.builder()
                .employee(employee)
                .leaveType(dto.getLeaveType())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .reason(dto.getReason())
                .status(LeaveStatus.PENDING)
                .build();

        return toResponse(leaveRequestRepository.save(leave));
    }

    public List<LeaveResponseDto> getMyLeaves(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        return leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(employee.getId())
                .stream().map(this::toResponse).toList();
    }

    public List<LeaveResponseDto> getAllLeaves() {
        return leaveRequestRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    public List<LeaveResponseDto> getPendingLeaves() {
        return leaveRequestRepository.findByStatusOrderByCreatedAtDesc(LeaveStatus.PENDING)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public LeaveResponseDto updateLeaveStatus(Long leaveId, LeaveStatus status, String approverEmail) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Leave request already " + leave.getStatus().name().toLowerCase());
        }

        User approver = userRepository.findByEmail(approverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Approver not found"));

        leave.setStatus(status);
        leave.setApprovedBy(approver);

        if (status == LeaveStatus.APPROVED) {
            long days = ChronoUnit.DAYS.between(leave.getStartDate(), leave.getEndDate()) + 1;
            LeaveBalance balance = leaveBalanceRepository
                    .findByEmployeeIdAndLeaveTypeAndYear(
                            leave.getEmployee().getId(), leave.getLeaveType(), Year.now().getValue())
                    .orElseThrow(() -> new ResourceNotFoundException("Leave balance not found"));
            balance.setUsedLeaves(balance.getUsedLeaves() + (int) days);
            leaveBalanceRepository.save(balance);
        }

        return toResponse(leaveRequestRepository.save(leave));
    }

    public List<LeaveBalanceDto> getLeaveBalances(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        return leaveBalanceRepository.findByEmployeeIdAndYear(employee.getId(), Year.now().getValue())
                .stream().map(this::toBalanceDto).toList();
    }

    private LeaveBalanceDto toBalanceDto(LeaveBalance balance) {
        LeaveBalanceDto dto = new LeaveBalanceDto();
        dto.setId(balance.getId());
        dto.setLeaveType(balance.getLeaveType());
        dto.setTotalLeaves(balance.getTotalLeaves());
        dto.setUsedLeaves(balance.getUsedLeaves());
        dto.setYear(balance.getYear());
        return dto;
    }

    private LeaveResponseDto toResponse(LeaveRequest leave) {
        LeaveResponseDto dto = new LeaveResponseDto();
        dto.setId(leave.getId());
        dto.setEmployeeId(leave.getEmployee().getId());
        dto.setEmployeeName(leave.getEmployee().getFirstName() + " " + leave.getEmployee().getLastName());
        dto.setLeaveType(leave.getLeaveType());
        dto.setStartDate(leave.getStartDate());
        dto.setEndDate(leave.getEndDate());
        dto.setReason(leave.getReason());
        dto.setStatus(leave.getStatus());
        dto.setApprovedByName(leave.getApprovedBy() != null ? leave.getApprovedBy().getEmail() : null);
        dto.setCreatedAt(leave.getCreatedAt());
        return dto;
    }
}
