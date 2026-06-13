# Issue template — ASOME Portal

> **Quality bar**: issues should read like a mini design doc — someone new to the
> codebase should understand WHY, WHAT, and HOW just from the issue body.
> Model: wootic/reviste#241, #257, #259, #253.

---

## Feature / Setup / Improvement

````markdown
## Context

<1-3 sentences: WHY this is needed — the problem, the product/business motivation,
or the technical debt being addressed. Be specific about the constraint or opportunity.>

> **Decision YYYY-MM-DD:** <optional — key architectural or design decision worth
> documenting, e.g. "using passport-jwt over @nestjs/jwt because jwks-rsa requires
> custom strategy">

## Scope

### <Subsection — adapt to the issue type>

<!--
Backend: ### Data Model | ### API Endpoints | ### Business Logic | ### Config
Frontend: ### Routes | ### Components | ### State / Queries
Infra: ### Architecture | ### Pipeline | ### Config
Full-stack: combine above
-->

<Detailed scope per subsection. Use code blocks for Prisma models, architecture flows,
endpoint signatures. Use tables for permissions, status FSMs. Be explicit.>

```prisma
<!-- example: paste the Prisma model here if relevant -->
model Foo {
  id String @id @default(cuid())
}
```
````

```
<!-- example: paste an architecture flow if relevant -->
POST /api/resource
  → validate DTO
  → call service
  → return 201 + body
```

### <Subsection 2>

<...>

## Technical notes

- <implementation gotcha, edge case, or constraint the implementer must know>
- <reference to existing pattern to follow, e.g. "follow PrismaExceptionFilter pattern">
- <env var required, dependency to install, infra prerequisite>

**Ref:** `reviste/api/src/<path>` ← existing analogous implementation (omit if none)

---

## Definition of Done

- [ ] Feature implemented and working locally
- [ ] Tests written (Jest for api / Vitest for web)
- [ ] Linting passes (`npm run lint`)
- [ ] Type-check passes (`tsc --noEmit`)
- [ ] PR opened, reviewed, merged to `main`
- [ ] Issue closed, Stage → Done on board

---

|                  |            |
| ---------------- | ---------- |
| **Sprint start** | YYYY-MM-DD |
| **Sprint end**   | YYYY-MM-DD |

````

---

## Research / Spike

```markdown
## Context

<What question are we answering, and why does it matter before implementing?>

> **Time-box:** N hours max — if no clear winner, document tradeoffs and pick the
> pragmatic default.

## Scope

- [ ] <specific question or experiment to run>
- [ ] <deliverable — code sample, benchmark, ADR comment on this issue>
- [ ] Document the chosen approach in `docs/ARCHITECTURE.md` or as a comment here

## Output

<Where the decision will land: CLAUDE.md section, ARCHITECTURE.md, package.json
dependency added, etc.>

---

| | |
|---|---|
| **Sprint start** | YYYY-MM-DD |
| **Sprint end**   | YYYY-MM-DD |
````

---

## Bug Report

```markdown
## Context

<What broke, when was it introduced, what is the impact (data loss? UX? perf?)>

## Steps to reproduce

1. <step>
2. <step>
3. <expected vs. actual>

## Expected behavior

<what should happen>

## Actual behavior

<what happens instead — be exact: HTTP status, error message, wrong value>

## Relevant logs / errors
```

<paste error / stack trace here>

```

## Technical notes

- Environment: Node `node --version`, branch `git branch --show-current`
- DB migrations up to date: yes/no
- <suspected root cause or area to investigate>

---

## Definition of Done

- [ ] Root cause identified and documented as a comment
- [ ] Fix implemented and verified locally
- [ ] Regression test added
- [ ] Linting passes (`npm run lint`)
- [ ] PR opened, reviewed, merged to `main`
- [ ] Issue closed, Stage → Done on board

---

| | |
|---|---|
| **Sprint start** | YYYY-MM-DD |
| **Sprint end**   | YYYY-MM-DD |
```

---

## Docs

```markdown
## Context

<What is missing or wrong in the documentation and why it matters now.>

## Deliverables

- [ ] <specific doc section to write or update>
- [ ] <file to create or modify>

## Files to update

- `docs/ARCHITECTURE.md` — <what section>
- `CLAUDE.md` — <what section>
- `api/.env.example` — <what vars>

---

|                  |            |
| ---------------- | ---------- |
| **Sprint start** | YYYY-MM-DD |
| **Sprint end**   | YYYY-MM-DD |
```
