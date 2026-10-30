---
name: reliability-review
description: Review correctness risks in order creation, state changes, transactions, workers, retries, and auditing for the Mailbox Order Manager.
---

# Reliability review

## Purpose

Find concrete failure modes in the assessment’s stateful provisioning workflow and recommend minimal, evidence-based corrections.

## Invoke when

Reviewing or changing order creation, state transitions, repository/service transactions, provider workers, retry behavior, or audit logging. This is not a general style review.

## Required inputs

- Relevant code, schema/migrations, tests, and current architecture/ADRs
- The affected requirement identifiers and observed failure evidence, if any

## Workflow

1. Trace normal, duplicate, concurrent, partial-failure, and repeated-execution paths.
2. Verify database guarantees and transaction boundaries rather than relying on in-memory behavior.
3. Check allowed transitions, retry eligibility, audit coverage, and provider duplicate-provisioning safeguards.
4. Classify findings by severity and identify the smallest safe correction plus required tests.
5. Update architecture/ADRs only when a real design decision changes; record review evidence in the worklog.

## Expected outputs

- A concise finding list with affected invariants, evidence, recommendation, and residual risk.
- Required regression-test additions or verification commands.

## Verification checklist

- Creation is idempotent under repeated requests.
- Only valid transitions occur and every transition is audited.
- Concurrent/repeated workers cannot claim or provision the same order twice.
- Failures and admin retries preserve consistent state and audit history.

## Stop conditions

Stop and request direction for a fix that changes an approved architecture, schema contract, or external behavior. Do not call a finding resolved without fresh evidence.
