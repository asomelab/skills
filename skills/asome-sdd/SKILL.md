---
name: asome-sdd
description: >
  SDD (Spec-Driven Development) workflow for ASOME projects, implemented with OpenSpec.
  Defines when SDD is required, maps SDD phases to ASOME board stages, and provides the
  command sequence for features, bugs, and research. All ASOME feature work MUST go through SDD.
  Trigger: "sdd", "spec driven", "empezar feature", "start feature", "how do I implement",
  "qué comandos uso para implementar", "openspec", "opsx", or when starting work on a
  Feature/Improvement/Setup issue.
license: Apache-2.0
metadata:
  author: asome
  version: "2.0"
---

# ASOME — SDD Workflow (OpenSpec)

ASOME uses **Spec-Driven Development (SDD)** for all non-trivial work: a proposal, spec, design
and task list exist BEFORE code, so every PR has a contract to review against.

**Implemented by [OpenSpec](https://openspec.dev)** (`@fission-ai/openspec`, MIT), profile `core`.
Artifacts are versioned Markdown under `openspec/changes/<change-name>/` and travel in the same
PR as the code.

> Reference: ASOME Engineering Manual §7.6 (flujo de especificación), §3.4 (nivel de
> especificación según el trabajo), §7.11 (modos de ejecución).
> Decision: `docs/adr/ADR-0001-openspec-como-metodo-de-especificacion.md` in each repo.

**Engram is NOT the artifact store any more.** It keeps persistent memory across sessions
(R4 of §7.3): decisions, gotchas, learnings. Change artifacts live in `openspec/`.

---

## Prerequisite: the repo must be initialized

```bash
openspec init --tools claude,codex,agents --language es
```

Creates `openspec/`, the `/opsx:*` commands for Claude Code, and the shared skills for Codex
(the secondary harness used for cross-review, §7.10). Without this, no `/opsx:*` command exists
in that repository.

Check with `openspec doctor` or `openspec list`.

---

## When to use SDD

The criterion is **ambiguity, not perceived size** (§7.6 `POLICY`: *"El flujo completo no se
elige por tamaño percibido del cambio. Ceremonia para un fix de una línea es cómo muere
el método."*).

| Issue Kind | SP | SDD Required? | Entry command |
|---|---|---|---|
| Feature | ≥ 3 | **Mandatory** | `/opsx:propose <name>` |
| Improvement | ≥ 3 | **Mandatory** | `/opsx:propose <name>` |
| Setup | any | **Mandatory** | `/opsx:propose <name>` |
| Feature / Improvement | 1–2 | Recommended | `/opsx:propose <name>` or skip |
| Research / Spike | any | Optional | `/opsx:explore <topic>` |
| Bug (known cause) | any | Skip | `/asome-commit` directly |
| Docs | any | Skip | `/asome-commit` directly |
| Chore / Style | any | Skip | `/asome-commit` directly |

This table is the operational form of §3.4 of the manual:

| Trabajo | Especificación |
|---|---|
| Bug con causa conocida | La issue alcanza |
| Cambio acotado y entendido | HU + criterios de aceptación |
| Funcionalidad nueva con ambigüedad | Flujo completo |
| Módulo que el cliente firma, motor de cálculo, integración fiscal o de pagos | Flujo completo + ADR + validación explícita del cliente |

When in doubt: **if it touches product logic, use SDD.**

---

## Change name convention

Derived from the issue title. Format: `<area>-<short-imperative-slug>`, kebab-case.
It becomes the directory name: `openspec/changes/<change-name>/`.

| Issue | Change name |
|---|---|
| `M1: Auth — Cognito JWT strategy` | `auth-cognito-jwt` |
| `M2: Web — clients list + CRUD` | `clients-crud` |
| `M3: Padrón — filtro por sucursal` | `padron-filtro-sucursal` |
| `DevEx: Add VS Code settings` | `devex-vscode-settings` |
| `M5: Finanzas — margin summary endpoint` | `finance-margin-summary` |

---

## Full workflow

### Phase 0 — issue exists (pre-SDD)

```
/asome-create-issue   → creates issue, sets board Stage = Todo
/asome-sprint plan    → assigns to sprint
```

The issue must satisfy the Definition of Ready (§3.6) before anything below.

### Phase 1 — exploration (optional)

```
/opsx:explore <topic>
```

Thinking mode: reads code, compares approaches, clarifies requirements. **Never writes code.**
It may create or update change artifacts, but only after asking and getting an explicit yes.
Use when the approach is unclear or several options exist.

### Phase 2 — planning

```
/opsx:propose <change-name>
```

Generates **all** planning artifacts in one step:

```
openspec/changes/<change-name>/
├── proposal.md   intent, scope, approach
├── design.md     architecture decisions
├── specs/        requirements and scenarios
└── tasks.md      ordered, atomic checklist
```

**Hard boundary:** `/opsx:propose` is planning only. It stops after the artifacts and will not
write code, even if your message asked it to build something. That enforces §7.6 `POLICY`:
*"La propuesta la aprueba una persona antes de que se escriba código."*

**Read the four artifacts before continuing.** A weak spec makes `/opsx:apply` amplify the
weakness (P9: *"Un problema mal especificado no se soluciona agregando IA."*).

Needs changes? → `/opsx:update` (revises artifacts, never touches code). Do NOT fix the spec
during apply.

Then move the board: `/asome-sprint move <N> in-progress`.

### Phase 3 — implementation

```
/opsx:apply           → implements one batch of tasks, ticking them off
/asome-commit         → commits each completed task (conventional, atomic)
```

Repeat until every task is done. Do NOT commit code that isn't covered by a task.

Does the change need an ADR (§4.2)? Write it in `docs/adr/` — **not** in `openspec/`. Change
artifacts get archived; ADRs are permanent.

### Phase 4 — verification

```
/asome-review         → validates the diff against openspec/changes/<name>/
```

OpenSpec profile `core` has no `verify` workflow, so `/asome-review` covers the `verify` phase
of §7.6: checks the diff against spec, design and tasks, plus conventions, antipatterns and
design-system compliance.

Must pass before opening the PR. CRITICAL findings get fixed and re-verified.

Also run the cross-review of §7.10 with the secondary harness (Codex): the agent that wrote the
code never approves it.

### Phase 5 — pull request

```
/asome-branch-pr      → opens PR against the development branch, Stage → In Review
```

The PR description MUST reference the change:

```markdown
> SDD change: `<change-name>` · artifacts in `openspec/changes/<change-name>/`
```

The `openspec/` diff travels with the code — that's the point: the reviewer sees the contract
and the implementation together.

### Phase 6 — archive (after the PR merges)

```
/opsx:archive <change-name>   → moves to openspec/changes/archive/, updates main specs
/asome-sprint move <N> done   → marks the issue Done on the board
```

Anything worth surviving the archive goes to an ADR (`docs/adr/`), to `AGENTS.md`, or to
engram — the archive does not do it for you.

---

## Diagram

```
Issue created (Todo)
       │
       ▼
  /opsx:explore        (optional — thinking only, no code)
       │
       ▼
  /opsx:propose <name> ──── proposal + design + specs + tasks
       │                    ⛔ STOPS HERE. A person reads and approves.
       ▼
  Stage → In Progress
       │
       ▼
  /opsx:apply    ──── implements a task batch
  /asome-commit  ──── commits each task
       │  (repeat until all tasks done)
       ▼
  /asome-review  ──── the verify phase. No CRITICAL findings.
  cross-review with Codex (§7.10)
       │
       ▼
  /asome-branch-pr  ──── PR against dev, Stage → In Review
       │
       ▼
  [human reads the full diff and approves — §9.5, not delegable]
       │
       ▼
  Stage → Ready to Merge → author merges (§9.6)
       │
       ▼
  /opsx:archive + /asome-sprint move <N> done
```

---

## Board stage ↔ SDD phase mapping

Closes PREGUNTA 05 of the manual. Stage names below are the real options of the ASOME board
`Status` field.

| Board Stage | SDD phase | Artifact that must exist |
|---|---|---|
| `Backlog` | Not yet in sprint | — |
| `Todo` | Issue created, sprint assigned, DoR met (§3.6) | issue with verifiable acceptance criteria |
| `In Progress` | `/opsx:propose` done, implementation running | `openspec/changes/<name>/` complete |
| `In Review` | PR open, `/asome-review` passed | PR with evidence (§9.4) |
| `Review Failed` | Blocking findings → `/opsx:update`, not `/opsx:apply` | findings on the PR |
| `Ready to Merge` | Approved by someone who read the diff (§9.5) | human approval |
| `Blocked` | Blocked in any phase | blocker documented on the issue |
| `Done` | PR merged, change archived | `openspec/changes/archive/<name>/` |
| `Cancelled` | Dropped | reason on the issue |

---

## Gotchas

- **Never skip verification.** A PR without a passing `/asome-review` has no spec coverage.
- **`/opsx:propose` will not implement.** Stopping after the artifacts is the feature, not a
  bug. Send a new message to start `/opsx:apply`.
- **Fix specs with `/opsx:update`, never during apply.** Editing the contract while
  implementing against it defeats the whole method.
- **Change names are stable.** Once set, never rename — it's the directory name and it's
  referenced from the PR.
- **One agent = one worktree = one branch** (§7.9). Never run two `/opsx:apply` on the same
  change in parallel; task progress merges, it does not overwrite.
- **Task granularity**: one task ≈ one commit. If a task takes more than one, it was too big.
- **Research issues**: `/opsx:explore` only. Do NOT propose. Document findings as an issue
  comment. No PR.
- **`openspec/` inflates the PR line count.** Say so in the PR description and point at where
  to start reading (§9.2).
- **Engram is memory, not artifact store.** Decisions and gotchas that outlive the change go
  to engram or to an ADR; the change directory gets archived.
