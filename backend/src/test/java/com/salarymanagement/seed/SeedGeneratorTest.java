package com.salarymanagement.seed;

import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class SeedGeneratorTest {

    private static final List<String> FIRST = List.of("Alice", "Bob", "Carol", "Dave", "Eve");
    private static final List<String> LAST = List.of("Smith", "Jones", "Brown", "Taylor", "Wilson");

    @Test
    void generatesCorrectCount() {
        assertThat(SeedGenerator.generateRecords(FIRST, LAST, 100)).hasSize(100);
    }

    @Test
    void allEmailsAreUnique() {
        List<SeedRecord> records = SeedGenerator.generateRecords(FIRST, LAST, 500);
        Set<String> emails = new HashSet<>();
        records.forEach(r -> emails.add(r.email()));
        assertThat(emails).hasSize(records.size());
    }

    @Test
    void allRequiredFieldsPresent() {
        for (SeedRecord r : SeedGenerator.generateRecords(FIRST, LAST, 10)) {
            assertThat(r.id()).isNotBlank();
            assertThat(r.fullName()).isNotBlank();
            assertThat(r.jobTitle()).isNotBlank();
            assertThat(r.country()).isNotBlank();
            assertThat(r.salary()).isNotNull();
            assertThat(r.department()).isNotBlank();
            assertThat(r.email()).isNotBlank();
            assertThat(r.hireDate()).isNotNull();
            assertThat(r.employmentType()).isNotNull();
        }
    }

    @Test
    void salaryWithinJobTitleRange() {
        for (SeedRecord r : SeedGenerator.generateRecords(FIRST, LAST, 200)) {
            SeedGenerator.SalaryRange range = SeedGenerator.JOB_TITLES.get(r.jobTitle());
            assertThat(r.salary().doubleValue()).isBetween((double) range.min(), (double) range.max());
        }
    }

    @Test
    void departmentMatchesJobTitle() {
        for (SeedRecord r : SeedGenerator.generateRecords(FIRST, LAST, 100)) {
            assertThat(r.department()).isEqualTo(SeedGenerator.JOB_TITLE_TO_DEPARTMENT.get(r.jobTitle()));
        }
    }

    @Test
    void employmentTypeIsValid() {
        Set<String> valid = Set.of("full_time", "part_time", "contract");
        for (SeedRecord r : SeedGenerator.generateRecords(FIRST, LAST, 100)) {
            assertThat(valid).contains(r.employmentType().getValue());
        }
    }

    @Test
    void isDeterministicWithFixedSeed() {
        List<SeedRecord> r1 = SeedGenerator.generateRecords(FIRST, LAST, 10, new Random(42));
        List<SeedRecord> r2 = SeedGenerator.generateRecords(FIRST, LAST, 10, new Random(42));
        assertThat(r1).extracting(SeedRecord::fullName)
                .containsExactlyElementsOf(r2.stream().map(SeedRecord::fullName).toList());
    }
}
