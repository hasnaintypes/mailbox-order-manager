# CLAUDE.md

Mailbox Order Manager: a Next.js (App Router, strict TS) + PostgreSQL internal tool for ordering pre-warmed Google/Microsoft mailboxes. This is a **time-capped (4h hard limit, setup included) engineering assessment**; the brief is `Task.md` and is the source of truth for scope. `AGENTS.md` holds the same workflow rules for other agents — keep the two consistent.

## Read first

1. `Task.md` — scope, deliverables, priority order, review weights.
2. `docs/REQUIREMENTS.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md` (ADR-001–016, all **Accepted**), `docs/IMPLEMENTATION_PLAN.md`, `docs/TEST_PLAN.md`.
3. `docs/AI_WORKFLOW.md` for approval gates and which doc owns which change.

Do not silently change an accepted ADR or the plan. Ask before any major architectural decision or scope change.

## Project skills (`.agents/skills/<name>/SKILL.md`)

Read the matching skill before doing that kind of work:

| Skill | Use for |
| --- | --- |
| `requirements-analysis` | Interpreting `Task.md`, acceptance criteria, traceability |
| `architecture-design` | Boundaries, data model, patterns, tradeoffs; stop for approval |
| `implementation-planning` | Slicing work, estimates, cut lines; stop for plan approval |
| `reliability-review` | Idempotency, transitions, transactions, worker claims, retries, audit |
| `testing-review` | Test planning/review; only report command-backed results |
| `delivery-audit` | Final check against `Task.md` before claiming done; never publishes |

## Commands (pnpm, Node >= 22)

```bash
docker compose up -d                 # Postgres 17 (dev db `mailbox`, test db `mailbox_test`)
cp .env.example .env && cp .env.test.example .env.test
pnpm db:migrate && pnpm db:seed      # seed: admin@example.test / customer@example.test (SEED_PASSWORD, default ChangeMe123!)
pnpm dev                             # app
pnpm worker                          # provisioning worker (loop); `pnpm worker:once` for a single pass
pnpm typecheck && pnpm lint
pnpm test:unit                       # pure, no DB
pnpm db:migrate:test && pnpm test:integration   # real PostgreSQL via .env.test
pnpm db:generate                     # after editing src/db/schema.ts
```

Run a single test: `pnpm exec vitest run tests/unit/order-state-machine.test.ts`.
Integration tests must only ever use `.env.test` / the `mailbox_test` database.

## Architecture (modular monolith)

Dependencies point downward; each layer has one job.

```
src/app/            pages + route handlers: parse, auth, validate, call service, serialize. NO business logic
src/auth/           Auth.js Credentials (JWT); requireActor/requireCustomer/requireAdmin
src/services/       use cases (create-order, customer-orders, presenters, planned: retry, provisioning)
src/domain/orders/  status enums + transition table (state machine). No DB/Next imports
src/repositories/   Drizzle queries, customer-scoped reads, transaction-aware writes, audit appends
src/providers/      (planned) provider Strategy + durable mock ledger
src/worker/         (planned) polling entry point
src/db/             schema, client, seed; migrations in drizzle/
src/lib/            env, zod validation, AppError/Errors, api helpers (`handle`, `errorResponse`)
src/components/ui/  shadcn/ui primitives (add only what screens use)
```

Patterns to keep (and name in `docs/ARCHITECTURE.md`): state machine, service + repository layers, provider Strategy, PostgreSQL-backed queue + worker, idempotency-key record.

## Invariants that must not regress

- Status flow: `PENDING → PROVISIONING → ACTIVE | FAILED`, admin-only `FAILED → PENDING`. All other transitions rejected via `assertTransition`; every real transition is audited **in the same transaction**.
- Order creation is idempotent: `UNIQUE(customer_id, idempotency_key)` + request fingerprint. Same payload → replay (200); different payload → `409 IDEMPOTENCY_KEY_REUSED`; concurrent duplicates converge on one order.
- Worker: claim via DB (`FOR UPDATE SKIP LOCKED`/conditional update), 45s lease, `claim_token` + `claim_generation` fencing on every write. **Never hold a DB transaction across a provider call.** Lease reclaim is audited as `LEASE_RECLAIMED` (not a status transition). Retry keeps ACTIVE mailboxes, rotates failed mailboxes' `provisioning_key`.
- Audit ordering uses atomic `orders.audit_sequence` increment — never `MAX(sequence)`.
- Authorization is enforced server-side: customers see only their own orders (scope in the repository query); admin-only actions use `requireAdmin`.
- Errors use `AppError`/`Errors` and the `{ error: { code, message, details } }` shape; validation failures are `422`, invalid transitions `409`.

## Conventions

- Strict TypeScript; `@/` aliases `src/`. Match surrounding style; no speculative abstractions.
- Validate all input with zod at the boundary (`src/lib/validation.ts`); route handlers wrap logic with `handle()`.
- Tests first for domain/reliability behavior. PostgreSQL (not mocks) proves idempotency, audit atomicity, claim fencing and worker concurrency. Provider outcomes must be controllable in tests (no random-failure assertions).
- Use `pnpm`, not npm/yarn. Don't commit `.env*` (except the `.example` files).

## Process requirements (graded)

- **Commits**: small, meaningful, one per verified slice; no co-author trailers. Never one giant commit. Don't push or publish without explicit approval.
- **`docs/AI_WORKLOG.md`**: append factual rows only — phase, key prompts (3–5), real times, places Claude was wrong and how it was fixed, hand edits. Don't invent errors or times. Claude Code is the only AI tool (TD-05).
- Update docs per the sync table in `docs/AI_WORKFLOW.md`; record meaningful tradeoffs in `docs/DECISIONS.md`; mark plan tasks VERIFIED only with command output recorded.
- Track elapsed time against the 4h cap (~3h45m used so far; see worklog). At the cap, stop and list unfinished work in priority order: order creation/state machine → provider abstraction/worker → admin list/retry/audit → customer views → tests.
- Deliverables still owed: `README.md` (clean-clone run in <10 min, logins, tests, limitations, demo link at top), `docs/ARCHITECTURE.md` pattern section (location, why, rejected alternative), demo video.

## Current status (update as work lands)

Implemented and verified: schema/migrations/seed, state machine (16 unit tests), idempotent create, provider Strategy + durable ledger, safe worker (lease + fencing), admin list/retry/audit, login, customer and admin screens (12 integration tests; HTTP smoke on a production build).
Remaining: demo video + README link, final delivery audit (`delivery-audit` skill), browser click-through of the UI, worklog time totals.
Notes: Postgres is published on host port 5433 (5432 is used by another local container). Do not use broad `pkill`; stop servers by port.
