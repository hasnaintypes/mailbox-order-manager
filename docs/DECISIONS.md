# Architecture decisions

This is an append-only ADR log. Proposed entries are not implementation authorization.

## ADR template

### Decision ID: ADR-XXX

- Date:
- Status: Proposed | Accepted | Superseded | Rejected
- Context:
- Options considered:
- Selected approach:
- Rationale:
- Tradeoffs and consequences:

No decisions were accepted during initialization. The following are proposed only and require approval before implementation.

### Decision ID: ADR-001

- Date: 2026-10-30
- Status: Accepted
- Context: The brief requires per-mailbox status but offers only `ACTIVE` and `FAILED` terminal order states; it does not define a mixed mailbox result.
- Options considered: Fail the order when any mailbox fails; treat any partial success as active; add a new partial state.
- Recommended approach: Keep the specified order state machine; make an order `FAILED` when any mailbox fails and retain per-mailbox outcomes.
- Rationale: Preserves requested state vocabulary and makes retry/review necessary rather than concealing failures.
- Tradeoffs and consequences: A partially successful order appears failed; retry semantics must avoid duplicate provision of successful mailboxes (ADR-002).

### Decision ID: ADR-002

- Date: 2026-10-30
- Status: Accepted
- Context: The brief permits `FAILED → PENDING` retry but does not say which mailboxes are reprovisioned.
- Options considered: Reprovision every mailbox; reprovision only failed/unprovisioned mailboxes; create a replacement order.
- Recommended approach: Retry only failed or unprovisioned mailboxes and preserve successful mailbox records.
- Rationale: Minimizes duplicate provisioning risk while retaining an auditable history.
- Tradeoffs and consequences: Requires clear mailbox status modeling and worker selection logic.

### Decision ID: ADR-003

- Date: 2026-10-30
- Status: Accepted
- Context: “Order creation is idempotent” does not specify a key or behavior for divergent duplicate payloads.
- Options considered: Infer duplicates from fields; use a customer-scoped client idempotency key; ignore duplicate handling details.
- Recommended approach: Use a customer-scoped idempotency key; replay same key/same payload and reject same key/different payload.
- Rationale: Gives callers deterministic behavior and permits a durable uniqueness guarantee.
- Tradeoffs and consequences: Requires client/API contract and storage for a key plus payload fingerprint.

### Decision ID: ADR-004

- Date: 2026-10-30
- Status: Accepted
- Context: Repeated worker execution must not process the same order twice, including concurrent claims or recovery after a crash.
- Options considered: In-memory locking; database-enforced atomic claim with lease/recovery; external queue.
- Recommended approach: Use a database-enforced atomic claim with a 45-second lease, token plus monotonic generation fencing, conditional renewal, and atomic expired-lease reclaim that keeps public status `PROVISIONING`.
- Rationale: PostgreSQL is already required and provides a durable concurrency boundary without adding queue infrastructure.
- Tradeoffs and consequences: A provider call can still outlast a lease; stale results are discarded by fencing and recovered with the same mailbox attempt key.

### Decision ID: ADR-005

- Date: 2026-10-30
- Status: Accepted
- Context: Admin retry can race with worker activity or a second retry request.
- Options considered: UI-only disablement; accept every retry request; atomically authorize and enforce `FAILED → PENDING`.
- Recommended approach: Atomically enforce the existing transition rule server-side and reject all ineligible retry attempts.
- Rationale: Aligns with the stated lifecycle and prevents duplicate jobs independent of UI state.
- Tradeoffs and consequences: Users may receive a conflict/error when viewing stale data.

### Decision ID: ADR-006

- Date: 2026-10-30
- Status: Accepted
- Context: Every transition needs an audit log, but ordering and immutable fields are unspecified.
- Options considered: Timestamp-only entries; a stable event identifier/sequence plus timestamp; mutable status-history records.
- Recommended approach: Store immutable transition/recovery records with server timestamp and obtain sequence by atomically incrementing `orders.audit_sequence` in the same transaction.
- Rationale: Enables reliable inspection where timestamps collide or retries occur.
- Tradeoffs and consequences: Adds one order counter and a recovery event type; prevents `MAX(sequence) + 1` races.

### Decision ID: ADR-007

- Date: 2026-10-30
- Status: Accepted
- Context: Providers should fail randomly about 20% of the time, while the assessment also requires robust tests.
- Options considered: Randomness in all contexts; injectable deterministic outcomes for tests; omit failure tests.
- Recommended approach: Preserve simulated randomness in normal mocked behavior, persist one result per attempt key, and allow controlled outcomes in tests.
- Rationale: Meets the demonstration intent without flaky test evidence.
- Tradeoffs and consequences: Adds a small test seam and the durable mock-operation ledger defined in ADR-014.

### Decision ID: ADR-008

- Date: 2026-10-30
- Status: Accepted
- Context: The brief requires PostgreSQL and either Prisma or Drizzle; worker claiming needs visible PostgreSQL locking/conditional updates.
- Options considered: Drizzle with node-postgres; Prisma; handwritten SQL/data access.
- Recommended approach: Drizzle ORM with node-postgres and migrations, using explicit SQL only where claim semantics require it.
- Rationale: Keeps schema and ordinary queries typed while retaining direct access to PostgreSQL concurrency primitives with limited setup.
- Tradeoffs and consequences: Less high-level than Prisma; team must keep repository boundaries to avoid scattered SQL.

### Decision ID: ADR-009

- Date: 2026-10-30
- Status: Accepted
- Context: Seeded customer/admin login is required without an identity provider or authentication mechanism specified.
- Options considered: Auth.js Credentials with database users; custom signed-cookie sessions; external OAuth/provider.
- Recommended approach: Auth.js Credentials with seeded email/password hashes and a JWT session carrying user ID and role.
- Rationale: Delivers local seeded login quickly while centralizing session behavior and preserving server-side authorization.
- Tradeoffs and consequences: Credentials require careful hashing and no production-grade rate limiting is delivered in this assessment scope.

### Decision ID: ADR-010

- Date: 2026-10-30
- Status: Accepted
- Context: The application needs UI/API behavior plus a background worker but has a four-hour cap.
- Options considered: Modular monolith plus separate worker process; microservices; all work inside web requests.
- Recommended approach: One Next.js modular monolith with application/domain/repository boundaries and one separately launched worker command.
- Rationale: Maintains testable separation while avoiding deployment, network, and operational overhead.
- Tradeoffs and consequences: Web and worker share database/schema code; no independent worker scaling/control plane.

### Decision ID: ADR-011

- Date: 2026-10-30
- Status: Accepted
- Context: Safe worker execution is required but external queue infrastructure is not.
- Options considered: PostgreSQL queue with atomic claim/token/lease; Redis/BullMQ; in-memory lock.
- Recommended approach: PostgreSQL-backed queue using short transactions, conditional claim/`SKIP LOCKED`, token plus generation fencing, a 45-second lease, and stable per-attempt mailbox provisioning keys.
- Rationale: PostgreSQL is already mandated and can guarantee at-most-one live claim without additional infrastructure.
- Tradeoffs and consequences: Provides at-least-once recovery, not generic exactly-once external side effects; stale writes are rejected and recovery is audited without a public state change.

### Decision ID: ADR-012

- Date: 2026-10-30
- Status: Accepted
- Context: Input validation and public failure shapes are required, while route handlers must remain thin.
- Options considered: Zod schemas plus typed application errors; ad hoc checks/route-specific errors; framework-only errors.
- Recommended approach: Zod at request/auth boundaries and typed domain/application errors mapped by route adapters to one safe JSON envelope.
- Rationale: Enables consistent responses and unit-testable business errors without leaking internals.
- Tradeoffs and consequences: Requires maintaining schemas and error-code mapping alongside contracts.

### Decision ID: ADR-013

- Date: 2026-10-30
- Status: Accepted
- Context: Required state-machine unit tests and PostgreSQL creation integration test must also demonstrate idempotency/concurrency safely.
- Options considered: Vitest with dedicated PostgreSQL test DB; Jest; mock-only tests; Testcontainers-first setup.
- Recommended approach: Vitest for pure units and a dedicated migrated PostgreSQL test database for integration tests, with controlled provider outcomes.
- Rationale: Directly tests the database guarantees the design relies on while minimizing test harness overhead.
- Tradeoffs and consequences: Requires isolated DB lifecycle; Testcontainers remains optional if local compose cannot provide it.

### Decision ID: ADR-014

- Date: 2026-10-30
- Status: Accepted
- Context: A worker can crash after a mock provider returns success/failure but before the mailbox write commits. In-memory mock state cannot survive a restart or make the recovery call converge.
- Options considered: In-memory `Map`; store mock outcome only in mailbox row; durable provider-operation ledger in PostgreSQL.
- Recommended approach: Add one `provider_provisioning_operations` table keyed by `provisioning_key`, containing the provider and immutable terminal mock result.
- Rationale: It is the smallest durable boundary that models provider-side idempotency independently of the worker's mailbox transaction.
- Tradeoffs and consequences: It is an extra table solely for the mock; its exactly-once guarantee applies only to this mock logical outcome, not arbitrary real providers.

### Decision ID: ADR-015

- Date: 2026-10-30
- Status: Accepted
- Context: Recovery, stale-worker fencing, mailbox retries, and ordered audit events need exact data rules before implementation.
- Options considered: Token-only claims and timestamp audit ordering; token plus generation fencing with mailbox attempt keys and atomic per-order sequence; external queue/audit system.
- Recommended approach: Use `claim_token` plus monotonic `claim_generation`; use `mailbox.provision_attempt` and one stable key per attempt; atomically increment `orders.audit_sequence`; audit reclaim as a non-transition event.
- Rationale: Safely distinguishes old/new ownership, permits failed mailboxes to have a new result on retry, preserves successful mailboxes, and avoids sequence races without new infrastructure.
- Tradeoffs and consequences: Adds several columns and one operational audit event type; lease recovery is at-least-once execution, not a generic exactly-once promise.

### Decision ID: ADR-016

- Date: 2026-10-30
- Status: Accepted
- Context: The internal-tool UI needs consistent accessible forms, tables, status displays, dialogs, and pagination without spending assessment time building primitives.
- Options considered: Tailwind-only hand-built primitives; shadcn/ui; a hosted or opaque component library.
- Recommended approach: Use shadcn/ui with Tailwind and add only the primitives actually used by the customer/admin workflows.
- Rationale: Components are generated into the repository and remain editable, while providing a fast accessible baseline.
- Tradeoffs and consequences: Adds CLI/configuration and only the dependencies selected by installed components; no prebuilt dashboard blocks or unused component catalog will be added.

### Decision ID: ADR-017

- Date: 2026-10-30
- Status: Accepted
- Context: Host port 5432 was already used by another local Postgres container, so the project database was unreachable at the documented URL.
- Options considered: Stop the other container; change the project's published port; connect only through the Docker network.
- Recommended approach: Publish the project Postgres on host port 5433 and update `docker-compose.yml`, `.env.example` and `.env.test.example`.
- Rationale: Does not disturb unrelated local services and keeps the clean-clone instructions simple.
- Tradeoffs and consequences: README and env examples must state 5433; anyone with a conflict on 5433 changes it in one place.

### Decision ID: ADR-018

- Date: 2026-10-30
- Status: Accepted
- Context: Admin retry must not reprovision successful mailboxes and a retried failed mailbox must be a new provider operation.
- Options considered: Reset all mailboxes on retry; keep ACTIVE mailboxes and rotate only failed mailboxes' provisioning key.
- Recommended approach: `retryOrder` locks the order row, asserts `FAILED → PENDING`, resets only FAILED mailboxes with a new `provisioning_key` and incremented `provision_attempt`, and writes the audit event in the same transaction.
- Rationale: Row lock makes racing retries serialize (one succeeds, the other gets `409`); verified by `tests/integration/retry-and-admin.test.ts`.
- Tradeoffs and consequences: Mailbox history of earlier failed attempts is overwritten in place (only the attempt counter and audit log remain).

