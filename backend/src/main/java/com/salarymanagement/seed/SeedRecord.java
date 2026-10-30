package com.salarymanagement.seed;

import com.salarymanagement.model.EmploymentType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SeedRecord(
        String id,
        String fullName,
        String jobTitle,
        String country,
        BigDecimal salary,
        String department,
        String email,
        LocalDate hireDate,
        EmploymentType employmentType
) {
}
