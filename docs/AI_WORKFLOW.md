# AI-assisted engineering workflow

## Scope and approval gates

1. Initialize workflow and obtain setup approval.
2. Analyze requirements and propose a design; stop for design approval.
3. Produce an implementation plan with scope, tests, and time budget; stop for plan approval.
4. Implement approved slices, pausing for approval at major architectural or scope changes.
5. Run a delivery audit with fresh evidence before declaring completion. Publishing or submission needs separate authorization.

The four-hour assessment limit includes setup; record actual elapsed time and stop at the cap with unfinished work listed.

## Skill routing

- `requirements-analysis`: interpret `Task.md`, acceptance criteria, assumptions, and traceability.
- `architecture-design`: evaluate and propose system/data/API boundaries and tradeoffs.
- `implementation-planning`: convert approved design into prioritized, testable work within budget.
- `reliability-review`: review idempotency, transitions, transactions, concurrency, retries, and audits.
- `testing-review`: plan/review tests and report only command-backed verification.
- `delivery-audit`: compare the finished repository and demo against the assessment brief.

Read the selected skill before use. Skills guide work; they do not replace required approval.

## Documentation synchronization

| Trigger | Canonical update |
| --- | --- |
| Requirement or interpretation changes | `REQUIREMENTS.md` |
| Technology selection/change | `TECH_STACK.md` and `DECISIONS.md` |
| Architecture change | `ARCHITECTURE.md` and `DECISIONS.md` |
| Progress or task sequencing | `IMPLEMENTATION_PLAN.md` |
| Test coverage or verification evidence | `TEST_PLAN.md` |
| Meaningful AI-assisted work | `AI_WORKLOG.md` |
| Process/skill/gate changes | `AI_WORKFLOW.md` |

Link to a canonical section instead of copying content. Documents describe observed work and approved decisions only.
