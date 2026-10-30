# Implementation plan

## Status: READY FOR PLAN APPROVAL

ADRs 001–015 are accepted. This plan uses the approved modular monolith, Drizzle, Auth.js Credentials, PostgreSQL worker queue, Zod, and Vitest baseline. No implementation task has started.

## Budget and execution rules

- Recorded work through planning start: about 48 minutes; remaining hard-cap budget: about 3h12m.
- Planned execution: 2h51m; reserve about 21m for debugging, integration failures, README, and clean-clone verification.
- A task is **VERIFIED** only after its stated command is recorded with results.
- Make one small meaningful commit per verified milestone only when Git is available. Never manufacture commits.
- Stop for approval if an accepted ADR changes, a major dependency is needed, a material security/reliability issue is unsolved, or the cap is reached.

## Milestones and dependency order

| Milestone | Scope | Estimate | Depends on | Completion evidence |
| --- | --- | ---: | --- | --- |
| M1 | Foundation, database, seeded auth | 45m | Existing config | App baseline, Docker DB, migration/seed, login. |
| M2 | State machine and idempotent creation | 35m | M1 | Required unit + PostgreSQL creation integration tests. |
| M3 | Provider strategies and safe worker | 35m | M2 | Controlled success/failure and claim-concurrency evidence. |
| M4 | Admin list, retry, audit | 18m | M2, M3 | Filter/page/retry authorization evidence. |
| M5 | Customer experience | 18m | M2, M3 | Create/list/detail with mailbox/audit display. |
| M6 | Verification and delivery | 20m | M1–M5 | Full checks, README, smoke/demo checklist. |

**Critical path:** M1 → M2 → M3 → M4 → M5 → M6. M4/M5 may overlap only after M3 service contracts stabilize.

## Atomic tasks

### M1 — Foundation, database, and authentication

| ID | Title | Priority | Requirements | Dependencies | Expected files | Steps, tests, definition of done | Estimate | Status |
| --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| P0-01 | Reconcile project foundation | P0 | TD-01, TD-03 | External config | `package.json`, workspace/config files, `src/app/*`, `components.json` | Preserved external config; added minimal App Router shell; initialized shadcn config/components; ran `pnpm typecheck` and `pnpm lint` (one non-blocking config warning). Done: baseline compiles. | 10m | VERIFIED |
| P0-02 | Configure dev/test PostgreSQL | P0 | TD-01–03, NFR-03 | P0-01 | Compose/env/Drizzle config | Compose config validates and dev/test targets are distinct. `docker compose up -d` is blocked while `postgres:17-alpine` image pull remains incomplete. | 8m | BLOCKED |
| P0-03 | Schema, migrations, seeds | P0 | FR-01, TD-02, ADR-014–015 | P0-02 | `src/db/schema.ts`, `src/db/client.ts`, `src/db/seed.ts`, `drizzle/*` | Schema/client/seed source prepared; generate and run clean migration/seed once pnpm dependencies are available. Done: schema and logins inspectable. | 17m | IN PROGRESS |
| P1-01 | Authentication and actor guards | P1 | FR-01–02, ADR-009 | P0-03 | `src/auth/*`, auth route, tests | Credentials/JWT configuration and actor guards are implemented and typecheck clean. Database-backed login smoke/test remains blocked on migration/seed. Done: role server-readable. | 10m | IN PROGRESS |

**Boundary:** M1 owns configuration, DB, seed, and auth only. No order behavior in routes. Continue only after migration/seed/login evidence.

### M2 — Core domain and order creation

| ID | Title | Priority | Requirements | Dependencies | Expected files | Steps, tests, definition of done | Estimate | Status |
| --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| P0-04 | State machine test-first | P0 | FR-05–06, NFR-03 | P0-03 | `src/domain/orders/*`, `tests/unit/order-state-machine.test.ts` | Added valid/invalid transition coverage and ran focused Vitest. Done: 16 cases pass; domain has no DB/UI import. | 8m | VERIFIED |
| P0-05 | Repositories and atomic audit | P0 | FR-02, FR-06, ADR-006, ADR-015 | P0-03, P0-04 | `src/repositories/*`, integration tests | Customer-scoped reads, transaction helpers, atomic `audit_sequence`/event inserts. Test rollback/ordering. Done: no `MAX(sequence)` logic. | 8m | NOT STARTED |
| P0-06 | Idempotent create-order service | P0 | FR-03–04, FR-13, ADR-003, ADR-012 | P0-04, P0-05, P1-01 | create service, schemas/errors, integration test | Write PostgreSQL test first; validate, fingerprint, insert key/order/mailboxes atomically; replay same payload/conflict changed payload. Done: T-REQ-02, T-01–03, T-14 pass. | 15m | NOT STARTED |
| P0-07 | Customer order API/read service | P0 | FR-02, FR-11, FR-13 | P0-06 | `src/app/api/orders/*`, read service | Thin actor/schema/service adapters; test ownership/errors. Done: customer cannot read another customer’s order. | 4m | NOT STARTED |

**Boundary:** M2 owns domain, persistence, audit, idempotency, customer-scoped API. It excludes worker/UI logic. Continue only after required creation tests pass.

### M3 — Provider abstraction and worker

| ID | Title | Priority | Requirements | Dependencies | Expected files | Steps, tests, definition of done | Estimate | Status |
| --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| P0-08 | Durable mock strategies | P0 | FR-07, ADR-007, ADR-014 | P0-03 | `src/providers/*`, provider tests | Contract/selector; persist one result per attempt key; normal delay plus injected outcomes. Done: T-17 passes and provider extension does not edit worker flow. | 10m | NOT STARTED |
| P0-09 | Claim, renewal, fenced writes | P0 | FR-08–09, ADR-004, ADR-011, ADR-015 | P0-05, P0-08 | queue repo, provision service, tests | `SKIP LOCKED`/conditional claim, 45s lease, token/generation predicates, reclaim event. Done: T-09, T-10, T-15, T-19, T-20 pass. | 17m | NOT STARTED |
| P0-10 | Worker loop and terminal outcomes | P0 | FR-05–09, ADR-001–002 | P0-09 | worker entry/service tests | Process eligible mailboxes, retain ACTIVE rows, finalize only correctly; provider calls outside transactions. Smoke `worker:once`. Done: controlled success/failure/audit works. | 8m | NOT STARTED |

**Boundary:** M3 owns provider/ledger/claims/worker. It cannot bypass state domain validation. Continue only after duplicate and stale-worker tests pass.

### M4 — Admin operations

| ID | Title | Priority | Requirements | Dependencies | Expected files | Steps, tests, definition of done | Estimate | Status |
| --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| P1-02 | Admin queries/API | P1 | FR-02, FR-12, FR-13 | P0-05, P1-01 | admin service/routes | Bounded status/provider filters, pagination, detail, admin guard. Done: T-18 cases pass. | 8m | NOT STARTED |
| P1-03 | Failed-order retry | P1 | FR-05–06, FR-10, ADR-002, ADR-005, ADR-015 | P0-10, P1-02 | retry service/route/tests | Atomically failed-only retry; retain active rows; rotate failed keys; audit. Done: T-11 and T-21 pass. | 10m | NOT STARTED |

**Boundary:** M4 owns admin routes/services only; it reuses worker/state logic rather than duplicating it.

### M5 — Customer experience

| ID | Title | Priority | Requirements | Dependencies | Expected files | Steps, tests, definition of done | Estimate | Status |
| --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| P1-04 | Customer pages/form | P1 | FR-03, FR-11, FR-13 | P0-07, P1-01 | customer pages/components, `src/components/ui/*` | List/create/detail using only needed shadcn/ui primitives; safe validation/replay errors; mailbox/audit display. Done: seeded customer completes journey. | 10m | NOT STARTED |
| P1-05 | Admin page controls | P1 | FR-10, FR-12 | P1-02, P1-03 | admin pages/components, `src/components/ui/*` | Filters, pagination, detail/audit, retry with shadcn/ui primitives and conflict feedback. Done: manual T-12 evidence. | 8m | NOT STARTED |

**Boundary:** Components present state only; no authorization, transition, or database business logic. Skip dashboards, charts, animation, and unlisted views.

### M6 — Verification and delivery

| ID | Title | Priority | Requirements | Dependencies | Expected files | Steps, tests, definition of done | Estimate | Status |
| --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| P0-11 | Regression/reliability verification | P0 | NFR-02–03, TD-01–03 | M1–M5 | tests/docs status | Run typecheck, lint, unit/integration, build, migration/seed, worker/app smoke; record exits/blockers. Done: fresh evidence. | 10m | NOT STARTED |
| P1-06 | Delivery docs/demo checklist | P1 | TD-04, TD-07–10 | P0-11 | `README.md`, docs | Document clean clone, env, Docker, migration/seed, app/worker, logins, tests, limitations; update actual architecture/worklog; add real demo link only when available. | 10m | NOT STARTED |

## Testing workflow

For each task: identify behavior → write/update focused test where practical → implement → run focused test → inspect change → update plan/worklog. Required coverage is P0-04 (`T-REQ-01`) and P0-06 (`T-REQ-02`). PostgreSQL, not mocks, proves idempotency, audit atomicity, claim fencing, and worker concurrency.

## Fallback strategy

1. Never cut M1–M3 correctness, required tests, or the admin retry/audit path.
2. If behind, deliver minimal semantic M5 pages before dropping core reliability tests.
3. Use remaining buffer only for polish and manual scenarios; do not add scope.
4. At cap, stop, mark incomplete tasks accurately, and list limitations.

## Progress summary

- Completed: none. Current: awaiting plan approval.
- Task count: 17 atomic tasks — 11 P0 and 6 P1.
- TD-05 resolved: Claude Code is the sole AI tool, matching the brief.
- Constraint: externally created foundation/config files must be preserved and validated in P0-01, not regenerated.
