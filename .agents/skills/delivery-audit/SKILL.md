---
name: delivery-audit
description: Audit the completed Mailbox Order Manager against Task.md, setup deliverables, documentation, verification evidence, and known limitations before submission.
---

# Delivery audit

## Purpose

Perform a final, requirements-focused audit that reveals gaps without declaring incomplete work finished.

## Invoke when

Before claiming the assessment is complete, requesting final review, recording a demo, or submitting/publishing. It does not authorize publication.

## Required inputs

- `Task.md`, all project documentation, current diff/status, and README
- Migrations, seeds, environment example, Docker setup, tests, and verification output
- Demo evidence or its known absence

## Workflow

1. Compare each deliverable and acceptance criterion with repository evidence.
2. Verify clean-clone instructions, migrations/seeds, app and worker startup, test commands, and required user workflows.
3. Review documentation consistency, ADR status, worklog accuracy, and known limitations.
4. Inspect commit history when Git is available; state when it is unavailable.
5. Produce a pass/fail/incomplete checklist with exact evidence and remediation priority.

## Expected outputs

- A delivery-audit report with evidence, gaps, limitations, and unrun checks.
- Documentation updates reflecting actual audit outcomes.

## Verification checklist

- Required setup files, migrations, seed data, and Docker configuration exist and are documented.
- README covers clean setup, accounts, app/worker, tests, limitations, and the real demo link when available.
- Fresh type, lint, unit, integration, build, migration/seed, and smoke evidence is recorded or explicitly blocked.
- No required feature is represented as complete without evidence.

## Stop conditions

Do not claim overall completion while required work, failing checks, missing evidence, or an absent required deliverable remains. Stop for explicit authorization before publishing, pushing, or submitting.
