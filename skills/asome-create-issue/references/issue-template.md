# Issue body templates — ASOME

> **Quality bar**: issues should read like a mini design doc — someone new to the
> codebase should understand WHY, WHAT, and HOW just from the issue body.
> Model: wootic/reviste#241, #257, #259, #253.
>
> Single source for every body structure. `SKILL.md` points here — do not copy these back.
> Outer fences use four backticks so the inner ``` blocks survive.

**Pointers go first.** When an issue carries `needs:ux` or `needs:dep`, the pointer lines are the
very first lines of the body, before `## Context` — exact strings, other skills grep them:

```markdown
> ⛔ **Bloqueado por UX:** #N — *[UX] HU-NN — título*.
> El diseño tiene que estar cerrado antes de empezar a implementar esto.

> ⛔ **Depende de:** #N — *título*.
```

---

## Feature / Setup / Improvement (`track:dev`)

````markdown
## Context

<1-3 sentences: WHY this is needed. For a feature: name the problem from the mapa operativo
it resolves. Be specific about the constraint or opportunity.>

> **Decision YYYY-MM-DD:** <optional — key architectural or design decision worth
> documenting, e.g. "using passport-jwt over @nestjs/jwt because jwks-rsa requires
> custom strategy">

## Scope

<!--
Default for any feature: ### Datos | ### API | ### Pantalla   (all three, always)
Infra:                   ### Arquitectura | ### Pipeline | ### Config

Fullstack is the DEFAULT, not a special case. An issue split into a backend
half and a frontend half is sliced wrong: neither half is demonstrable alone.
If one of the three subsections comes out empty, re-check the slice.
-->

### Datos

```prisma
model Foo {
  id String @id @default(cuid())
}
```

### API

```
POST /api/resource
  → validate DTO
  → call service
  → return 201 + body
```

### Pantalla

<screens, states (empty / loading / error), permissions table if roles differ>

## Technical notes

- <implementation gotcha, edge case, or constraint the implementer must know>
- <reference to existing pattern to follow, e.g. "follow PrismaExceptionFilter pattern">
- <env var required, dependency to install, infra prerequisite>
- **SDD obligatorio** — antes de codear: `/opsx:propose <change-name>` (ver `/asome-sdd`).
  <!-- only for feature/improvement/setup with SP ≥ 3 -->

**Ref:** `<path>` ← existing analogous implementation (omit if none)

---

## Definition of Done

<!-- Nivel 1 of the three-level DoD. Canonical version: /asome-sprint
     references/sprint-canon.md §5 — keep in sync. Nivel 2 is verified by `/asome-sprint close`. -->

- [ ] Feature implemented and working locally
- [ ] Tests written
- [ ] Linting passes
- [ ] Type-check passes
- [ ] PR opened, reviewed, merged to `main`
- [ ] Issue closed, Stage → Done on board

---

|                  |            |
| ---------------- | ---------- |
| **Sprint start** | YYYY-MM-DD |
| **Sprint end**   | YYYY-MM-DD |
````

---

## UX twin (`track:ux`)

````markdown
## Context

Diseño de <HU-NN — outcome>. Implementación: #<dev issue> (lo bloquea hasta que esto esté Done).
<Problem from the mapa operativo it resolves — same as the dev issue.>

## Scope

### <Rol> — <pantalla>

- Estados: vacío · cargando · error · con datos
- Copy: <labels, mensajes de error, confirmaciones>
- Decisiones: <qué se muestra, qué se oculta, qué es editable>

### Dónde entra en el flujo

<de qué pantalla se llega, a cuál se sale>

---

## Definition of Done

- [ ] Frame en Figma con todos los estados, linkeado en este issue
- [ ] Decisiones y copy escritos acá (no solo en Figma)
- [ ] Usa componentes y tokens del design system; lo nuevo, justificado
- [ ] Revisado con dev antes de cerrar
- [ ] Issue closed, Stage → Done on board

---

|                  |            |
| ---------------- | ---------- |
| **Sprint start** | YYYY-MM-DD |
| **Sprint end**   | YYYY-MM-DD |
````

---

## Research / Spike

````markdown
## Context

<What question are we answering, and why does it block implementation?>

> **Time-box:** N hours max — if no clear winner, document tradeoffs and pick the
> pragmatic default.

## Scope

- [ ] <specific question or experiment to run>
- [ ] <deliverable — code sample, benchmark, ADR comment on this issue>
- [ ] Document the chosen approach in `docs/adr/` (if hard to reverse) or as a comment here

## Output

<Where the decision lands: ADR, AGENTS.md section, package.json dependency added, etc.>

---

|                  |            |
| ---------------- | ---------- |
| **Sprint start** | YYYY-MM-DD |
| **Sprint end**   | YYYY-MM-DD |
````

---

## Bug

````markdown
## Context

<What broke, when was it introduced, what is the impact (data loss? UX? perf?)>

## Steps to reproduce

1. <step>
2. <step>

## Expected / Actual

**Expected:** <what should happen>
**Actual:** <what happens instead — be exact: HTTP status, error message, wrong value>

## Relevant logs

```
<paste error / stack trace here — never customer production data>
```

## Technical notes

- Suspected area: `src/...`
- Environment / branch where it reproduces

---

## Definition of Done

- [ ] Root cause documented as a comment
- [ ] Fix implemented and verified locally
- [ ] Regression test added
- [ ] PR opened, reviewed, merged to `main`
- [ ] Issue closed, Stage → Done on board

---

|                  |            |
| ---------------- | ---------- |
| **Sprint start** | YYYY-MM-DD |
| **Sprint end**   | YYYY-MM-DD |
````

---

## Docs

````markdown
## Context

<What is missing or wrong in the documentation and why it matters now.>

## Deliverables

- [ ] <specific doc section to write or update>

## Files to update

- `<path>` — <what section>

---

|                  |            |
| ---------------- | ---------- |
| **Sprint start** | YYYY-MM-DD |
| **Sprint end**   | YYYY-MM-DD |
````
