package com.salarymanagement.dto;

import com.salarymanagement.model.EmploymentType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EmployeeCreate(
        @NotBlank String fullName,
        @NotBlank String jobTitle,
        @NotBlank String country,
        @NotNull BigDecimal salary,
        @NotBlank String department,
        @NotBlank @Email String email,
        @NotNull LocalDate hireDate,
        EmploymentType employmentType
) {
}
