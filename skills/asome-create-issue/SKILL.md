---
name: asome-create-issue
description: >
  Create an enriched GitHub issue for any ASOME project following ASOME conventions.
  Trigger: "create issue", "new issue", "agregar issue", "crear issue", "asome issue",
  or when the user describes a task/bug/research item for the current project.
license: Apache-2.0
metadata:
  author: asome
  version: "1.1"
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

## Issue title format

```
<Milestone or context>: <Area context> — <imperative description>
```

Examples:

- `M0: NestJS bootstrap — AppModule + config + main.ts conventions`
- `M2: Web — clients list + detail + create/edit form`
- `DevEx: Add VS Code workspace settings + recommended extensions`
- `Bug: Finance summary endpoint returns wrong margin when no payments`

Adapt the prefix to the project's milestone convention.

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
Backend → ### Data Model | ### API Endpoints | ### Business Logic
Frontend → ### Routes | ### Components | ### State / Queries
Infra → ### Architecture | ### Pipeline
Full-stack → combine above
-->

<Rich content per subsection: data models in code blocks, architecture flows, endpoint
signatures, FSM tables, permission matrices. Not bullet lists — structured docs.>

## Technical notes

- <gotcha, constraint, or pattern to follow>
- <env var, dependency, or infra prerequisite>

---

## Definition of Done

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
| area | `area:infra` · `area:backend` · `area:frontend` · `area:docs` |
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
- If `.asome/config.json` is missing, run `/asome-setup` first — all field IDs and option IDs come from there.
