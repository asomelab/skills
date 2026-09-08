---
name: asome-create-issue
description: >
  Create an enriched GitHub issue for any ASOME project following ASOME conventions:
  one vertical, demonstrable slice per issue, traced to a problem in the mapa operativo.
  Trigger: "create issue", "new issue", "agregar issue", "crear issue", "asome issue",
  or when the user describes a task/bug/research item for the current project.
license: Apache-2.0
metadata:
  author: asome
  version: "2.0"
---

# ASOME — Create Issue

Creates a fully enriched GitHub issue in the current project AND adds it to the linked
GitHub Project board with all custom fields populated (Stage, Priority, Kind, Story Points,
Area, Start, Target, Sprint).

**Executes directly** — no preview step.

> **Prerequisite**: `.asome/config.json` must exist. If missing, run `/asome-setup` first.

---

## Resolve project context

```bash
REPO=$(jq -r '.repo' .asome/config.json)
PROJECT_ID=$(jq -r '.project_id' .asome/config.json)

F_STAGE=$(jq -r '.fields.Stage.id' .asome/config.json)
F_PRIORITY=$(jq -r '.fields.Priority.id' .asome/config.json)
F_KIND=$(jq -r '.fields.Kind.id' .asome/config.json)
F_SP=$(jq -r '."fields"."Story Points".id' .asome/config.json)
F_AREA=$(jq -r '.fields.Area.id' .asome/config.json)
F_START=$(jq -r '.fields.Start.id' .asome/config.json)
F_TARGET=$(jq -r '.fields.Target.id' .asome/config.json)
F_SPRINT=$(jq -r '.fields.Sprint.id' .asome/config.json)
```

Look up option IDs by name at execution time:

```bash
# Stage option (e.g. "To Do" or "Backlog")
STAGE_OPT=$(jq -r '.fields.Stage.options["To Do"]' .asome/config.json)

# Priority option (e.g. "High")
PRIORITY_OPT=$(jq -r '.fields.Priority.options["High"]' .asome/config.json)

# Kind option (e.g. "Feature")
KIND_OPT=$(jq -r '.fields.Kind.options["Feature"]' .asome/config.json)

# Area option (e.g. "Backend")
AREA_OPT=$(jq -r '.fields.Area.options["Backend"]' .asome/config.json)

# Sprint iteration ID — match by title substring or exact title
SPRINT_ID=$(jq -r '.fields.Sprint.iterations[] | select(.title | test("Sprint 1")) | .id' .asome/config.json)
```

List available milestones from the repo when in doubt:

```bash
gh api repos/$REPO/milestones --jq '.[].title'
```

---

## Information to gather

Before creating, confirm with the user (or infer from context):

| Field        | How to resolve                                                                              |
| ------------ | ------------------------------------------------------------------------------------------- |
| Title        | Short imperative description                                                                |
| Milestone    | List from `gh api repos/$REPO/milestones`; pick the relevant one                           |
| Area         | Available options in `.fields.Area.options` keys                                            |
| Kind         | Available options in `.fields.Kind.options` keys                                            |
| Priority     | Available options in `.fields.Priority.options` keys                                        |
| Story Points | 1, 2, 3, 5, 8, 13 (Fibonacci)                                                               |
| Sprint       | Available iterations in `.fields.Sprint.iterations[].title`                                 |
| Body         | Context (WHY) + Scope (subsections with models/flows) + Technical notes + DoD + Dates table |

---

## Slicing rules — read before deciding how many issues

**One issue = one vertical, demonstrable slice.** If closing it doesn't let you show something to
somebody, it isn't an issue: it's a subtask, and it belongs as a checkbox inside another one.

**Never split by layer.** This is the antipattern that matters most:

```
✓  HU-001 — Padrón de soportes: alta, edición, baja y listado con filtros   track:dev
   ## Scope
   ### Datos     ### API     ### Pantalla
   ───────────────────────────────────────────────────────────────────────
   [UX] HU-001 — Padrón de soportes: listado, filtros y ficha               track:ux

✗  HU-001: endpoints de soporte                                        area:backend
   Padrón: listado con filtros                                         area:frontend
```

The reference model is de-wall's: **one dev issue per story, fullstack, with per-layer
subsections inside — plus a `[UX] HU-NN` twin.** Not two sibling issues.

Splitting by layer produces two issues where neither is demonstrable alone, a "Done" that lies,
story points counted twice, and a dependency nobody tracks.

Legitimate exceptions — work with no user-facing surface:

- infra, pipeline, hosting
- a data schema transversal to N features
- a time-boxed spike or research item
- UX work (its own lane, `track:ux`)

### Every feature issue traces to a problem

From the code of ethics: *"Antes de aprobar una funcionalidad preguntamos qué problema del
relevamiento resuelve. Si no hay respuesta, no se construye."*

So `## Context` on a feature issue **must name the problem from the mapa operativo it resolves**.
If you cannot name one, do not create the issue — raise it as an out-of-scope request instead, which
is what *"Solo lo necesario"* requires.

---

## Issue title format

```
<HU or ref, if there is one> — <imperative description of the user-visible outcome>
```

Examples:

- `HU-001 — Padrón de soportes: alta, edición, baja y listado con filtros`
- `[UX] HU-001 — Padrón de soportes: listado, filtros y ficha`
- `Infra — Hosting de frontend: CDN, dominio y certificado`
- `Spike — Proveedor de mapas (D-04)`
- `Bug — Finance summary devuelve margen incorrecto cuando no hay pagos`

**Do not put the milestone or the area in the title.** Both are board fields. A title like
`S3 · Backend — HU-001: …` duplicates two fields and rots the moment the issue slips a sprint —
and `Backend` is exactly the axis the slicing rules above forbid.

---

## Issue body template

Use `references/issue-template.md`. The body must read like a **mini design doc** — not a
bullet dump.

### Structure (Feature / Setup / Improvement)

```markdown
## Context

<WHY this is needed — business motivation, technical constraint, or product decision.
Be specific. 2-4 sentences. Include a decision blockquote if a non-obvious choice was made.>

> **Decision YYYY-MM-DD:** <key design/arch decision, if any>

## Scope

### <Subsection — adapt to issue type>

<!--
Default for any feature → ### Datos | ### API | ### Pantalla    (all three, always)
Infra                   → ### Arquitectura | ### Pipeline
Research / spike        → ### Preguntas | ### Salida
UX (track:ux)           → ### <Rol> — <pantalla> per screen, plus ### Dónde entra en el flujo

Fullstack is the DEFAULT, not a special case. If one of the three subsections
comes out empty, ask yourself whether the issue is sliced wrong.
-->

<Rich content per subsection: data models in code blocks, architecture flows, endpoint
signatures, FSM tables, permission matrices. Not bullet lists — structured docs.>

## Technical notes

- <gotcha, constraint, or pattern to follow>
- <env var, dependency, or infra prerequisite>

---

## Definition of Done

<!-- Nivel 1 of the three-level DoD. The canonical version lives in
     /asome-sprint references/sprint-canon.md §5 — keep this in sync with it.
     Nivel 2 (per sprint) is verified by `/asome-sprint close`. -->

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
```

### Structure (Research / Spike)

```markdown
## Context

<What question are we answering and why does it block implementation?>

> **Time-box:** N hours max

## Scope

- [ ] <specific experiment / question>
- [ ] Document chosen approach in `docs/ARCHITECTURE.md` or as issue comment

## Output

<Where the decision lands: CLAUDE.md, ARCHITECTURE.md, package.json dep added, etc.>

---

|                  |            |
| ---------------- | ---------- |
| **Sprint start** | YYYY-MM-DD |
| **Sprint end**   | YYYY-MM-DD |
```

### Structure (Bug)

```markdown
## Context

<What broke and what is the impact.>

## Steps to reproduce

1. ...

## Expected / Actual

**Expected:** ...
**Actual:** ...

## Relevant logs
```

<paste here>
```

## Technical notes

- Suspected area: `src/...`

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

### Quality checklist (before submitting any issue body)

- [ ] **The issue is demonstrable on its own** — closing it means something can be shown
- [ ] **No sibling issue holds "the other half"** of the same feature (see Slicing rules)
- [ ] For a feature: `## Context` **names the problem from the mapa operativo** it resolves
- [ ] `## Context` present and explains WHY (not just what)
- [ ] `## Scope` has meaningful subsections — no flat bullet dumps
- [ ] Data models in code blocks when relevant
- [ ] Architecture flows in plain code blocks when relevant
- [ ] `## Technical notes` has at least one implementation constraint
- [ ] `## Definition of Done` checklist present
- [ ] Dates table at the bottom with sprint start/end

---

## Labels to apply

Apply exactly ONE from each group. All three are required; `effort:*` is optional.

| Group | Options |
|---|---|
| track | `track:dev` · `track:ux` (+ `needs:ux` on a dev issue waiting on a design) |
| area | `area:fullstack` · `area:ux` · `area:infra` · `area:producto` |
| type | `type:feature` · `type:setup` · `type:research` · `type:bug` · `type:docs` · `type:improvement` |
| priority | `priority:high` · `priority:med` · `priority:low` |
| effort (opt) | `effort:S` · `effort:M` · `effort:L` · `effort:XL` |

---

## Execution steps

```bash
# Resolve project context
REPO=$(jq -r '.repo' .asome/config.json)
PROJECT_ID=$(jq -r '.project_id' .asome/config.json)
F_STAGE=$(jq -r '.fields.Stage.id' .asome/config.json)
F_PRIORITY=$(jq -r '.fields.Priority.id' .asome/config.json)
F_KIND=$(jq -r '.fields.Kind.id' .asome/config.json)
F_SP=$(jq -r '."fields"."Story Points".id' .asome/config.json)
F_AREA=$(jq -r '.fields.Area.id' .asome/config.json)
F_START=$(jq -r '.fields.Start.id' .asome/config.json)
F_TARGET=$(jq -r '.fields.Target.id' .asome/config.json)
F_SPRINT=$(jq -r '.fields.Sprint.id' .asome/config.json)

# Resolve option IDs for chosen values
STAGE_OPT=$(jq -r '.fields.Stage.options["To Do"]' .asome/config.json)
PRIORITY_OPT=$(jq -r '.fields.Priority.options["High"]' .asome/config.json)
KIND_OPT=$(jq -r '.fields.Kind.options["Feature"]' .asome/config.json)
AREA_OPT=$(jq -r '.fields.Area.options["Backend"]' .asome/config.json)
SPRINT_ID=$(jq -r '.fields.Sprint.iterations[] | select(.title | test("Sprint 1")) | .id' .asome/config.json)
SP=5

# Step 1 — Create the issue
ISSUE_URL=$(gh issue create \
  --repo "$REPO" \
  --title "<milestone>: <title>" \
  --body "$(cat <<'BODY'
<body content>
BODY
)" \
  --milestone "<milestone title>" \
  --label "area:<x>,type:<x>,priority:<x>")
echo "Issue: $ISSUE_URL"

# Step 2 — Get issue node ID
ISSUE_NUM=$(echo "$ISSUE_URL" | grep -oE '[0-9]+$')
ISSUE_NODE=$(gh api repos/$REPO/issues/$ISSUE_NUM --jq .node_id)

# Step 3 — Add to project board
ITEM_ID=$(gh api graphql -f query="
mutation {
  addProjectV2ItemById(input:{projectId:\"$PROJECT_ID\",contentId:\"$ISSUE_NODE\"}){
    item{id}
  }
}" --jq '.data.addProjectV2ItemById.item.id')
echo "Item: $ITEM_ID"

# Step 4 — Set Stage
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",fieldId:\"$F_STAGE\",value:{singleSelectOptionId:\"$STAGE_OPT\"}}){projectV2Item{id}}}"

# Step 5 — Set Priority
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",fieldId:\"$F_PRIORITY\",value:{singleSelectOptionId:\"$PRIORITY_OPT\"}}){projectV2Item{id}}}"

# Step 6 — Set Kind
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",fieldId:\"$F_KIND\",value:{singleSelectOptionId:\"$KIND_OPT\"}}){projectV2Item{id}}}"

# Step 7 — Set Area
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",fieldId:\"$F_AREA\",value:{singleSelectOptionId:\"$AREA_OPT\"}}){projectV2Item{id}}}"

# Step 8 — Set Story Points (NOTE: inline number, NOT a string variable)
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",fieldId:\"$F_SP\",value:{number:$SP}}){projectV2Item{id}}}"

# Step 9 — Set Start + Target dates
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",fieldId:\"$F_START\",value:{date:\"YYYY-MM-DD\"}}){projectV2Item{id}}}"
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",fieldId:\"$F_TARGET\",value:{date:\"YYYY-MM-DD\"}}){projectV2Item{id}}}"

# Step 10 — Set Sprint
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",fieldId:\"$F_SPRINT\",value:{iterationId:\"$SPRINT_ID\"}}){projectV2Item{id}}}"
````

---

## Known gotchas

- **NEVER** use `--assignee ""` in `gh issue create` — fails silently (no issue created, no error shown).
- **Story Points MUST be inlined** as `value:{number:5}` in the mutation — passing via `-f val=5` sends a string and GraphQL rejects it silently.
- `--milestone` expects the exact milestone title string, not the number.
- **Milestone always. Sprint only if the issue is committed** to the current sprint or the next
  one. Beyond that: leave Sprint empty and Stage on `Backlog`. Pre-assigning six sprints of work
  is waterfall wearing a scrum name, and it freezes estimates made before the relevamiento closed.
- **Resolve Stage/Area option ids by regex, not by literal key.** Boards disagree on spelling
  (`To Do` vs `Todo`); a literal `.options["To Do"]` returns `null` and the mutation then fails
  silently. See `/asome-sprint` "Resolve project context".
- If `.asome/config.json` is missing, run `/asome-setup` first — all field IDs and option IDs come from there.
