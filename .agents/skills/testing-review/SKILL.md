---
name: testing-review
description: Define and assess unit and PostgreSQL integration coverage for the Mailbox Order Manager, reporting verification only from actual evidence.
---

# Testing review

## Purpose

Keep test strategy centered on the assessment’s high-risk behavior and distinguish planned coverage from executed proof.

## Invoke when

Planning tests, reviewing a test change, diagnosing missing coverage, or verifying a completed slice. Do not use it to substitute evidence with assertions.

## Required inputs

- Requirement identifiers and affected code paths
- `docs/TEST_PLAN.md`, existing tests, and current command output
- Test environment details for PostgreSQL integration work

## Workflow

1. Map unit and integration scenarios to requirements and failure modes.
2. Cover state transitions, invalid transitions, idempotent creation, authorization/isolation, retries/audits, and concurrent worker claims where relevant.
3. Review assertions for deterministic behavior and meaningful boundaries; avoid random failures as proof.
4. Run applicable commands or explicitly report why they were not run.
5. Update `docs/TEST_PLAN.md` with scenario status and `docs/AI_WORKLOG.md` with actual outcomes.

## Expected outputs

- An evidence-backed coverage assessment and prioritized test gaps.
- Updated test plan with expected outcomes, commands, and executed results.

## Verification checklist

- State-machine unit tests include valid and rejected transitions.
- Order creation has the required PostgreSQL integration coverage.
- Concurrency/duplicate paths are deliberate and deterministic.
- Commands, exit status, and blockers are recorded accurately.

## Stop conditions

Never mark functionality verified without command output or equivalent observed evidence. Stop for environment access or a decision when verification cannot proceed safely.
