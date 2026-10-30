package com.salarymanagement.controller;

import com.salarymanagement.dto.EmployeeCreate;
import com.salarymanagement.dto.EmployeeListResponse;
import com.salarymanagement.dto.EmployeeResponse;
import com.salarymanagement.dto.EmployeeUpdate;
import com.salarymanagement.exception.NotFoundException;
import com.salarymanagement.model.Employee;
import com.salarymanagement.service.EmployeeService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/employees")
public class EmployeeController {

    private static final String NOT_FOUND = "Employee not found";

    private final EmployeeService service;

    public EmployeeController(EmployeeService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmployeeResponse createEmployee(@Valid @RequestBody EmployeeCreate data) {
        return EmployeeResponse.from(service.createEmployee(data));
    }

    @GetMapping
    public EmployeeListResponse listEmployees(
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(name = "page_size", defaultValue = "20") @Min(1) @Max(100) int pageSize,
            @RequestParam(required = false) String country,
            @RequestParam(name = "job_title", required = false) String jobTitle,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String search,
            @RequestParam(name = "sort_by", defaultValue = "full_name") String sortBy,
            @RequestParam(name = "sort_order", defaultValue = "asc") String sortOrder) {
        Page<Employee> result = service.listEmployees(
                page, pageSize, country, jobTitle, department, search, sortBy, sortOrder);
        return new EmployeeListResponse(
                result.map(EmployeeResponse::from).getContent(),
                result.getTotalElements(),
                page,
                pageSize);
    }

    @GetMapping("/{id}")
    public EmployeeResponse getEmployee(@PathVariable String id) {
        return service.getEmployee(id)
                .map(EmployeeResponse::from)
                .orElseThrow(() -> new NotFoundException(NOT_FOUND));
    }

    @PutMapping("/{id}")
    public EmployeeResponse updateEmployee(@PathVariable String id, @Valid @RequestBody EmployeeUpdate data) {
        return service.updateEmployee(id, data)
                .map(EmployeeResponse::from)
                .orElseThrow(() -> new NotFoundException(NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEmployee(@PathVariable String id) {
        if (!service.deleteEmployee(id)) {
            throw new NotFoundException(NOT_FOUND);
        }
    }
}
