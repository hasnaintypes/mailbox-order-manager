# Test plan

## Status

Planned requirements-derived coverage only. No test code or test command was executed in this phase.

## Required assessment tests

| ID | Requirement links | Level | Scenario and expected outcome | Status |
| --- | --- | --- | --- | --- |
| T-REQ-01 | FR-05, FR-10 | Unit | State machine accepts `PENDING → PROVISIONING`, `PROVISIONING → ACTIVE/FAILED`, and `FAILED → PENDING`; rejects every other transition. | VERIFIED — `pnpm test:unit -- order-state-machine.test.ts` (16 passed) |
| T-REQ-02 | FR-03, FR-04, NFR-02 | PostgreSQL integration | Valid customer creation persists correctly; validation, ownership, and idempotency assertions follow the approved contract. | Planned — explicitly required |

## Recommended critical scenarios

| ID | Requirement links | Level | Scenario and expected outcome | Status |
| --- | --- | --- | --- | --- |
| T-01 | FR-03, FR-13 | Unit/integration | Valid input creates; invalid provider/missing field/count outside 1–50 returns consistent error. | Planned |
| T-02 | FR-04 | Integration | Repeated same creation produces one order only. | Planned |
| T-03 | AQ-03, ADR-003 | Integration | Same idempotency key with different payload is rejected. | Planned |
| T-04 | FR-02 | Integration/e2e | Customer cannot list/view another customer's order; admin can access both. | Planned |
| T-05 | FR-01, FR-02, FR-10 | Integration/e2e | Unauthenticated request rejected; customer cannot retry; admin can retry eligible failure. | Planned |
| T-06 | FR-05, FR-06 | Unit/integration | Successful transition creates one ordered audit event; invalid transition changes neither state nor audit. | Planned |
| T-07 | FR-07, FR-08 | Unit/integration | Provider selection is correct and mailbox outcomes persist/display. | Planned |
| T-08 | FR-07, ADR-007 | Unit | Controlled provider outcomes prove success/failure without random flakiness. | Planned |
| T-09 | FR-09, NFR-02 | PostgreSQL integration | Two worker attempts yield one claim/provisioning execution. | Planned |
| T-10 | ADR-004, ADR-011, ADR-015 | PostgreSQL integration | Expired claim is atomically reclaimed without a public state transition; only new token/generation may persist results. | Planned |
| T-11 | FR-10, ADR-002, ADR-005, ADR-015 | PostgreSQL integration | Retry succeeds only from `FAILED`, preserves active mailboxes, resets failed mailboxes with new attempt keys, and rejects stale/racing retries. | Planned |
| T-12 | FR-11, FR-12 | E2E/manual | Customer screens and admin filters/pagination/audit/retry show correct scoped data. | Planned |
| T-13 | TD-02, TD-03, TD-07 | Manual/smoke | Clean setup starts Postgres, migrates/seeds, and follows README. | Planned |

## Planned verification commands

After approval, integration tests will target a dedicated PostgreSQL database (for example `DATABASE_URL_TEST`) started by the same Docker Compose configuration or an explicitly documented test service. Migrations run before integration tests; each test owns unique data and cleanup/truncation runs between tests. Never point tests at a development database.

Planned commands (not yet evidence):

- `pnpm test` — Vitest unit and integration suites.
- `pnpm test:unit` — pure domain/service tests without database.
- `pnpm test:integration` — PostgreSQL-backed suite after test migrations.
- `pnpm lint`, `pnpm typecheck`, and `pnpm build` — static and production checks.

## Coverage notes

- T-REQ-01 and T-REQ-02 are explicitly required by `Task.md`.
- Remaining scenarios are recommended evidence for required behavior or documented assumptions.
- Deterministic provider outcomes are proposed because random failure is not adequate test proof.
- PostgreSQL integration must prove database-enforced idempotency and concurrent worker claiming, not mock-only logic.

## Architecture-derived test refinements

| ID | Requirement links | Level | Scenario and expected outcome | Status |
| --- | --- | --- | --- | --- |
| T-14 | FR-04, ADR-003 | PostgreSQL integration | Simultaneous same-customer/same-key creates serialize to one order and one idempotency record. | Planned |
| T-15 | FR-09, ADR-004, ADR-015 | PostgreSQL integration | Token and generation prevent stale owner from writing mailbox outcome, lease renewal, or terminal status after reclaim. | Planned |
| T-16 | FR-06, ADR-006, ADR-015 | PostgreSQL integration | Transition/recovery event and audit either commit together or both roll back; concurrent writers get unique ordered sequences. | Planned |
| T-17 | FR-07, ADR-007, ADR-014 | Integration | Repeated provider call with one attempt key—including after mock instance restart—returns the same durable result. | Planned |
| T-18 | FR-12, FR-13 | Integration | Invalid enum/filter/page-size input returns `422`; retry from a non-failed status returns `409`. | Planned |
| T-19 | FR-09, ADR-004, ADR-014 | Integration | A worker whose provider call outlasts its lease cannot write after reclaim; new owner converges on durable mock result. | Planned |
| T-20 | FR-05, FR-06, ADR-004, ADR-006 | Integration | Recovery audit is `LEASE_RECLAIMED` and does not add an invalid public status transition. | Planned |
| T-21 | FR-08, FR-10, ADR-001, ADR-002, ADR-015 | Integration | A failed mailbox gets a new attempt key and can become active after retry; already active mailbox gets no new provider operation. | Planned |
