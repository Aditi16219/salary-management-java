package com.salarymanagement.dto;

import com.salarymanagement.model.EmploymentType;
import jakarta.validation.constraints.Email;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Partial update: only non-null fields are applied. */
public record EmployeeUpdate(
        String fullName,
        String jobTitle,
        String country,
        BigDecimal salary,
        String department,
        @Email String email,
        LocalDate hireDate,
        EmploymentType employmentType
) {
}
