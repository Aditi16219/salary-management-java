# Salary Management

A full-stack salary management tool for HR managers. Manage 10,000+ employees, view salary analytics, and track compensation across countries and departments.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | Java 21 + Spring Boot 4 |
| Database | SQLite + Spring Data JPA (Hibernate) |
| Frontend | Angular 21 + TypeScript + Tailwind CSS |
| Testing | JUnit 5 + MockMvc (backend) · Jest + Angular Testing Library (frontend) |
| Deployment | Docker + docker-compose |

---

## Quick Start

### Option A — Docker (recommended)

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

Seed 10,000 employees (run after containers are up):

```bash
docker-compose exec backend java -jar app.jar --seed
```

### Option B — Local development

Requires **JDK 21** and **Node 20.19+** (or 22/24).

**Backend**

```bash
cd backend
./mvnw spring-boot:run       # macOS/Linux
mvnw.cmd spring-boot:run     # Windows
```

**Frontend**

```bash
cd frontend
npm install
npm start
```

**Seed script**

```bash
./seed/seed.sh               # macOS/Linux
seed\seed.cmd                # Windows
```

---

## Running Tests

**Backend (41 tests)**

```bash
cd backend
./mvnw test                  # Windows: mvnw.cmd test
```

**Frontend (36 tests)**

```bash
cd frontend
npm run test:run
```

---

## Features

### Employee Management
- Add, view, edit, and delete employees
- Fields: full name, email, job title, department, country, salary, hire date, employment type
- Search by name, email, or job title
- Filter by country and department
- Paginated table (20 per page)
- Soft delete (employees are deactivated, not removed)

### Salary Insights Dashboard
- Global summary: total headcount, avg salary, highest salary, top country
- Salary by country: min / avg / max per country
- Department summary: headcount and salary range per department
- Top 10 earners across the organisation

### Seed Script
- Generates and inserts 10,000 realistic employees in **~0.5 seconds**
- Names drawn from `seed/first_names.txt` + `seed/last_names.txt`
- Realistic job titles, departments, countries, and salary ranges
- Idempotent — safe to re-run (clears and re-inserts)

---

## API Reference

Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/employees` | List employees (paginated, filterable) |
| POST | `/employees` | Create employee |
| GET | `/employees/{id}` | Get employee |
| PUT | `/employees/{id}` | Update employee |
| DELETE | `/employees/{id}` | Soft delete employee |
| GET | `/insights/salary-by-country` | Salary stats per country |
| GET | `/insights/salary-by-jobtitle?country=X` | Avg salary per job title in country |
| GET | `/insights/headcount-by-country` | Employee count per country |
| GET | `/insights/department-summary` | Salary stats per department |
| GET | `/insights/top-earners` | Top N earners |

Errors are returned as `{"detail": "..."}` with `404`, `409` (duplicate email), or `422` (invalid input).

Interactive docs (Swagger UI): http://localhost:8000/docs

---

## Project Structure

```
salary-management-java/
├── backend/
│   ├── src/main/java/com/salarymanagement/
│   │   ├── model/           # JPA entity + employment type
│   │   ├── dto/             # Request/response records
│   │   ├── repository/      # Spring Data repository + aggregate queries
│   │   ├── service/         # Business logic layer
│   │   ├── controller/      # REST controllers (employees, insights)
│   │   ├── exception/       # {"detail": ...} error handling
│   │   ├── config/          # CORS + SQLite dialect
│   │   └── seed/            # Seed data generator + bulk insert
│   └── src/test/java/       # 41 JUnit tests
├── frontend/
│   └── src/app/
│       ├── api/             # Typed HttpClient services
│       ├── components/      # Reusable UI components
│       ├── pages/           # Route-level page components
│       ├── models/          # TypeScript interfaces
│       └── **/*.spec.ts     # 36 Jest tests
├── seed/
│   ├── seed.sh / seed.cmd   # Run the seed (--seed flag)
│   ├── first_names.txt
│   └── last_names.txt
└── docker-compose.yml
```
