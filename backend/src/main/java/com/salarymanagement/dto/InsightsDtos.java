package com.salarymanagement.dto;

import com.salarymanagement.model.Employee;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Response shapes for the /insights endpoints. The secondary constructors match the
 * JPQL aggregate result types (BigDecimal min/max, Double avg, Long count).
 */
public final class InsightsDtos {

    private InsightsDtos() {
    }

    public record CountrySalaryStats(String country, double minSalary, double maxSalary,
                                     double avgSalary, long employeeCount) {
        public CountrySalaryStats(String country, BigDecimal minSalary, BigDecimal maxSalary,
                                  Double avgSalary, Long employeeCount) {
            this(country, minSalary.doubleValue(), maxSalary.doubleValue(), round(avgSalary), employeeCount);
        }
    }

    public record JobTitleSalaryStats(String jobTitle, String country, double avgSalary, long employeeCount) {
        public JobTitleSalaryStats(String jobTitle, String country, Double avgSalary, Long employeeCount) {
            this(jobTitle, country, round(avgSalary), employeeCount.longValue());
        }
    }

    public record CountryHeadcount(String country, long employeeCount) {
        public CountryHeadcount(String country, Long employeeCount) {
            this(country, employeeCount.longValue());
        }
    }

    public record DepartmentSummary(String department, double avgSalary, double minSalary,
                                    double maxSalary, long employeeCount) {
        public DepartmentSummary(String department, Double avgSalary, BigDecimal minSalary,
                                 BigDecimal maxSalary, Long employeeCount) {
            this(department, round(avgSalary), minSalary.doubleValue(), maxSalary.doubleValue(), employeeCount);
        }
    }

    public record TopEarner(String id, String fullName, String jobTitle, String country,
                            String department, BigDecimal salary) {
        public static TopEarner from(Employee e) {
            return new TopEarner(e.getId(), e.getFullName(), e.getJobTitle(), e.getCountry(),
                    e.getDepartment(), e.getSalary());
        }
    }

    private static double round(Double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
