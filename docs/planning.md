# Planning Notes

## Requirements Analysis

The assessment asked for a salary management tool for an HR Manager at a 10,000-employee org.
This repository rebuilds an earlier Python (FastAPI) + React implementation on a Java + Angular
stack, keeping the same features, API contract, and UI.

Key constraints identified upfront:

- **Scale**: 10k employees — enough to need pagination and indexed queries, not enough to need a heavy DB
- **User persona**: HR Manager — needs to find, compare, and manage employee records quickly
- **Seed performance**: "engineers run this regularly" — bulk insert, not ORM row-by-row
- **Full-stack**: both backend API and UI required
- **Same contract as the original**: identical endpoints, query params, snake_case JSON, and `{"detail": ...}` errors, so the behaviour is directly comparable

---

## Decisions Made Before Writing Code

### 1. Tech stack
Java 21 + Spring Boot and Angular + TypeScript. Versions were checked before starting rather than
assumed: Spring Boot 3.x and Angular 18 were already out of support, so the project uses
**Spring Boot 4.1** and **Angular 21** (the newest Angular that runs on the local Node version).
- Spring Boot: mature REST + validation + JPA support; springdoc provides the same Swagger UI at `/docs`
- Angular standalone components + signals: no NgModules, fine-grained reactivity without a state library
- SQLite kept from the original — zero ops, and the same data model

### 2. Architecture: layered backend
Decided on `controller → service → repository → model` before writing anything.
- Controllers: HTTP concerns only (params, validation, status codes)
- Services: all business logic and queries
- Repositories: Spring Data queries, JPQL aggregates for insights
- DTOs as Java records, separate from the JPA entity, so the API shape never leaks persistence details

### 3. TDD from the start
Wrote failing tests before each component — model, CRUD API, seed generator, insights API, each
frontend service, component, and page. This caught real problems early:
- SQLite constraint errors surfaced as a generic JPA error instead of an integrity violation, so a
  duplicate email would have returned 500 instead of 409 — fixed with a small dialect subclass
- A class-level `@Validated` turned an invalid `page_size` into a 500 instead of a 422

### 4. Soft delete
Chose an `is_active` flag over hard delete. Reasons:
- Seed script can truncate + re-insert without FK issues
- HR data shouldn't be permanently destroyed accidentally
- No extra migration needed later if audit log is required

### 5. Single currency (USD)
All salaries stored in USD. Alternatives considered:
- Store local currency + exchange rate → complex, exchange rates change
- Store local currency only → can't compare salaries across countries meaningfully
- USD baseline → simple, consistent, standard in global HR tools

### 6. Seed performance strategy
- JPA `save()` per row → persistence-context overhead and per-row work → too slow at 10k
- `JdbcTemplate.batchUpdate` inside one transaction → fast
Result: ~0.5s for 10,000 rows, most of it JVM warm-up (generation ~0.13s).

---

## Commit Strategy

The commit sequence follows the history of the original Python/React version, one commit per
step, so the evolution of the solution is visible and comparable:
1. Scaffold
2. Model (TDD)
3. CRUD API (TDD)
4. Seed script
5. Insights API (TDD)
6. Frontend scaffold + API client
7. Test runner switch (Vitest → Jest + Angular Testing Library)
8. Employee list UI
9. Add/edit/delete UI
10. Insights dashboard
11. Docker + docs

Post-plan additions (based on testing the live app):
- Country/department/job title dropdowns (from live DB, not hardcoded)
- Server-side column sorting (salary, hire date)
- Indigo/blue colour theme (later replaced by a teal/slate theme with initials avatars and a highlighted #1 top earner)
- Email and hire date columns in table
- "Avg salary by job title in a country" section added to Insights UI (the API endpoint existed from the insights commit; the dashboard section was added here, following the original project's sequence, where this gap was caught during a requirements review)
- Seed folder auto-detection — the seed finds its name files from `backend/` (`../seed`), the repo root (`seed`) or Docker (`/seed`)

Two commits from the original history have no equivalent here, so they were dropped rather than invented:
- Converting PostCSS/Tailwind configs to CommonJS for Node 16 — Angular's build reads `.postcssrc.json`
  and Tailwind v4 needs no config file
- Mocking the meta API in the Employees page tests — the same problem did occur here, but it was fixed
  in the dropdowns commit itself, so no tests were ever committed failing

One fix was added that the original doesn't have: the employee table now scrolls sideways on narrow
screens instead of clipping its last columns.

Every commit was reviewed and approved before it was made, and before it was pushed.

---

## What I Would Add With More Time

- **Authentication** — Spring Security with JWT login for HR managers; role-based access
- **Audit log** — track who changed what and when
- **Schema migrations** — Flyway instead of Hibernate `ddl-auto=update`
- **Bulk import** — CSV upload to add many employees at once
- **Export** — download filtered results as CSV/Excel
- **Charts** — salary distribution histogram on insights page
- **PostgreSQL** — for production multi-user concurrent write support
