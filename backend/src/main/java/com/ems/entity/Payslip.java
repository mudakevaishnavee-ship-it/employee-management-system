package com.ems.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payslips")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payslip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Double basicSalary;

    @Column(nullable = false)
    private Double hra;

    @Column(nullable = false)
    private Double allowances;

    @Column(nullable = false)
    private Double deductions;

    @Column(nullable = false)
    private Double netSalary;

    private LocalDateTime generatedAt;

    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
    }
}
