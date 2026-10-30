# Requirements baseline

## Scope and source

`../Task.md` is the authoritative assessment brief. This baseline is its traceable interpretation, not an architecture or implementation decision. All **REQUIRED** entries below are explicit in that brief and have status **Not Started**.

The brief names the file `Task.md` (capital T), although the phase instruction refers to `task.md`; this document uses the on-disk canonical filename.

## Classification

- **REQUIRED** — explicitly stated in `Task.md`.
- **ASSUMED** — necessary interpretation, not a requirement; see [Open questions and assumptions](#open-questions-and-assumptions).
- **PROPOSED** — recommendation pending approval; see `DECISIONS.md`.
- **OPTIONAL** — outside required scope and not planned.

## Functional requirements

| ID | Class | Description | Priority | Source | Acceptance criteria | Dependencies | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FR-01 | REQUIRED | Provide login with seeded users in `customer` and `admin` roles. | High | What to build: login | Seeded accounts can authenticate; both roles are applied to access. | TD-02 | Implemented |
| FR-02 | REQUIRED | Customers see only their orders; admins see all. | High | What to build: roles | Customer cannot access another customer's order data; admin can access all orders. | FR-01, TD-02 | Implemented |
| FR-03 | REQUIRED | Customer creates an order with domain, provider (`google`/`microsoft`), and 1–50 mailboxes. | Critical | What to build: customer order | Valid input creates an order; unsupported provider or count outside 1–50 is rejected. | FR-01, FR-13, TD-01 | Implemented |
| FR-04 | REQUIRED | Creation is idempotent. | Critical | What to build: customer order | Repetition does not create a duplicate order. Exact semantics need ADR-003. | FR-03, NFR-02 | Implemented |
| FR-05 | REQUIRED | Enforce `PENDING → PROVISIONING → ACTIVE` or `FAILED`; admin may retry `FAILED → PENDING`; reject invalid transitions. | Critical | What to build: status flow | Only listed transitions succeed; invalid attempts do not mutate state. | FR-10, NFR-02 | Implemented |
| FR-06 | REQUIRED | Save every status transition to an audit log. | High | What to build: status flow | Every successful transition has a visible audit record. | FR-05 | Implemented |
| FR-07 | REQUIRED | Use mocked Google/Microsoft provider abstractions, with a few-seconds call and about 20% random failure. | High | What to build: worker | Correct provider is selected and both mocks provide specified behavior. | FR-03, FR-08 | Implemented |
| FR-08 | REQUIRED | Background worker provisions mailboxes; detail exposes per-mailbox status. | High | What to build: worker; screens | Worker produces mailbox outcomes visible on order detail. | FR-07, FR-11 | Implemented |
| FR-09 | REQUIRED | Two worker runs must never process one order twice. | Critical | What to build: worker | Concurrent/repeated execution cannot claim/provision one order more than once. | FR-05, NFR-02 | Implemented |
| FR-10 | REQUIRED | Admin can retry a failed order. | High | What to build: status flow; screens | Admin triggers only `FAILED → PENDING`; unauthorized/ineligible retries are rejected. | FR-02, FR-05, FR-12 | Implemented |
| FR-11 | REQUIRED | Customer list, create form, and detail show order, mailbox statuses, and audit log. | Medium | What to build: screens | Each stated view is available to its owning customer. | FR-01, FR-02, FR-03, FR-06, FR-08 | Implemented |
| FR-12 | REQUIRED | Admin list has status/provider filters, pagination, and retry. | High | What to build: screens | Admin can filter, page, and invoke eligible retry. | FR-02, FR-10 | Implemented |
| FR-13 | REQUIRED | Validate input and return consistent errors. | High | What to build: screens | Untrusted input is validated; invalid/rejected operations share an error shape. | FR-03, FR-05, FR-10 | Implemented |

## Non-functional requirements

| ID | Class | Description | Priority | Source | Acceptance criteria | Dependencies | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-01 | REQUIRED | Strict TypeScript and layered code; no business logic in route handlers/components. | High | Technical rules | Strict TypeScript and domain rules outside routes/components. | TD-01 | Implemented |
| NFR-02 | REQUIRED | Ensure durable correctness for idempotency and concurrent workers. | Critical | What to build: idempotency/worker | Duplicate creation and work are prevented by durable behavior. | TD-01 | Implemented |
| NFR-03 | REQUIRED | Include state-machine unit tests and one PostgreSQL order-creation integration test. | High | Technical rules | Required tests exist and run at stated boundaries. | TD-01, TD-02 | Implemented |
| NFR-04 | REQUIRED | Document patterns, location, rationale, and rejected alternative. | Medium | Technical rules | Architecture doc records each pattern actually used. | NFR-01 | Implemented |

## Technical and delivery requirements

| ID | Class | Description | Priority | Source | Acceptance criteria | Dependencies | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TD-01 | REQUIRED | Next.js App Router, strict TypeScript, PostgreSQL, Prisma or Drizzle. | Critical | Stack; technical rules | All mandated technologies are used; ORM is selected after approval. | — | Implemented |
| TD-02 | REQUIRED | Migrations and seed data. | High | Technical rules | Clean database can migrate and receive seeds. | TD-01 | Implemented |
| TD-03 | REQUIRED | `docker-compose.yml` for Postgres and `.env.example`. | High | Technical rules | Both exist and support local setup without secrets. | TD-01 | Implemented |
| TD-04 | REQUIRED | Keep `docs/ARCHITECTURE.md` current with actual patterns and rejected alternatives. | Medium | Technical rules | Documentation matches implementation. | NFR-04 | Implemented |
| TD-05 | REQUIRED (source fact) | Brief requests Claude Code-only evidence: `CLAUDE.md`, a Claude-focused worklog, reviewed output, and only Claude Code. | High | Claude Code evidence; Rules | Project work uses Claude Code only; resolved. | External evaluator direction | Done |
| TD-06 | REQUIRED | Small, meaningful commits; no giant commit. | Medium | Claude Code evidence; red flags | Git history shows scoped commits when Git is available. | Git availability | Implemented |
| TD-07 | REQUIRED | GitHub repo and clean-clone README under 10 minutes: setup, migrations, seed, app/worker, logins, tests, limitations. | High | What to submit | README contains each item and clean setup meets time target. | TD-01–TD-03, FR-01 | README done; clean-clone typecheck verified; push pending |
| TD-08 | REQUIRED | Top-of-README 2–3 minute demo: creation, success/failure, admin audit/retry, tests. | Medium | What to submit | Real link and all named workflows demonstrated. | FR-03, FR-06, FR-10, TD-07 | Done — Loom link at top of README |
| TD-09 | REQUIRED | Respect 3–4 hour window and hard four-hour cap; list unfinished work at cap. | Critical | Stack/time; What to submit | Actual time is recorded and work stops at cap. | All implementation work | In progress — see worklog |
| TD-10 | REQUIRED | Priority: creation/state machine; provider/worker; admin retry/audit; customer views; tests. | High | What to submit | Plan follows stated priority under time pressure. | TD-09 | Implemented |

## Requirement relationships

- FR-03/FR-04 form the creation boundary; NFR-02 governs their duplicate/concurrency guarantees.
- FR-05 is lifecycle authority; FR-06, FR-09, and FR-10 depend on it.
- FR-07/FR-08 generate the data surfaced by FR-11; FR-12 is the admin control surface.
- TD-01–TD-03 enable NFR-03 and reproducible delivery; TD-07/TD-08 are submission evidence.

## Business workflow

1. A seeded user logs in. Customer scope is their own orders; admin scope is all orders.
2. Customer submits domain, provider, and a count within 1–50.
3. Validation rejects bad input consistently; a valid idempotent creation persists one `PENDING` order.
4. A duplicate returns the idempotent outcome, not another order; exact contract needs ADR-003.
5. A worker safely claims the pending order, changes it to `PROVISIONING`, then selects its mocked provider.
6. The provider provisions mailboxes and records mailbox-level outcomes. Partial results are unresolved.
7. The result becomes `ACTIVE` or `FAILED`; every transition is audited.
8. Customer tracks own order, mailboxes, and audit. Admin filters/pages all orders and retries a failed order to `PENDING`.

```mermaid
flowchart TD
  L[Seeded user logs in] --> R{Role}
  R -->|Customer| C[Create or view own orders]
  R -->|Admin| A[Filter/page all orders; inspect and retry]
  C --> V[Validate domain, provider, count 1-50]
  V -->|Invalid| E[Consistent error]
  V -->|Valid| I{Duplicate creation?}
  I -->|Yes| D[Return idempotent outcome]
  I -->|No| P[Persist PENDING order]
  P --> W[Worker safely claims order]
  W --> S[Set PROVISIONING and audit]
  S --> G[Select Google or Microsoft mock]
  G --> M[Provision mailbox(es)]
  M --> O{Outcome}
  O -->|Success| AC[Set ACTIVE and audit]
  O -->|Failure| F[Set FAILED and audit]
  AC --> T[Customer tracks order, mailboxes, audit]
  F --> T
  A -->|Eligible failed order| RP[Retry: set PENDING and audit]
  RP --> W
```

## Open questions and assumptions

| ID | Class | Question / why it matters | Approaches | Recommended default | Decision required before implementation? |
| --- | --- | --- | --- | --- | --- |
| AQ-01 | ASSUMED | Mixed mailbox results have no defined order outcome. | Fail any partial order; call partial active; add a status. | Any failure makes order `FAILED`; retain mailbox outcomes; do not add a state. | Yes — ADR-001 |
| AQ-02 | ASSUMED | Retry scope is unspecified and can duplicate mailboxes. | Retry all; retry failed only; create replacement. | Retry failed/unprovisioned only, retaining successes. | Yes — ADR-002 |
| AQ-03 | ASSUMED | Idempotency lacks key/payload/replay rules. | Field comparison; customer-scoped key; unspecified behavior. | Same key/same payload replays; same key/different payload rejects. | Yes — ADR-003 |
| AQ-04 | ASSUMED | Worker crash/concurrent claim may strand or duplicate work. | In-memory lock; database claim/lease; external queue. | Durable database claim plus bounded recovery. | Yes — ADR-004 |
| AQ-05 | ASSUMED | Retry can race with processing or another retry. | UI disable; allow all; atomic state enforcement. | Atomically allow only `FAILED → PENDING`. | Yes — ADR-005 |
| AQ-06 | ASSUMED | Audit ordering/display is unspecified. | Timestamp-only; stable sequence + timestamp. | Immutable event identity/sequence plus server time, chronological display. | No — ADR-006 records recommendation |
| AQ-07 | ASSUMED | Random failure makes tests flaky. | Random everywhere; injectable outcomes; no failure tests. | Random normal behavior with controllable test outcomes. | Yes — ADR-007 |
| AQ-08 | ASSUMED | Customer retry, auth method, domain rules, pagination defaults, and error envelope are unspecified. | Arbitrary choices; minimal contracts. | Admin-only retry; propose minimal contracts in design. | Yes for public/API behavior |

## Proposed and optional scope

- **PROPOSED:** ADR-001 through ADR-007 are recommendations only.
- **OPTIONAL:** A `PARTIAL` order state, real providers, an external queue, and unlisted screens are outside scope unless approved.

## Requirements review

- All functional, technical, evidence, delivery, timing, and priority statements from `Task.md` are represented.
- Acceptance criteria are observable; planned coverage is in `TEST_PLAN.md`.
- No technology, architecture, or ambiguity resolution is accepted here.
- No application code was created in this phase.
