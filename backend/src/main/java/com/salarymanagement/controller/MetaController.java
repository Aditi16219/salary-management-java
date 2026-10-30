package com.salarymanagement.controller;

import com.salarymanagement.repository.EmployeeRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Distinct values from active employees, used to populate UI filter dropdowns. */
@RestController
@RequestMapping("/meta")
public class MetaController {

    private final EmployeeRepository repository;

    public MetaController(EmployeeRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/countries")
    public List<String> countries() {
        return repository.distinctCountries();
    }

    @GetMapping("/departments")
    public List<String> departments() {
        return repository.distinctDepartments();
    }
}
