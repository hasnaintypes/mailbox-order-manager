---
name: requirements-analysis
description: Analyze the Mailbox Order Manager assessment brief into traceable requirements, assumptions, and acceptance criteria before design or implementation.
---

# Requirements analysis

## Purpose

Turn `Task.md` into a concise, testable requirements baseline without making design choices.

## Invoke when

Before architecture or implementation planning, or when the brief, scope, or requirement interpretation changes. Do not use for implementation-only work with an approved baseline.

## Required inputs

- `Task.md`
- Relevant approved entries in `docs/DECISIONS.md`
- Existing `docs/REQUIREMENTS.md` and `docs/TEST_PLAN.md`, if any

## Workflow

1. Extract functional requirements, constraints, deliverables, and priority order from the brief.
2. Separate explicit statements from assumptions; identify ambiguities or conflicts without resolving them silently.
3. Define observable acceptance criteria and map each requirement to planned implementation areas and tests.
4. Update `docs/REQUIREMENTS.md` as the canonical baseline. Link rather than duplicate test detail.
5. Present unanswered material questions and request approval before advancing to architecture design.

## Expected outputs

- Updated `docs/REQUIREMENTS.md` with traceable identifiers and acceptance criteria.
- A concise list of assumptions, ambiguities, and approval questions.

## Verification checklist

- Every requirement is attributable to `Task.md` or labeled as an assumption.
- Acceptance criteria are observable and testable.
- Priority order and time constraint are retained.
- No architecture, technology, or implementation decision is presented as approved.

## Stop conditions

Stop for user direction when a missing or conflicting requirement materially changes scope, security, data ownership, or acceptance criteria. Stop after presenting the requirements baseline for approval.
