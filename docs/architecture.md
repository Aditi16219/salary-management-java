# Architecture Notes

## Overview

Three-tier web application: Angular frontend → Spring Boot backend → SQLite database.

```
Browser
  └── Angular 21 (standalone components, signals, Tailwind)
        └── HttpClient services
              └── Spring Boot 4 (Java 21)
                    ├── Spring Data JPA / Hibernate
                    └── SQLite
```

---

## Backend Design

### Layered architecture

```
controller/   ← HTTP boundary: params, validation, status codes
service/      ← Business logic: queries, mutations, aggregations
repository/   ← Spring Data JPA: derived queries, JPQL aggregates, Specifications
model/        ← JPA entity definitions
dto/          ← Java records for request/response contracts (snake_case JSON)
```

Controllers are thin — they delegate to services immediately. Services own all
business rules and return entities or DTO records. This keeps the business logic
testable independently of the web layer.

### Database indexes

The `employees` table has:
- Index on `country` — used by all insights GROUP BY country
- Index on `job_title` — used by job-title filter
- Composite index on `(country, job_title)` — used by salary-by-jobtitle endpoint

### Sorting

Server-side sorting is applied before pagination so results are globally ordered across all 10k records, not just the current page. Supported columns: `salary`, `hire_date`, `full_name`, `country`, `job_title`. The `sort_by` value is mapped through a whitelist of entity properties, so arbitrary input can never reach the query; unknown values fall back to `full_name`. `id` is added as a secondary sort so rows with equal values (e.g. the same salary) keep a stable position across pages.

### Meta endpoints

`/meta/countries`, `/meta/departments`, `/meta/job-titles` return distinct values from active employees. These power the filter dropdowns in the UI and are always in sync with the actual data — no hardcoded lists. If a lookup fails, the UI falls back to an empty dropdown rather than breaking the page.

### Salary by job title in a country

`/insights/salary-by-jobtitle?country=X` is exposed on the Insights dashboard via an interactive country selector. It defaults to the country with the largest headcount; changing the country fires a new request (via `switchMap`, so only the latest selection's response is shown) and updates the table — no page reload. This directly satisfies requirement 2b of the assessment.

### Soft delete

Employees are never removed from the database. `is_active = false` marks
them as deleted. All queries filter on active employees. This preserves
audit history and makes the seed script idempotent (DELETE + re-INSERT is
safe because no FK constraints reference employees).

### Errors

A single `@RestControllerAdvice` maps exceptions to a consistent
`{"detail": "..."}` body: `404` not found, `409` duplicate email, `422`
invalid input. SQLite's constraint errors are mapped by a small dialect
subclass so a duplicate email surfaces as Spring's `DataIntegrityViolationException`.

---

## Frontend Design

### Component hierarchy

```
App
├── Layout (nav)
├── EmployeesPage
│   ├── EmployeeFilters
│   ├── EmployeeTable
│   ├── Pagination
│   └── ConfirmDialog (delete confirmation)
├── AddEmployeePage → EmployeeForm
├── EditEmployeePage → EmployeeForm
└── InsightsPage
    ├── StatCard ×4
    ├── SalaryByCountryTable
    ├── SalaryByJobTitleTable (country selector)
    ├── DepartmentSummaryTable
    └── TopEarnersTable
```

### Data fetching

Page state lives in Angular signals. The employees page derives a query from
its page/search/filter signals and turns it into an observable with
`toObservable` + `switchMap`, so a newer query cancels any in-flight request and
stale responses never overwrite fresh ones. Insights data is loaded in parallel
via `forkJoin` to minimise perceived latency.

### API services

`src/app/api/api-config.ts` holds the backend base URL (an `InjectionToken`)
and a helper that drops empty query params. `EmployeesService` and
`InsightsService` wrap `HttpClient` and return fully-typed observables.

---

## Seed Script Performance

Target: seed 10,000 employees fast enough for regular developer use.

Approach:
1. Generate all 10,000 records in memory (~0.13s)
2. Single `DELETE FROM employees` in the same transaction
3. JDBC batch INSERT via `JdbcTemplate.batchUpdate` (no JPA entity overhead per row)
4. Commit once

Result: **~0.5s total** for 10,000 rows on SQLite, most of it JVM warm-up.

Key: a JDBC batch inside one transaction avoids per-row commits and the JPA
persistence context, which would otherwise dominate the run time.

---

## Trade-offs

| Decision | Alternative | Why this choice |
|---|---|---|
| SQLite | PostgreSQL | Zero ops for a 10k-employee demo; swappable via `DATABASE_URL` plus a driver/dialect change |
| Soft delete | Hard delete | Audit trail; seed idempotency; safer for accidental deletes |
| No auth | Spring Security / OAuth | Out of scope for this assessment; can be added as a filter chain in front of the controllers |
| No pagination on insights | Paginated | Insight aggregations are O(groups), not O(rows); fast at 10k scale |
| Signals + services (no NgRx) | NgRx / signal store | Simple fetch-per-page pattern is sufficient; no cross-page shared state needed |

---

## AI Usage

This project was built using Claude Code (Anthropic), as a Java/Angular rebuild of
an earlier Python/React version. Key interactions:

- **Stack choice** — picked Spring Boot 4 + Angular 21 after checking which versions were still supported
- **TDD** — wrote failing tests for each component first, then implemented to pass
- **Debugging** — SQLite constraint errors not mapping to integrity violations; validation proxy returning 500 instead of 422
- **Verification** — end-to-end checks in a real browser against the seeded backend

All generated code was reviewed before committing. Commit messages
describe the reasoning, not just the diff.
