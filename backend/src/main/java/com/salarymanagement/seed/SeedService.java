package com.salarymanagement.seed;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SeedService {

    private static final Timestamp SEEDED_AT = Timestamp.valueOf(LocalDateTime.of(2024, 1, 1, 0, 0));

    private static final String INSERT_SQL = """
            INSERT INTO employees
              (id, full_name, job_title, country, salary, department, email,
               hire_date, employment_type, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;

    private final JdbcTemplate jdbcTemplate;

    public SeedService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /** Truncates and bulk-inserts in a single transaction, so re-running is safe. */
    @Transactional
    public void insert(List<SeedRecord> records) {
        jdbcTemplate.update("DELETE FROM employees");
        jdbcTemplate.batchUpdate(INSERT_SQL, records, 1000, (ps, r) -> {
            ps.setString(1, r.id());
            ps.setString(2, r.fullName());
            ps.setString(3, r.jobTitle());
            ps.setString(4, r.country());
            ps.setBigDecimal(5, r.salary());
            ps.setString(6, r.department());
            ps.setString(7, r.email());
            ps.setDate(8, Date.valueOf(r.hireDate()));
            ps.setString(9, r.employmentType().getValue());
            ps.setBoolean(10, true);
            ps.setTimestamp(11, SEEDED_AT);
            ps.setTimestamp(12, SEEDED_AT);
        });
    }
}
