# Mailbox Order Manager workflow

- Read `Task.md` and relevant files in `docs/` before planning or changing work.
- Use the applicable project skill in `.agents/skills/` when it is available: `requirements-analysis`, `architecture-design`, `implementation-planning`, `reliability-review`, `testing-review`, or `delivery-audit`.
- Keep domain/business logic in testable services; route handlers and UI components coordinate only.
- Prefer simple, reliable designs over speculative abstractions. Validate inputs and authorization server-side.
- Write and run proportionate tests. Record commands and outcomes; do not call work complete without current verification evidence.
- Keep documentation synchronized with actual work and record meaningful tradeoffs in `docs/DECISIONS.md`.
- Do not silently alter an approved architecture or plan. Request approval before a major architectural decision or scope change.
- Respect the four-hour implementation cap and record actual elapsed time, including setup, in `docs/AI_WORKLOG.md`.

Workflow details and document ownership are in `docs/AI_WORKFLOW.md`.
