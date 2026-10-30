package com.salarymanagement.dto;

import java.util.List;

public record EmployeeListResponse(
        List<EmployeeResponse> items,
        long total,
        int page,
        int pageSize
) {
}
