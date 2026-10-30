package com.salarymanagement.controller;

import com.salarymanagement.dto.InsightsDtos.CountryHeadcount;
import com.salarymanagement.dto.InsightsDtos.CountrySalaryStats;
import com.salarymanagement.dto.InsightsDtos.DepartmentSummary;
import com.salarymanagement.dto.InsightsDtos.JobTitleSalaryStats;
import com.salarymanagement.dto.InsightsDtos.TopEarner;
import com.salarymanagement.service.InsightsService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/insights")
public class InsightsController {

    private final InsightsService service;

    public InsightsController(InsightsService service) {
        this.service = service;
    }

    @GetMapping("/salary-by-country")
    public List<CountrySalaryStats> salaryByCountry() {
        return service.salaryByCountry();
    }

    @GetMapping("/salary-by-jobtitle")
    public List<JobTitleSalaryStats> salaryByJobTitle(@RequestParam String country) {
        return service.salaryByJobTitle(country);
    }

    @GetMapping("/headcount-by-country")
    public List<CountryHeadcount> headcountByCountry() {
        return service.headcountByCountry();
    }

    @GetMapping("/department-summary")
    public List<DepartmentSummary> departmentSummary() {
        return service.departmentSummary();
    }

    @GetMapping("/top-earners")
    public List<TopEarner> topEarners(@RequestParam(defaultValue = "10") @Min(1) @Max(100) int limit) {
        return service.topEarners(limit);
    }
}
