package com.salarymanagement.service;

import com.salarymanagement.dto.InsightsDtos.CountryHeadcount;
import com.salarymanagement.dto.InsightsDtos.CountrySalaryStats;
import com.salarymanagement.dto.InsightsDtos.DepartmentSummary;
import com.salarymanagement.dto.InsightsDtos.JobTitleSalaryStats;
import com.salarymanagement.dto.InsightsDtos.TopEarner;
import com.salarymanagement.repository.EmployeeRepository;
import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Service;

import java.util.List;

/** Salary analytics; all aggregations run in the database over active employees only. */
@Service
public class InsightsService {

    private final EmployeeRepository repository;

    public InsightsService(EmployeeRepository repository) {
        this.repository = repository;
    }

    public List<CountrySalaryStats> salaryByCountry() {
        return repository.salaryByCountry();
    }

    public List<JobTitleSalaryStats> salaryByJobTitle(String country) {
        return repository.salaryByJobTitle(country);
    }

    public List<CountryHeadcount> headcountByCountry() {
        return repository.headcountByCountry();
    }

    public List<DepartmentSummary> departmentSummary() {
        return repository.departmentSummary();
    }

    public List<TopEarner> topEarners(int limit) {
        return repository.findByActiveTrueOrderBySalaryDesc(Limit.of(limit)).stream()
                .map(TopEarner::from)
                .toList();
    }
}
