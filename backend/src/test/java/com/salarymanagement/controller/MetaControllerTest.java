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

import static org.hamcrest.Matchers.contains;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MetaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EmployeeRepository repository;

    @BeforeEach
    void cleanDatabase() {
        repository.deleteAll();
    }

    /** Creates an employee and returns its id. */
    private String emp(String email, String country, String department) throws Exception {
        String payload = """
                {"full_name":"Test User","job_title":"Engineer","country":"%s","salary":"80000.00",
                 "department":"%s","email":"%s","hire_date":"2022-01-01","employment_type":"full_time"}
                """.formatted(country, department, email);
        String body = mockMvc.perform(post("/employees").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.id");
    }

    @Test
    void countriesAreDistinctAndSorted() throws Exception {
        emp("a@x.com", "USA", "Engineering");
        emp("b@x.com", "India", "Engineering");
        emp("c@x.com", "USA", "Design");

        mockMvc.perform(get("/meta/countries"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(contains("India", "USA")));
    }

    @Test
    void departmentsAreDistinctAndSorted() throws Exception {
        emp("a@x.com", "USA", "Engineering");
        emp("b@x.com", "USA", "Design");
        emp("c@x.com", "India", "Engineering");

        mockMvc.perform(get("/meta/departments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(contains("Design", "Engineering")));
    }

    @Test
    void metaExcludesInactiveEmployees() throws Exception {
        emp("a@x.com", "USA", "Engineering");
        String id = emp("b@x.com", "Japan", "Legal");
        mockMvc.perform(delete("/employees/{id}", id));

        mockMvc.perform(get("/meta/countries")).andExpect(jsonPath("$").value(contains("USA")));
        mockMvc.perform(get("/meta/departments")).andExpect(jsonPath("$").value(contains("Engineering")));
    }
}
