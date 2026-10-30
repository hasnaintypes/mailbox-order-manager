---
name: implementation-planning
description: Turn the approved Mailbox Order Manager design into small, prioritized, testable work slices within the four-hour assessment budget.
---

# Implementation planning

## Purpose

Produce an execution plan that makes dependencies, verification, and time tradeoffs explicit without expanding approved scope.

## Invoke when

After design approval and before application work, or when approved scope changes require replanning.

## Required inputs

- Approved requirements, architecture, technology decisions, and ADRs
- `Task.md` priority order and time cap
- Current `docs/IMPLEMENTATION_PLAN.md` and `docs/TEST_PLAN.md`

## Workflow

1. Break approved scope into ordered slices with dependencies, acceptance criteria, and estimates.
2. Put critical order creation/state-machine behavior before worker, admin, customer-view, and polish work, following `Task.md`.
3. Associate each slice with test-first work and verification commands.
4. Identify cut lines and unresolved blockers that protect the hard four-hour limit.
5. Update the plan and test plan, then request approval before execution.

## Expected outputs

- Updated `docs/IMPLEMENTATION_PLAN.md` with milestones, status, dependencies, definitions of done, and budget.
- Updated `docs/TEST_PLAN.md` with planned coverage and commands.

## Verification checklist

- Plan contains no unapproved requirements.
- Critical database/concurrency behavior has explicit tests.
- Every slice has a definition of done and evidence expectation.
- Actual time, deviations, and progress have a place to be recorded.

## Stop conditions

Stop for plan approval before implementation. Re-request approval if a change materially alters scope, architecture, sequencing, or time budget.
