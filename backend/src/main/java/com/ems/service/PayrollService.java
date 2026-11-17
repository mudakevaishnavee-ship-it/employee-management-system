package com.ems.service;

import com.ems.dto.PayslipResponse;
import com.ems.entity.Employee;
import com.ems.entity.Payslip;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.PayslipRepository;
import com.ems.repository.UserRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayslipRepository payslipRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public PayslipResponse generatePayslip(Long employeeId, Integer month, Integer year) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (payslipRepository.findByEmployeeIdAndMonthAndYear(employeeId, month, year).isPresent()) {
            throw new BadRequestException("Payslip already generated for this month");
        }

        double basic = employee.getSalary();
        double hra = basic * 0.20;
        double allowances = basic * 0.10;
        double deductions = basic * 0.12;
        double net = basic + hra + allowances - deductions;

        Payslip payslip = Payslip.builder()
                .employee(employee)
                .month(month)
                .year(year)
                .basicSalary(basic)
                .hra(hra)
                .allowances(allowances)
                .deductions(deductions)
                .netSalary(net)
                .build();

        return toResponse(payslipRepository.save(payslip));
    }

    public List<PayslipResponse> getPayslipsByEmployee(Long employeeId) {
        return payslipRepository.findByEmployeeIdOrderByYearDescMonthDesc(employeeId)
                .stream().map(this::toResponse).toList();
    }

    public List<PayslipResponse> getMyPayslips(String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        var employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        return getPayslipsByEmployee(employee.getId());
    }

    public byte[] generatePayslipPdf(Long payslipId) {
        Payslip payslip = payslipRepository.findById(payslipId)
                .orElseThrow(() -> new ResourceNotFoundException("Payslip not found"));

        Employee emp = payslip.getEmployee();

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf);

            doc.add(new Paragraph("PAYSLIP")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(20).setBold());

            doc.add(new Paragraph(String.format("Month: %d/%d", payslip.getMonth(), payslip.getYear()))
                    .setTextAlignment(TextAlignment.CENTER));

            doc.add(new Paragraph("\n"));

            doc.add(new Paragraph("Employee: " + emp.getFirstName() + " " + emp.getLastName()));
            doc.add(new Paragraph("Designation: " + emp.getDesignation()));
            doc.add(new Paragraph("Department: " +
                    (emp.getDepartment() != null ? emp.getDepartment().getName() : "N/A")));

            doc.add(new Paragraph("\n"));

            Table table = new Table(UnitValue.createPercentArray(new float[]{60, 40}))
                    .useAllAvailableWidth();

            table.addHeaderCell(new Cell().add(new Paragraph("Component").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("Amount").setBold()));

            table.addCell("Basic Salary");
            table.addCell(String.format("%.2f", payslip.getBasicSalary()));
            table.addCell("HRA (20%)");
            table.addCell(String.format("%.2f", payslip.getHra()));
            table.addCell("Allowances (10%)");
            table.addCell(String.format("%.2f", payslip.getAllowances()));
            table.addCell("Deductions (12%)");
            table.addCell(String.format("-%.2f", payslip.getDeductions()));
            table.addCell(new Cell().add(new Paragraph("Net Salary").setBold()));
            table.addCell(new Cell().add(new Paragraph(String.format("%.2f", payslip.getNetSalary())).setBold()));

            doc.add(table);
            doc.close();

            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private PayslipResponse toResponse(Payslip payslip) {
        PayslipResponse res = new PayslipResponse();
        res.setId(payslip.getId());
        res.setEmployeeId(payslip.getEmployee().getId());
        res.setEmployeeName(payslip.getEmployee().getFirstName() + " " + payslip.getEmployee().getLastName());
        res.setMonth(payslip.getMonth());
        res.setYear(payslip.getYear());
        res.setBasicSalary(payslip.getBasicSalary());
        res.setHra(payslip.getHra());
        res.setAllowances(payslip.getAllowances());
        res.setDeductions(payslip.getDeductions());
        res.setNetSalary(payslip.getNetSalary());
        return res;
    }
}
