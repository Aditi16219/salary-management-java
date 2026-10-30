package com.salarymanagement.model;

import com.salarymanagement.repository.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.dao.DataIntegrityViolationException;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class EmployeeModelTest {

    @Autowired
    private EmployeeRepository repository;

    private Employee employee(String fullName, String email, EmploymentType type) {
        Employee employee = new Employee();
        employee.setFullName(fullName);
        employee.setJobTitle("Software Engineer");
        employee.setCountry("United States");
        employee.setSalary(new BigDecimal("95000.00"));
        employee.setDepartment("Engineering");
        employee.setEmail(email);
        employee.setHireDate(LocalDate.of(2022, 1, 15));
        employee.setEmploymentType(type);
        return employee;
    }

    @Test
    void createEmployee() {
        Employee saved = repository.saveAndFlush(
                employee("Jane Doe", "jane.doe@example.com", EmploymentType.FULL_TIME));

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getFullName()).isEqualTo("Jane Doe");
        assertThat(saved.getJobTitle()).isEqualTo("Software Engineer");
        assertThat(saved.getCountry()).isEqualTo("United States");
        assertThat(saved.getSalary()).isEqualByComparingTo("95000.00");
    }

    @Test
    void isActiveDefaultsToTrue() {
        Employee saved = repository.saveAndFlush(
                employee("John Smith", "john.smith@example.com", EmploymentType.FULL_TIME));

        assertThat(saved.isActive()).isTrue();
    }

    @Test
    void emailMustBeUnique() {
        repository.saveAndFlush(employee("Alice Brown", "alice@example.com", EmploymentType.FULL_TIME));

        assertThatThrownBy(() -> repository.saveAndFlush(
                employee("Bob Brown", "alice@example.com", EmploymentType.FULL_TIME)))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void softDeleteEmployee() {
        Employee saved = repository.saveAndFlush(
                employee("Charlie Wilson", "charlie@example.com", EmploymentType.CONTRACT));

        saved.setActive(false);
        repository.saveAndFlush(saved);

        assertThat(repository.findById(saved.getId())).get()
                .extracting(Employee::isActive).isEqualTo(false);
    }

    @Test
    void employmentTypeValues() {
        assertThat(EmploymentType.FULL_TIME.getValue()).isEqualTo("full_time");
        assertThat(EmploymentType.PART_TIME.getValue()).isEqualTo("part_time");
        assertThat(EmploymentType.CONTRACT.getValue()).isEqualTo("contract");
    }

    @Test
    void createdAtIsSetAutomatically() {
        Employee saved = repository.saveAndFlush(
                employee("Diana Prince", "diana@example.com", EmploymentType.PART_TIME));

        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }
}
