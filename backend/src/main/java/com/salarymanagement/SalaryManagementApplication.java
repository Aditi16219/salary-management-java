package com.salarymanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Arrays;

@SpringBootApplication
public class SalaryManagementApplication {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(SalaryManagementApplication.class);
        // Seeding is a one-off job: skip the web server so it can run alongside the API.
        if (Arrays.asList(args).contains("--seed")) {
            app.setWebApplicationType(WebApplicationType.NONE);
        }
        app.run(args);
    }
}
