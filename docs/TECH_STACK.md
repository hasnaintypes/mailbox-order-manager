# Proposed technology stack

## Status

Every choice is **Proposed**, not accepted. Versions will be pinned only in approved implementation work.

| Area | Recommendation | Alternatives / rationale | Tradeoffs and assessment impact |
| --- | --- | --- | --- |
| Framework | Next.js App Router + strict TypeScript | Required; server pages can call services directly and route handlers remain adapters. | No additional backend deployment. |
| Database | PostgreSQL in Docker Compose | Required; provides transactions, constraints, locks, and indexes. | Local container/migration setup is required anyway. |
| ORM/migrations | **Drizzle ORM + node-postgres** | Lightweight typed schema/migrations; direct SQL escape hatch for `FOR UPDATE SKIP LOCKED`. Prisma is viable but adds client/generator workflow and raw SQL is still needed. | Drizzle is less high-level; lower setup cost here. |
| Auth | **Auth.js Credentials**, seeded email/passwords, bcrypt-compatible hashes, JWT session with ID/role | Fits local seeded accounts. Custom cookie sessions require more security-sensitive code. | Pin a compatible Auth.js release; no production rate-limiting scope. |
| Validation | **Zod** | Suggested by brief; shared server request schemas. Handwritten checks are less consistent. | Small dependency. |
| Worker/queue | **Separate Node/TypeScript worker polling PostgreSQL** | Uses required infrastructure. Redis/BullMQ adds an unnecessary service and reconciliation path. | Simple polling, not high-throughput queue infrastructure. |
| Tests | **Vitest** + dedicated PostgreSQL test database | Fast TypeScript units plus real PostgreSQL integration. Jest is equivalent; Testcontainers adds orchestration time. | Test DB lifecycle must be documented. |
| UI | **Tailwind CSS + shadcn/ui** | Accessible, editable primitives for forms, tables, badges, dialogs, and pagination while preserving local source ownership. Hand-built primitives would cost more consistency time. | Adds a small CLI/config/dependency setup; install only components actually used. |
| Logging/errors | Typed app errors + structured server console wrapper | Consistent safe errors without observability infrastructure. Pino optional, unnecessary here. | Basic local observability; redact secrets. |

## Constraints and evidence

- Required: Next.js App Router, strict TypeScript, PostgreSQL, migrations, seeds, `docker-compose.yml`, and `.env.example`.
- No Redis, BullMQ, real provider SDK, microservice, or managed auth is proposed. shadcn/ui is the approved local-source component layer.
- PostgreSQL transactions are supported by Drizzle; route handlers are public endpoints and need server-side authorization. Sources: [Drizzle transactions](https://orm.drizzle.team/docs/transactions), [Next.js route handlers](https://nextjs.org/docs/app/getting-started/route-handlers), [Auth.js Credentials](https://authjs.dev/getting-started/authentication/credentials).

These recommendations require ADR-008 through ADR-013 approval before dependency installation or scaffolding.
