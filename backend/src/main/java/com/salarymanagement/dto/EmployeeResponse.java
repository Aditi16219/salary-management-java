package com.salarymanagement.dto;

import com.salarymanagement.model.Employee;
import com.salarymanagement.model.EmploymentType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record EmployeeResponse(
        String id,
        String fullName,
        String jobTitle,
        String country,
        BigDecimal salary,
        String department,
        String email,
        LocalDate hireDate,
        EmploymentType employmentType,
        boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static EmployeeResponse from(Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getFullName(),
                employee.getJobTitle(),
                employee.getCountry(),
                employee.getSalary(),
                employee.getDepartment(),
                employee.getEmail(),
                employee.getHireDate(),
                employee.getEmploymentType(),
                employee.isActive(),
                employee.getCreatedAt(),
                employee.getUpdatedAt()
        );
    }
}
