# AI Usage Notes

This project was built using **Claude Code** (Anthropic's CLI agent) throughout the entire
development process, as a rebuild of an earlier Python/React version on Java + Angular.

---

## How AI Was Used

### Planning phase
- Described the goal (same app, new stack, built up commit by commit) and asked Claude for a step-by-step plan before any code was written
- Had Claude read the original repository's full commit history and map each commit to its Java/Angular equivalent
- Claude checked current framework versions first and flagged that the initially agreed versions (Spring Boot 3, Angular 18) were out of support; chose Spring Boot 4.1 + Angular 21 instead
- Decided together which original commits had no genuine equivalent (a Node 16-only config fix) rather than inventing changes to match them

### Implementation
- Each commit followed TDD: Claude wrote failing tests first, ran them to see them fail, then implemented until green
- Claude generated the initial implementation for each component
- Every commit was shown for review — files, test results, and the commit message — and only made after approval; every push needed separate approval

### Debugging
- **Duplicate email returned the wrong error** — the community SQLite dialect reports constraint failures as a generic JPA error; Claude traced it to SQLite's result codes and added a dialect subclass so Spring raises `DataIntegrityViolationException` (→ 409)
- **Invalid `page_size` returned 500** — found by a live smoke test, not by the unit tests; a class-level `@Validated` routed validation through a proxy that threw `ConstraintViolationException`. Fixed by relying on Spring MVC's built-in parameter validation (→ 422), with a regression test
- **Maven Wrapper failed on Windows** — its download step couldn't rename the extracted directory; worked around by placing the Maven distribution in the wrapper's cache manually
- **Page tests making real HTTP calls** — adding the dropdown filters made the Employees page tests call `/meta/*` over the network; the tests now stub the service, and the UI falls back to empty dropdowns if a lookup fails
- **Mixed storage risk** — seeded rows are written via JDBC and UI-created rows via Hibernate; if they stored dates or salaries differently, SQLite would sort them into separate clusters. Verified on a real seeded database that API-created rows sort correctly among the 10,000 seeded ones in both directions
- **Seed only worked from one folder** — the seed resolved `../seed` against the working directory, so running it from the repo root failed with a bare `NoSuchFileException` (hit for real while testing). It now searches the `backend/`, repo-root and Docker layouts and fails with a clear message otherwise; verified from all three plus an unrelated folder

### UI iteration
- After seeing the running app, the same post-plan features as the original were added: dropdowns for filters, column sorting, colour theme, extra table columns
- Screenshots of each page were taken with real data and reviewed before committing visual changes

---

## What Was Verified

- All test assertions cover real behaviour (URLs and params sent, sort order, validation, error codes) — not just that functions exist
- The seed script was timed for real: ~0.5s for 10,000 rows
- End-to-end browser checks (headless Edge) against the real backend seeded with 10,000 employees: list, pagination, search, filters, sorting across pages, add with validation, edit, delete with confirmation, duplicate email error, navigation, and no console errors
- Insights dashboard figures cross-checked against the raw API responses
- `docker-compose up --build` tested for real: images build, seeding works inside the container, and the same browser checks pass against the containers
- API responses match what the frontend expects (checked via `/docs`)

---

## Prompts Used

Key instructions given to Claude during development:

```
"Don't start making the changes first let me know the plan of action step by step"
"Commit my code step by step to a new repo from scratch as if build a new project
 on the Java and Angular tech stack"
"Push after each commit but with my permission"
"Ask me before each commit and push"
"Rewrite [the AI usage notes] with how Java/Angular is built"
```

TDD (Red → Green → Refactor) was a standing instruction for all feature work.

These instructions kept the process deliberate — reviewing each step rather than letting the AI run ahead unchecked.

---

## Reflection

Using AI as a coding partner significantly accelerated the rebuild, but the quality came from:
- Clear upfront planning and an agreed commit-by-commit map before writing any code
- Checking assumptions (framework versions, timings, Docker) instead of trusting them
- Testing the live running application, not just trusting the unit tests — the 500-instead-of-422 bug was only found that way
- Being honest in the history: commit messages state measured numbers, and commits with no real equivalent were dropped rather than faked

The AI did not replace engineering judgment — it executed it faster.
