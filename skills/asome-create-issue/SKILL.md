---
name: asome-create-issue
description: >
  Create an enriched GitHub issue for asomelab/asome-portal following ASOME conventions.
  Trigger: "create issue", "new issue", "agregar issue", "crear issue", "asome issue",
  or when the user describes a task/bug/research item for the portal project.
license: Apache-2.0
metadata:
  author: asome
  version: "1.0"
  project: asomelab/asome-portal
---

# ASOME — Create Issue

Creates a fully enriched GitHub issue in `asomelab/asome-portal` AND adds it to Project #6
with all custom fields populated (Stage, Priority, Kind, Story Points, Area, Start, Target, Sprint).

**Executes directly** — no preview step.

---

## Project constants

```
REPO        = asomelab/asome-portal
PROJECT_ID  = PVT_kwDODNkJ584Bakec   (Project #6)

Field IDs:
  Stage        PVTSSF_lADODNkJ584BakeczhVbLds
  Priority     PVTSSF_lADODNkJ584BakeczhVbLdw
  Kind         PVTSSF_lADODNkJ584BakeczhVbLj4
  Story Points PVTF_lADODNkJ584BakeczhVbLeo
  Area         PVTSSF_lADODNkJ584BakeczhVbJG8
  Start        PVTF_lADODNkJ584BakeczhVbJIo
  Target       PVTF_lADODNkJ584BakeczhVbJJg
  Sprint       PVTIF_lADODNkJ584BakeczhVbLj8

Stage options:    Backlog eb7a63bb | To Do 8ce063f1 | In Progress c7995139
                  In Review 0e32ac74 | Blocked 0a9f48e0 | Done 75d5718b | Cancelled 69980f3e
Priority options: Urgent 563fa301 | High 97590af3 | Medium 5f85dabf | Low 5fc6919d | No Priority 38e3cabe
Kind options:     Feature c220fe61 | Setup c7be4240 | Research 0693a04e | Bug 93398800 | Docs 80478664 | Improvement 766b0d4c
Area options:     Infra c0447b28 | Backend d0e1cb2c | Frontend 4a439165 | Docs 4a424d37

Sprint iteration IDs:
  Sprint 1 (M0) 4290fa00  Sprint 2 (M1) c98e0158  Sprint 3 (M2) 45612da9
  Sprint 4 (M3) bc1c8745  Sprint 5 (M4) 9bb83a8f  Sprint 6 (M5) d8dcb44e
  Sprint 7 (M6) 8f6809f4
```

To refresh IDs if the project changes:

```bash
gh api graphql -f query='{node(id:"PVT_kwDODNkJ584Bakec"){...on ProjectV2{fields(first:20){nodes{...on ProjectV2SingleSelectField{id name options{id name}}...on ProjectV2IterationField{id name configuration{iterations{id title}}}...on ProjectV2Field{id name}}}}}}'
```

---

## Information to gather

Before creating, confirm with the user (or infer from context):

| Field        | Question                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------- |
| Title        | Short imperative description                                                                |
| Milestone    | M0–M6 (or DevEx / Docs for cross-cutting)                                                   |
| Area         | Infra / Backend / Frontend / Docs                                                           |
| Kind         | Feature / Setup / Research / Bug / Docs / Improvement                                       |
| Priority     | Urgent / High / Medium / Low                                                                |
| Story Points | 1, 2, 3, 5, 8, 13 (Fibonacci)                                                               |
| Sprint       | Derived from milestone (M0→S1, M1→S2, ...)                                                  |
| Body         | Context (WHY) + Scope (subsections with models/flows) + Technical notes + DoD + Dates table |

---

## Issue title format

```
M<n>: <Area context> — <imperative description>
```

Examples:

- `M0: NestJS bootstrap — AppModule + config + main.ts conventions`
- `M2: Web — clients list + detail + create/edit form`
- `DevEx: Add VS Code workspace settings + recommended extensions`
- `Bug: Finance summary endpoint returns wrong margin when no payments`

---

## Issue body template

Use `references/issue-template.md`. The body must read like a **mini design doc** — not a
bullet dump. Model quality: wootic/reviste#241, #257, #259.

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

<Rich content per subsection: Prisma models in code blocks, architecture flows, endpoint
signatures, FSM tables, permission matrices. Not bullet lists — structured docs.>

## Technical notes

- <gotcha, constraint, or pattern to follow>
- <env var, dependency, or infra prerequisite>

**Ref:** `reviste/api/src/<path>`

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
- [ ] Data models in `prisma` code blocks when relevant
- [ ] Architecture flows in plain code blocks when relevant
- [ ] `## Technical notes` has at least one implementation constraint
- [ ] `**Ref:**` present if a reviste analogue exists
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
# Step 1 — Create the issue
ISSUE_URL=$(gh issue create \
  --repo asomelab/asome-portal \
  --title "M<n>: <title>" \
  --body "$(cat <<'BODY'
<body content>
BODY
)" \
  --milestone "<milestone title>" \
  --label "area:<x>,type:<x>,priority:<x>")
echo "Issue: $ISSUE_URL"

# Step 2 — Get issue node ID
ISSUE_NUM=$(echo "$ISSUE_URL" | grep -oE '[0-9]+$')
ISSUE_NODE=$(gh api repos/asomelab/asome-portal/issues/$ISSUE_NUM --jq .node_id)

# Step 3 — Add to Project #6
ITEM_ID=$(gh api graphql -f query="
mutation {
  addProjectV2ItemById(input:{projectId:\"PVT_kwDODNkJ584Bakec\",contentId:\"$ISSUE_NODE\"}){
    item{id}
  }
}" --jq '.data.addProjectV2ItemById.item.id')
echo "Item: $ITEM_ID"

# Step 4 — Set Stage (To Do for active sprint, Backlog for future)
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"PVT_kwDODNkJ584Bakec\",itemId:\"$ITEM_ID\",fieldId:\"PVTSSF_lADODNkJ584BakeczhVbLds\",value:{singleSelectOptionId:\"8ce063f1\"}}){projectV2Item{id}}}"

# Step 5 — Set Priority (example: High)
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"PVT_kwDODNkJ584Bakec\",itemId:\"$ITEM_ID\",fieldId:\"PVTSSF_lADODNkJ584BakeczhVbLdw\",value:{singleSelectOptionId:\"97590af3\"}}){projectV2Item{id}}}"

# Step 6 — Set Kind (example: Feature)
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"PVT_kwDODNkJ584Bakec\",itemId:\"$ITEM_ID\",fieldId:\"PVTSSF_lADODNkJ584BakeczhVbLj4\",value:{singleSelectOptionId:\"c220fe61\"}}){projectV2Item{id}}}"

# Step 7 — Set Area (example: Backend)
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"PVT_kwDODNkJ584Bakec\",itemId:\"$ITEM_ID\",fieldId:\"PVTSSF_lADODNkJ584BakeczhVbJG8\",value:{singleSelectOptionId:\"d0e1cb2c\"}}){projectV2Item{id}}}"

# Step 8 — Set Story Points (NOTE: inline number, NOT a string variable)
SP=5
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"PVT_kwDODNkJ584Bakec\",itemId:\"$ITEM_ID\",fieldId:\"PVTF_lADODNkJ584BakeczhVbLeo\",value:{number:$SP}}){projectV2Item{id}}}"

# Step 9 — Set Start + Target dates
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"PVT_kwDODNkJ584Bakec\",itemId:\"$ITEM_ID\",fieldId:\"PVTF_lADODNkJ584BakeczhVbJIo\",value:{date:\"2026-06-13\"}}){projectV2Item{id}}}"
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"PVT_kwDODNkJ584Bakec\",itemId:\"$ITEM_ID\",fieldId:\"PVTF_lADODNkJ584BakeczhVbJJg\",value:{date:\"2026-06-20\"}}){projectV2Item{id}}}"

# Step 10 — Set Sprint (example: Sprint 1)
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"PVT_kwDODNkJ584Bakec\",itemId:\"$ITEM_ID\",fieldId:\"PVTIF_lADODNkJ584BakeczhVbLj8\",value:{iterationId:\"4290fa00\"}}){projectV2Item{id}}}"
````

---

## Known gotchas

- **NEVER** use `--assignee ""` in `gh issue create` — fails silently (no issue created, no error shown).
- **Story Points MUST be inlined** as `value:{number:5}` in the mutation — passing via `-f val=5` sends a string and GraphQL rejects it silently.
- `--milestone` expects the exact milestone title string, not the number.
