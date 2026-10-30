package com.salarymanagement.seed;

import com.salarymanagement.model.Employee;
import com.salarymanagement.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Random;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class SeedServiceTest {

    @Autowired
    private SeedService seedService;

    @Autowired
    private EmployeeRepository repository;

    @BeforeEach
    void cleanDatabase() {
        repository.deleteAll();
    }

    @Test
    void seededEmployeesAreReadableThroughJpa() {
        List<SeedRecord> records = SeedGenerator.generateRecords(
                List.of("Alice", "Bob"), List.of("Smith", "Jones"), 50, new Random(7));

        seedService.insert(records);

        assertThat(repository.count()).isEqualTo(50);
        Employee first = repository.findById(records.get(0).id()).orElseThrow();
        assertThat(first.getHireDate()).isEqualTo(records.get(0).hireDate());
        assertThat(first.getSalary()).isEqualByComparingTo(records.get(0).salary());
        assertThat(first.getEmploymentType()).isEqualTo(records.get(0).employmentType());
        assertThat(first.isActive()).isTrue();
        assertThat(first.getCreatedAt()).isNotNull();
    }

    @Test
    void seedingIsIdempotent() {
        List<SeedRecord> records = SeedGenerator.generateRecords(
                List.of("Alice", "Bob"), List.of("Smith", "Jones"), 20, new Random(7));

        seedService.insert(records);
        seedService.insert(records);

        assertThat(repository.count()).isEqualTo(20);
    }
}
