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

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.closeTo;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class InsightsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EmployeeRepository repository;

    @BeforeEach
    void cleanDatabase() {
        repository.deleteAll();
    }

    private String emp(String email, String country, String jobTitle, String salary) throws Exception {
        return emp(email, country, jobTitle, salary, "Engineering");
    }

    /** Creates an employee and returns its id. */
    private String emp(String email, String country, String jobTitle, String salary, String department)
            throws Exception {
        String payload = """
                {"full_name":"Test User","job_title":"%s","country":"%s","salary":"%s",
                 "department":"%s","email":"%s","hire_date":"2022-01-01","employment_type":"full_time"}
                """.formatted(jobTitle, country, salary, department, email);
        String body = mockMvc.perform(post("/employees").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.id");
    }

    private List<Double> topEarnerSalaries(String... params) throws Exception {
        var request = get("/insights/top-earners");
        for (int i = 0; i < params.length; i += 2) {
            request.param(params[i], params[i + 1]);
        }
        String body = mockMvc.perform(request).andReturn().getResponse().getContentAsString();
        List<Number> salaries = JsonPath.read(body, "$[*].salary");
        return salaries.stream().map(Number::doubleValue).toList();
    }

    // --- salary-by-country ---

    @Test
    void salaryByCountryReturnsStats() throws Exception {
        emp("a@x.com", "USA", "Engineer", "50000.00");
        emp("b@x.com", "USA", "Engineer", "70000.00");
        emp("c@x.com", "USA", "Engineer", "90000.00");

        mockMvc.perform(get("/insights/salary-by-country"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.country == 'USA')].min_salary").value(50000.0))
                .andExpect(jsonPath("$[?(@.country == 'USA')].max_salary").value(90000.0))
                .andExpect(jsonPath("$[?(@.country == 'USA')].avg_salary").value(hasItem(closeTo(70000.0, 0.01))))
                .andExpect(jsonPath("$[?(@.country == 'USA')].employee_count").value(3));
    }

    @Test
    void salaryByCountryMultipleCountries() throws Exception {
        emp("a@x.com", "USA", "Engineer", "80000.00");
        emp("b@x.com", "UK", "Engineer", "60000.00");

        mockMvc.perform(get("/insights/salary-by-country"))
                .andExpect(jsonPath("$[*].country").value(hasItems("USA", "UK")));
    }

    @Test
    void salaryByCountryExcludesInactive() throws Exception {
        String id = emp("a@x.com", "USA", "Engineer", "80000.00");
        mockMvc.perform(delete("/employees/{id}", id));

        mockMvc.perform(get("/insights/salary-by-country"))
                .andExpect(jsonPath("$[*].country").value(not(hasItem("USA"))));
    }

    // --- salary-by-jobtitle ---

    @Test
    void salaryByJobTitleInCountry() throws Exception {
        emp("a@x.com", "USA", "Engineer", "90000.00");
        emp("b@x.com", "USA", "Designer", "70000.00");
        emp("c@x.com", "UK", "Engineer", "80000.00");

        mockMvc.perform(get("/insights/salary-by-jobtitle").param("country", "USA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].job_title").value(hasItems("Engineer", "Designer")))
                .andExpect(jsonPath("$[?(@.job_title == 'Engineer')].avg_salary").value(90000.0))
                .andExpect(jsonPath("$[*].country").value(not(hasItem("UK"))));
    }

    @Test
    void salaryByJobTitleRequiresCountry() throws Exception {
        mockMvc.perform(get("/insights/salary-by-jobtitle"))
                .andExpect(status().isUnprocessableContent());
    }

    // --- headcount-by-country ---

    @Test
    void headcountByCountry() throws Exception {
        emp("a@x.com", "USA", "Engineer", "80000.00");
        emp("b@x.com", "USA", "Designer", "70000.00");
        emp("c@x.com", "UK", "Engineer", "75000.00");

        mockMvc.perform(get("/insights/headcount-by-country"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.country == 'USA')].employee_count").value(2))
                .andExpect(jsonPath("$[?(@.country == 'UK')].employee_count").value(1));
    }

    // --- department-summary ---

    @Test
    void departmentSummary() throws Exception {
        emp("a@x.com", "USA", "Engineer", "80000.00", "Engineering");
        emp("b@x.com", "USA", "Engineer", "100000.00", "Engineering");
        emp("c@x.com", "USA", "Designer", "60000.00", "Design");

        mockMvc.perform(get("/insights/department-summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.department == 'Engineering')].employee_count").value(2))
                .andExpect(jsonPath("$[?(@.department == 'Engineering')].avg_salary")
                        .value(hasItem(closeTo(90000.0, 0.01))))
                .andExpect(jsonPath("$[?(@.department == 'Design')].employee_count").value(1));
    }

    // --- top-earners ---

    @Test
    void topEarnersReturnsSortedDesc() throws Exception {
        String[] salaries = {"50000", "90000", "70000", "110000", "80000"};
        for (int i = 0; i < salaries.length; i++) {
            emp("u" + i + "@x.com", "USA", "Engineer", salaries[i] + ".00");
        }

        assertThat(topEarnerSalaries()).containsExactly(110000.0, 90000.0, 80000.0, 70000.0, 50000.0);
    }

    @Test
    void topEarnersRespectsLimit() throws Exception {
        for (int i = 0; i < 10; i++) {
            emp("u" + i + "@x.com", "USA", "Engineer", (50000 + i * 1000) + ".00");
        }

        assertThat(topEarnerSalaries("limit", "3")).hasSize(3);
    }

    @Test
    void topEarnersExcludesInactive() throws Exception {
        String id = emp("top@x.com", "USA", "Engineer", "999999.00");
        mockMvc.perform(delete("/employees/{id}", id));

        assertThat(topEarnerSalaries()).doesNotContain(999999.0);
    }
}
