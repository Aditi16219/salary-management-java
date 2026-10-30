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

## Demo

📹 **Video demo:** https://www.loom.com/share/fcf9840b02c2400daf0606354ed96b44

The demo covers: employee list with search/filter/sort, add/edit/delete, and the insights dashboard.

---

## Deployment

The application is fully containerised via Docker Compose and can be deployed on any machine or cloud VM with Docker installed.

```bash
docker-compose up --build
```

This starts:
- **Frontend** at http://localhost:3000
- **Backend API** at http://localhost:8000
- **API docs (Swagger)** at http://localhost:8000/docs

The SQLite database is stored in `./data/salary.db` on the host, so data survives container restarts.

To deploy on a cloud VM (e.g. AWS EC2, DigitalOcean):
1. Install Docker + docker-compose on the VM
2. Clone the repo
3. Run `docker-compose up --build -d`
4. Seed: `docker-compose exec backend java -jar app.jar --seed`
5. Open it through an SSH tunnel, so the browser still talks to `localhost`:
   ```bash
   ssh -L 3000:localhost:3000 -L 8000:localhost:8000 user@<vm-ip>
   ```
   then browse to http://localhost:3000

> **Public access note:** the frontend calls the API at `http://localhost:8000` (`frontend/src/app/api/api-config.ts`) and the backend only allows CORS from `http://localhost:3000` (`backend/.../config/CorsConfig.java`). To serve it directly on the VM's public IP or a domain, change both to that host.

> **Database note:** SQLite is used for simplicity. For a multi-user production deployment, point `DATABASE_URL` at a PostgreSQL instance and add the PostgreSQL JDBC driver to `pom.xml` (switching the Hibernate dialect accordingly) — no changes to the application code itself.

---

## Quick Start

### Option A — Docker (recommended)

```bash
docker-compose up --build
```

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

> The seed auto-detects where the name files are — `../seed` when run from `backend/`, `seed` from the repo root, `/seed` inside Docker — and prints the folder it used. To use another folder, pass `--seed.dir=<path>`.

---

## Running Tests

**Backend (55 tests)**

```bash
cd backend
./mvnw test                  # Windows: mvnw.cmd test
```

**Frontend (58 tests)**

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
- Filter by country, department, and job title (populated from live data)
- Sort by salary or hire date (ascending / descending) — server-side across all records
- Paginated table (20 per page)
- Soft delete (employees are deactivated, not removed)
- Color-coded employment type badges (Full Time · Part Time · Contract)

### Salary Insights Dashboard
- Global summary: total headcount, avg salary, highest salary, top country
- Salary by country: min / avg / max per country
- **Avg salary by job title in a country** — interactive country selector updates table instantly
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
| GET | `/employees` | List employees (paginated, filterable, sortable) |
| POST | `/employees` | Create employee |
| GET | `/employees/{id}` | Get employee |
| PUT | `/employees/{id}` | Update employee |
| DELETE | `/employees/{id}` | Soft delete employee |
| GET | `/insights/salary-by-country` | Salary stats per country |
| GET | `/insights/salary-by-jobtitle?country=X` | Avg salary per job title in country |
| GET | `/insights/headcount-by-country` | Employee count per country |
| GET | `/insights/department-summary` | Salary stats per department |
| GET | `/insights/top-earners` | Top N earners |
| GET | `/meta/countries` | Distinct countries from active employees |
| GET | `/meta/departments` | Distinct departments from active employees |
| GET | `/meta/job-titles` | Distinct job titles from active employees |

### Query params for `GET /employees`

| Param | Default | Description |
|---|---|---|
| `page` | 1 | Page number |
| `page_size` | 20 | Results per page (max 100) |
| `search` | — | Search name, email, or job title |
| `country` | — | Filter by exact country |
| `department` | — | Filter by exact department |
| `job_title` | — | Filter by exact job title |
| `sort_by` | `full_name` | Column to sort (`salary`, `hire_date`, `full_name`, `country`, `job_title`) |
| `sort_order` | `asc` | `asc` or `desc` |

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
│   │   ├── controller/      # REST controllers (employees, insights, meta)
│   │   ├── exception/       # {"detail": ...} error handling
│   │   ├── config/          # CORS + SQLite dialect
│   │   └── seed/            # Seed data generator + bulk insert
│   ├── src/test/java/       # 55 JUnit tests
│   ├── Dockerfile           # Multi-stage: JDK build → JRE runtime
│   ├── pom.xml
│   └── mvnw / mvnw.cmd      # Maven Wrapper (no Maven install needed)
├── frontend/
│   ├── src/app/
│   │   ├── api/             # Typed HttpClient services
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level page components
│   │   ├── models/          # TypeScript interfaces
│   │   └── **/*.spec.ts     # 58 Jest tests
│   ├── Dockerfile
│   ├── angular.json
│   └── package.json
├── seed/
│   ├── seed.sh / seed.cmd   # Run the seed (--seed flag)
│   ├── first_names.txt
│   └── last_names.txt
├── docs/
│   ├── planning.md          # Planning notes and design decisions
│   ├── architecture.md      # Architecture, trade-offs, performance
│   └── ai-usage.md          # AI tool usage and prompts
├── data/                    # SQLite database (Docker volume)
├── .gitignore
├── docker-compose.yml
└── README.md
```
