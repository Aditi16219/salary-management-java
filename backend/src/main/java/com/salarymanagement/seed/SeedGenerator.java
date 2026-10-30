package com.salarymanagement.seed;

import com.salarymanagement.model.EmploymentType;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

/** Pure, deterministic (given a seeded Random) generator of realistic employee records. */
public final class SeedGenerator {

    public record SalaryRange(int min, int max) {
    }

    public static final List<String> COUNTRIES = List.of(
            "United States", "United Kingdom", "Canada", "Australia", "Germany",
            "France", "India", "Brazil", "Japan", "Singapore", "Netherlands",
            "Sweden", "Switzerland", "Spain", "Italy", "Mexico", "South Korea",
            "New Zealand", "Ireland", "Denmark");

    public static final Map<String, SalaryRange> JOB_TITLES = new LinkedHashMap<>();
    public static final Map<String, String> JOB_TITLE_TO_DEPARTMENT = new HashMap<>();

    static {
        job("Software Engineer", 70_000, 150_000, "Engineering");
        job("Senior Software Engineer", 100_000, 180_000, "Engineering");
        job("Principal Engineer", 140_000, 220_000, "Engineering");
        job("Technical Lead", 110_000, 180_000, "Engineering");
        job("Engineering Manager", 130_000, 200_000, "Engineering");
        job("DevOps Engineer", 80_000, 150_000, "Engineering");
        job("QA Engineer", 60_000, 110_000, "Engineering");
        job("Security Engineer", 90_000, 160_000, "Engineering");
        job("Solution Architect", 120_000, 200_000, "Engineering");
        job("Data Scientist", 85_000, 160_000, "Data");
        job("Data Analyst", 60_000, 110_000, "Data");
        job("Business Analyst", 65_000, 115_000, "Data");
        job("Product Manager", 90_000, 170_000, "Product");
        job("UX Designer", 65_000, 120_000, "Design");
        job("HR Manager", 60_000, 110_000, "Human Resources");
        job("HR Specialist", 45_000, 80_000, "Human Resources");
        job("Financial Analyst", 65_000, 120_000, "Finance");
        job("Sales Manager", 70_000, 130_000, "Sales");
        job("Marketing Manager", 65_000, 125_000, "Marketing");
        job("Operations Manager", 70_000, 120_000, "Operations");
    }

    private static final LocalDate HIRE_START = LocalDate.of(2015, 1, 1);
    private static final LocalDate HIRE_END = LocalDate.of(2024, 12, 31);
    private static final long HIRE_RANGE_DAYS = ChronoUnit.DAYS.between(HIRE_START, HIRE_END);

    private SeedGenerator() {
    }

    private static void job(String title, int min, int max, String department) {
        JOB_TITLES.put(title, new SalaryRange(min, max));
        JOB_TITLE_TO_DEPARTMENT.put(title, department);
    }

    public static List<SeedRecord> generateRecords(List<String> firstNames, List<String> lastNames, int count) {
        return generateRecords(firstNames, lastNames, count, new Random());
    }

    public static List<SeedRecord> generateRecords(List<String> firstNames, List<String> lastNames,
                                                   int count, Random rng) {
        List<String> jobTitles = new ArrayList<>(JOB_TITLES.keySet());
        Map<String, Integer> emailCounters = new HashMap<>();
        List<SeedRecord> records = new ArrayList<>(count);

        for (int i = 0; i < count; i++) {
            String first = pick(firstNames, rng);
            String last = pick(lastNames, rng);
            String jobTitle = pick(jobTitles, rng);
            SalaryRange range = JOB_TITLES.get(jobTitle);

            String key = first.toLowerCase() + "." + last.toLowerCase();
            int n = emailCounters.merge(key, 1, Integer::sum) - 1;
            String email = key + (n > 0 ? n : "") + "@company.com";

            BigDecimal salary = BigDecimal.valueOf(range.min() + rng.nextDouble() * (range.max() - range.min()))
                    .setScale(2, RoundingMode.HALF_UP);
            LocalDate hireDate = HIRE_START.plusDays(rng.nextLong(HIRE_RANGE_DAYS + 1));

            records.add(new SeedRecord(
                    UUID.randomUUID().toString(),
                    first + " " + last,
                    jobTitle,
                    pick(COUNTRIES, rng),
                    salary,
                    JOB_TITLE_TO_DEPARTMENT.get(jobTitle),
                    email,
                    hireDate,
                    employmentType(rng)));
        }
        return records;
    }

    /** Weighted 75 / 10 / 15 split, matching a typical workforce mix. */
    private static EmploymentType employmentType(Random rng) {
        int roll = rng.nextInt(100);
        if (roll < 75) {
            return EmploymentType.FULL_TIME;
        }
        return roll < 85 ? EmploymentType.PART_TIME : EmploymentType.CONTRACT;
    }

    private static <T> T pick(List<T> items, Random rng) {
        return items.get(rng.nextInt(items.size()));
    }
}
