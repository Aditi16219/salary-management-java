package com.salarymanagement.repository;

import com.salarymanagement.dto.InsightsDtos.CountryHeadcount;
import com.salarymanagement.dto.InsightsDtos.CountrySalaryStats;
import com.salarymanagement.dto.InsightsDtos.DepartmentSummary;
import com.salarymanagement.dto.InsightsDtos.JobTitleSalaryStats;
import com.salarymanagement.model.Employee;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, String>, JpaSpecificationExecutor<Employee> {

    Optional<Employee> findByIdAndActiveTrue(String id);

    @Query("""
            select new com.salarymanagement.dto.InsightsDtos$CountrySalaryStats(
                e.country, min(e.salary), max(e.salary), avg(e.salary), count(e))
            from Employee e where e.active = true
            group by e.country order by e.country""")
    List<CountrySalaryStats> salaryByCountry();

    @Query("""
            select new com.salarymanagement.dto.InsightsDtos$JobTitleSalaryStats(
                e.jobTitle, e.country, avg(e.salary), count(e))
            from Employee e where e.active = true and e.country = :country
            group by e.jobTitle, e.country order by e.jobTitle""")
    List<JobTitleSalaryStats> salaryByJobTitle(String country);

    @Query("""
            select new com.salarymanagement.dto.InsightsDtos$CountryHeadcount(e.country, count(e))
            from Employee e where e.active = true
            group by e.country order by count(e) desc""")
    List<CountryHeadcount> headcountByCountry();

    @Query("""
            select new com.salarymanagement.dto.InsightsDtos$DepartmentSummary(
                e.department, avg(e.salary), min(e.salary), max(e.salary), count(e))
            from Employee e where e.active = true
            group by e.department order by e.department""")
    List<DepartmentSummary> departmentSummary();

    List<Employee> findByActiveTrueOrderBySalaryDesc(Limit limit);
}
