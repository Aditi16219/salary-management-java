package com.salarymanagement.controller;

import com.jayway.jsonpath.JsonPath;
import com.salarymanagement.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class EmployeeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EmployeeRepository repository;

    @BeforeEach
    void cleanDatabase() {
        repository.deleteAll();
    }

    private String employeePayload(String... overrides) {
        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("full_name", "Jane Doe");
        fields.put("job_title", "Software Engineer");
        fields.put("country", "United States");
        fields.put("salary", "95000.00");
        fields.put("department", "Engineering");
        fields.put("email", "jane.doe@example.com");
        fields.put("hire_date", "2022-01-15");
        fields.put("employment_type", "full_time");
        for (int i = 0; i < overrides.length; i += 2) {
            fields.put(overrides[i], overrides[i + 1]);
        }
        return fields.entrySet().stream()
                .map(e -> "\"" + e.getKey() + "\":\"" + e.getValue() + "\"")
                .collect(Collectors.joining(",", "{", "}"));
    }

    private ResultActions createEmployee(String payload) throws Exception {
        return mockMvc.perform(post("/employees")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload));
    }

    private String createEmployeeId(String payload) throws Exception {
        String body = createEmployee(payload).andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.id");
    }

    @Test
    void createEmployeeReturns201() throws Exception {
        createEmployee(employeePayload())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.full_name").value("Jane Doe"))
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.is_active").value(true));
    }

    @Test
    void createEmployeeWithDuplicateEmailReturns409() throws Exception {
        createEmployee(employeePayload());

        createEmployee(employeePayload())
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Email already exists"));
    }

    @Test
    void getEmployeeReturns200() throws Exception {
        String id = createEmployeeId(employeePayload());

        mockMvc.perform(get("/employees/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id));
    }

    @Test
    void getNonexistentEmployeeReturns404() throws Exception {
        mockMvc.perform(get("/employees/nonexistent-id"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Employee not found"));
    }

    @Test
    void listEmployeesReturnsPaginatedResponse() throws Exception {
        createEmployee(employeePayload("email", "a@example.com"));
        createEmployee(employeePayload("email", "b@example.com"));

        mockMvc.perform(get("/employees"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(2))
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.page").value(1));
    }

    @Test
    void listEmployeesPagination() throws Exception {
        for (int i = 0; i < 5; i++) {
            createEmployee(employeePayload("email", "user" + i + "@example.com"));
        }

        mockMvc.perform(get("/employees").param("page", "1").param("page_size", "3"))
                .andExpect(jsonPath("$.total").value(5))
                .andExpect(jsonPath("$.items.length()").value(3))
                .andExpect(jsonPath("$.page_size").value(3));
    }

    @Test
    void listEmployeesRejectsInvalidPageSize() throws Exception {
        mockMvc.perform(get("/employees").param("page_size", "0"))
                .andExpect(status().isUnprocessableContent());
        mockMvc.perform(get("/employees").param("page_size", "101"))
                .andExpect(status().isUnprocessableContent());
    }

    @Test
    void listEmployeesFilterByCountry() throws Exception {
        createEmployee(employeePayload("email", "us@example.com", "country", "United States"));
        createEmployee(employeePayload("email", "uk@example.com", "country", "United Kingdom"));

        mockMvc.perform(get("/employees").param("country", "United States"))
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.items[0].country").value("United States"));
    }

    @Test
    void listEmployeesSearchByName() throws Exception {
        createEmployee(employeePayload("email", "alice@example.com", "full_name", "Alice Smith"));
        createEmployee(employeePayload("email", "bob@example.com", "full_name", "Bob Jones"));

        mockMvc.perform(get("/employees").param("search", "alice"))
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.items[0].full_name").value("Alice Smith"));
    }

    @Test
    void updateEmployeeSalary() throws Exception {
        String id = createEmployeeId(employeePayload());

        mockMvc.perform(put("/employees/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"salary\":\"110000.00\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.salary").value(110000.0))
                .andExpect(jsonPath("$.full_name").value("Jane Doe"));
    }

    @Test
    void updateNonexistentEmployeeReturns404() throws Exception {
        mockMvc.perform(put("/employees/nonexistent-id")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"salary\":\"110000.00\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteEmployeeReturns204() throws Exception {
        String id = createEmployeeId(employeePayload());

        mockMvc.perform(delete("/employees/{id}", id))
                .andExpect(status().isNoContent());
    }

    @Test
    void deletedEmployeeNotInList() throws Exception {
        String id = createEmployeeId(employeePayload());
        mockMvc.perform(delete("/employees/{id}", id));

        mockMvc.perform(get("/employees"))
                .andExpect(jsonPath("$.total").value(0));
    }

    @Test
    void deleteNonexistentEmployeeReturns404() throws Exception {
        mockMvc.perform(delete("/employees/nonexistent-id"))
                .andExpect(status().isNotFound());
    }
}
