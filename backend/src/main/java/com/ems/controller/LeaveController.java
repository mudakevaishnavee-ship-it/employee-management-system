package com.ems.controller;

import com.ems.dto.LeaveRequestDto;
import com.ems.dto.LeaveResponseDto;
import com.ems.entity.LeaveBalance;
import com.ems.enums.LeaveStatus;
import com.ems.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping
    public ResponseEntity<LeaveResponseDto> applyLeave(Authentication auth,
                                                       @Valid @RequestBody LeaveRequestDto dto) {
        return ResponseEntity.ok(leaveService.applyLeave(auth.getName(), dto));
    }

    @GetMapping("/my")
    public ResponseEntity<List<LeaveResponseDto>> getMyLeaves(Authentication auth) {
        return ResponseEntity.ok(leaveService.getMyLeaves(auth.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<LeaveResponseDto>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<LeaveResponseDto>> getPendingLeaves() {
        return ResponseEntity.ok(leaveService.getPendingLeaves());
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<LeaveResponseDto> approveLeave(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(leaveService.updateLeaveStatus(id, LeaveStatus.APPROVED, auth.getName()));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<LeaveResponseDto> rejectLeave(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(leaveService.updateLeaveStatus(id, LeaveStatus.REJECTED, auth.getName()));
    }

    @GetMapping("/balance")
    public ResponseEntity<List<LeaveBalance>> getMyLeaveBalance(Authentication auth) {
        return ResponseEntity.ok(leaveService.getLeaveBalances(auth.getName()));
    }
}
