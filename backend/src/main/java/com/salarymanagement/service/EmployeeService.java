package com.salarymanagement.service;

import com.salarymanagement.dto.EmployeeCreate;
import com.salarymanagement.dto.EmployeeUpdate;
import com.salarymanagement.model.Employee;
import com.salarymanagement.model.EmploymentType;
import com.salarymanagement.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.function.Consumer;

@Service
public class EmployeeService {

    private final EmployeeRepository repository;

    public EmployeeService(EmployeeRepository repository) {
        this.repository = repository;
    }

    public Employee createEmployee(EmployeeCreate data) {
        Employee employee = new Employee();
        employee.setFullName(data.fullName());
        employee.setJobTitle(data.jobTitle());
        employee.setCountry(data.country());
        employee.setSalary(data.salary());
        employee.setDepartment(data.department());
        employee.setEmail(data.email());
        employee.setHireDate(data.hireDate());
        employee.setEmploymentType(data.employmentType() != null ? data.employmentType() : EmploymentType.FULL_TIME);
        return repository.saveAndFlush(employee);
    }

    public Optional<Employee> getEmployee(String id) {
        return repository.findByIdAndActiveTrue(id);
    }

    /** API sort keys mapped to entity properties; anything else falls back to full_name. */
    private static final Map<String, String> SORTABLE_COLUMNS = Map.of(
            "full_name", "fullName",
            "salary", "salary",
            "hire_date", "hireDate",
            "country", "country",
            "job_title", "jobTitle");

    public Page<Employee> listEmployees(int page, int pageSize, String country, String jobTitle,
                                        String department, String search, String sortBy, String sortOrder) {
        Specification<Employee> spec = (root, query, cb) -> cb.isTrue(root.get("active"));

        if (hasText(country)) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("country"), country));
        }
        if (hasText(jobTitle)) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("jobTitle"), jobTitle));
        }
        if (hasText(department)) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("department"), department));
        }
        if (hasText(search)) {
            String pattern = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("fullName")), pattern),
                    cb.like(cb.lower(root.get("email")), pattern),
                    cb.like(cb.lower(root.get("jobTitle")), pattern)
            ));
        }

        String property = SORTABLE_COLUMNS.getOrDefault(sortBy, "fullName");
        Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC;
        // id as a tie-breaker keeps page boundaries stable when many rows share a value.
        Sort sort = Sort.by(direction, property).and(Sort.by("id"));

        return repository.findAll(spec, PageRequest.of(page - 1, pageSize, sort));
    }

    public Optional<Employee> updateEmployee(String id, EmployeeUpdate data) {
        return getEmployee(id).map(employee -> {
            apply(data.fullName(), employee::setFullName);
            apply(data.jobTitle(), employee::setJobTitle);
            apply(data.country(), employee::setCountry);
            apply(data.salary(), employee::setSalary);
            apply(data.department(), employee::setDepartment);
            apply(data.email(), employee::setEmail);
            apply(data.hireDate(), employee::setHireDate);
            apply(data.employmentType(), employee::setEmploymentType);
            return repository.saveAndFlush(employee);
        });
    }

    public boolean deleteEmployee(String id) {
        return getEmployee(id).map(employee -> {
            employee.setActive(false);
            repository.save(employee);
            return true;
        }).orElse(false);
    }

    private static <T> void apply(T value, Consumer<T> setter) {
        if (value != null) {
            setter.accept(value);
        }
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
