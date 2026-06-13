---
name: asome-sdd
description: >
  SDD (Spec-Driven Development) workflow for ASOME projects. Defines when SDD is required,
  maps SDD phases to ASOME board stages, and provides the command sequence for features,
  bugs, and research. All ASOME feature work MUST go through SDD.
  Trigger: "sdd", "spec driven", "empezar feature", "start feature", "how do I implement",
  "qué comandos uso para implementar", or when starting work on a Feature/Improvement/Setup issue.
license: Apache-2.0
metadata:
  author: asome
  version: "1.0"
---

# ASOME — SDD Workflow

ASOME uses **Spec-Driven Development (SDD)** for all non-trivial work.
SDD produces a spec, design, and task list BEFORE writing code — so every PR has a clear contract.

---

## When to use SDD

| Issue Kind | SP | SDD Required? | Entry command |
|---|---|---|---|
| Feature | ≥ 3 | **Mandatory** | `/sdd-ff <name>` or `/sdd-new <name>` |
| Improvement | ≥ 3 | **Mandatory** | `/sdd-ff <name>` |
| Setup | any | **Mandatory** | `/sdd-ff <name>` |
| Feature / Improvement | 1–2 | Recommended | `/sdd-ff <name>` or skip |
| Research / Spike | any | Optional | `/sdd-explore <topic>` |
| Bug | any | Skip | `/asome-commit` directly |
| Docs | any | Skip | `/asome-commit` directly |
| Chore / Style | any | Skip | `/asome-commit` directly |

When in doubt: **if it touches product logic, use SDD.**

---

## Change name convention

Derived from the issue title. Format: `<area>-<short-imperative-slug>`

| Issue | Change name |
|---|---|
| `M1: Auth — Cognito JWT strategy` | `auth-cognito-jwt` |
| `M2: Web — clients list + CRUD` | `clients-crud` |
| `M3: Proyectos — create/edit form` | `projects-form` |
| `DevEx: Add VS Code settings` | `devex-vscode-settings` |
| `M5: Finanzas — margin summary endpoint` | `finance-margin-summary` |

---

## Full workflow

### Phase 0 — issue exists (pre-SDD)

```
/asome-create-issue   → creates issue, sets board Stage = To Do
/asome-sprint plan    → assigns to sprint
```

### Phase 1 — exploration (optional for well-understood features)

```
/sdd-explore <change-name>
```

Reads the codebase. Outputs findings and tradeoffs. No artifacts created yet.
Use when the approach is unclear or multiple options exist.

### Phase 2 — fast-forward planning (recommended entry point)

```
/sdd-ff <change-name>
```

Runs all planning phases back-to-back:
1. **proposal** — intent, scope, approach
2. **spec** — requirements and acceptance criteria
3. **design** — architecture decisions and approach
4. **tasks** — ordered, atomic task checklist

After `/sdd-ff` completes → move board Stage to **In Progress** (`/asome-sprint move <N> in-progress`).

> For larger or ambiguous features, prefer `/sdd-new <name>` for interactive phase-by-phase planning.

### Phase 3 — implementation

```
/sdd-apply            → implements one batch of tasks from the task list
/asome-commit         → commits each completed task (conventional commit)
```

Repeat apply + commit until all tasks are done.
Do NOT commit code that isn't covered by a task.

### Phase 4 — verification

```
/sdd-verify           → validates implementation against spec and tasks
```

Must pass before opening a PR. If CRITICAL findings exist, fix them and re-verify.

### Phase 5 — pull request

```
/asome-branch-pr      → opens PR; checks SDD verify status for features
```

PR description MUST reference the SDD change name:
```markdown
> SDD change: `<change-name>`
```

Move board Stage to **In Review** (happens automatically in `/asome-branch-pr`).

### Phase 6 — archive (after PR merges)

```
/sdd-archive <change-name>   → closes the change, persists final state
/asome-sprint move <N> done  → marks issue Done on board
```

---

## Diagram

```
Issue created (To Do)
       │
       ▼
  /sdd-ff <name>  ──── generates: proposal → spec → design → tasks
       │
       ▼
  Stage → In Progress
       │
       ▼
  /sdd-apply  ──── implements task batch
  /asome-commit ── commits each task
       │  (repeat until all tasks done)
       ▼
  /sdd-verify  ──── must pass (no CRITICAL)
       │
       ▼
  /asome-branch-pr  ──── opens PR, Stage → In Review
       │
       ▼
  [PR reviewed + merged]
       │
       ▼
  /sdd-archive + /asome-sprint move <N> done
```

---

## Board stage ↔ SDD phase mapping

| Board Stage | SDD phase |
|---|---|
| Backlog | Not yet in sprint |
| To Do | Issue created, sprint assigned |
| In Progress | `/sdd-ff` done, implementation started |
| In Review | PR open, `/sdd-verify` passed |
| Done | PR merged, `/sdd-archive` complete |
| Blocked | Blocked during any phase — document blocker on issue |

---

## Gotchas

- **Never skip `/sdd-verify`** for features. A PR without a passing verify has no spec coverage.
- **`/sdd-ff` vs `/sdd-new`**: use `ff` for well-understood features (faster). Use `new` for complex/uncertain ones (interactive, lets you steer each phase).
- **Task granularity**: each task in the task list should be one commit. If a task takes > 1 commit, it was too big.
- **Change names are stable**: once set, never rename a change (engram tracks it by that key).
- **Research issues**: use `/sdd-explore` only — do NOT run `ff`. Document findings as an issue comment. No PR needed.
