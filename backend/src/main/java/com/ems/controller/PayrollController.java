package com.ems.controller;

import com.ems.dto.PayslipResponse;
import com.ems.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

    @PostMapping("/generate/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<PayslipResponse> generatePayslip(@PathVariable Long employeeId,
                                                           @RequestParam Integer month,
                                                           @RequestParam Integer year) {
        return ResponseEntity.ok(payrollService.generatePayslip(employeeId, month, year));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<PayslipResponse>> getPayslips(@PathVariable Long employeeId) {
        return ResponseEntity.ok(payrollService.getPayslipsByEmployee(employeeId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<PayslipResponse>> getMyPayslips(Authentication auth) {
        return ResponseEntity.ok(payrollService.getMyPayslips(auth.getName()));
    }

    @GetMapping("/download/{payslipId}")
    public ResponseEntity<byte[]> downloadPayslip(@PathVariable Long payslipId) {
        byte[] pdf = payrollService.generatePayslipPdf(payslipId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=payslip_" + payslipId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
