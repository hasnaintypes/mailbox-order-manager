# Mailbox Order Manager

Internal tool for ordering pre-warmed Google and Microsoft mailboxes. Next.js (App Router, strict TypeScript) + PostgreSQL (Drizzle) with a separate background worker.

> Demo video: _to be added before submission_

## Quick start (clean clone)

Requires Node >= 22, pnpm 10 and Docker.

```bash
pnpm install
docker compose up -d                       # Postgres on localhost:5433 (dev db `mailbox`, test db `mailbox_test`)
cp .env.example .env && cp .env.test.example .env.test
pnpm db:migrate && pnpm db:migrate:test    # apply migrations to dev and test databases
pnpm db:seed                               # seed users
pnpm dev                                   # app on http://localhost:3000
pnpm worker                                # in a second terminal: provisioning worker
```

Replace `AUTH_SECRET` in `.env` with any random string of 32+ characters (`openssl rand -base64 32`).

Postgres is published on **5433** so it does not clash with a local Postgres on 5432.

## Logins (password `ChangeMe123!`, override with `SEED_PASSWORD` before seeding)

| Role | Email |
| --- | --- |
| Customer | `customer@example.test` |
| Admin | `admin@example.test` |

## Using it

- **Customer:** *New order* → domain, provider, 1–50 mailboxes. Order list and detail show per-mailbox status and the audit log.
- **Worker:** picks up `PENDING` orders, provisions through the mock Google/Microsoft provider (~2.5s per mailbox, ~20% failure; tune with `PROVIDER_DELAY_MS`, `PROVIDER_FAILURE_RATE`). `pnpm worker:once` drains the queue and exits.
- **Admin:** *All orders* with status/provider filters, pagination, and a **Retry** button on `FAILED` orders (`FAILED → PENDING`; already-active mailboxes are not provisioned again).

API: `POST/GET /api/orders` (requires `Idempotency-Key` header), `GET /api/orders/:id`, `GET /api/admin/orders`, `GET /api/admin/orders/:id`, `POST /api/admin/orders/:id/retry`. Errors use `{ "error": { "code", "message", "details" } }`.

## Tests

```bash
pnpm test:unit          # state machine (no DB)
pnpm test:integration   # real PostgreSQL via .env.test: order creation/idempotency, worker, retry, admin list
pnpm typecheck && pnpm lint && pnpm build
```

## Docs

`docs/ARCHITECTURE.md` (patterns, data model, worker design), `docs/DECISIONS.md` (ADRs), `docs/REQUIREMENTS.md`, `docs/TEST_PLAN.md`, `docs/AI_WORKLOG.md`, `CLAUDE.md`.

## Known limitations

- Provider integrations are mocks; lease recovery gives at-least-once execution, made safe by the durable per-attempt operation ledger.
- Login has no rate limiting; this is a local/internal assessment tool.
- No UI tests; screens were smoke-tested over HTTP and by hand.
- Worker processes mailboxes of one order sequentially (a 50-mailbox order takes ~2 minutes at default delay).
