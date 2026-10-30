---
name: architecture-design
description: Propose and evaluate the Mailbox Order Manager’s layers, data model, contracts, patterns, risks, and tradeoffs after requirements approval.
---

# Architecture design

## Purpose

Develop a concrete, minimal design that satisfies the approved requirements while protecting the ordering workflow’s correctness and maintainability.

## Invoke when

After requirements approval and before implementation planning; also for proposed changes to approved boundaries, persistence, authorization, or reliability mechanisms.

## Required inputs

- Approved `docs/REQUIREMENTS.md`
- `Task.md`
- Existing `docs/ARCHITECTURE.md`, `docs/TECH_STACK.md`, and `docs/DECISIONS.md`

## Workflow

1. Identify domain boundaries, ownership rules, data flow, API/service contracts, and persistence needs.
2. Compare only meaningful options for ORM, state transitions, provider abstraction, worker claiming, and audit consistency.
3. Propose database relationships, authorization boundaries, typed failure behavior, and test seams.
4. Record proposed ADRs in `docs/DECISIONS.md`; update architecture and stack documents only with proposed or approved facts.
5. Present the design, risks, rejected alternatives, and decision points for approval.

## Expected outputs

- A reviewable architecture proposal and proposed ADR entries.
- A design-ready update to `docs/ARCHITECTURE.md` and `docs/TECH_STACK.md` that clearly marks unapproved choices.

## Verification checklist

- Each requirement has an owning layer or boundary.
- Business rules stay outside routes and components.
- Customer isolation, validation, state validity, idempotency, and concurrent worker execution are addressed.
- Patterns list their location, rationale, and a rejected alternative.

## Stop conditions

Do not implement or treat a proposed decision as accepted. Stop for approval before a technology choice, data-model commitment, public contract, or material architecture change.
