---
name: asome-create-issue
description: >
  Create an enriched GitHub issue for any ASOME project following ASOME conventions.
  Trigger: "create issue", "new issue", "agregar issue", "crear issue", "asome issue",
  or when the user describes a task/bug/research item for the project.
license: Apache-2.0
metadata:
  author: asome
  version: "1.1"
---

# ASOME — Create Issue

Creates a fully enriched GitHub issue AND adds it to the project board with all custom fields
populated (Stage, Priority, Kind, Story Points, Area, Start, Target, Sprint).

**Executes directly — no preview step.**

> **Prerequisite**: `.asome/config.json` must exist. If missing, run `/asome-setup` first.

---

## Resolve project context

```bash
# Read config
REPO=$(jq -r '.repo' .asome/config.json)
PROJECT_ID=$(jq -r '.project_id' .asome/config.json)

# Field IDs
F_STAGE=$(jq -r '.fields.Stage.id' .asome/config.json)
F_PRIORITY=$(jq -r '.fields.Priority.id' .asome/config.json)
F_KIND=$(jq -r '.fields.Kind.id' .asome/config.json)
F_AREA=$(jq -r '.fields.Area.id' .asome/config.json)
F_SP=$(jq -r '."fields"."Story Points".id' .asome/config.json)
F_START=$(jq -r '.fields.Start.id' .asome/config.json)
F_TARGET=$(jq -r '.fields.Target.id' .asome/config.json)
F_SPRINT=$(jq -r '.fields.Sprint.id' .asome/config.json)
```

To look up a specific option ID by name (e.g., Stage "In Progress"):
```bash
jq -r '.fields.Stage.options["In Progress"]' .asome/config.json
```

To look up a sprint iteration ID by title:
```bash
jq -r '.fields.Sprint.iterations[] | select(.title | test("Sprint 2")) | .id' .asome/config.json
```

---

## Information to gather

Before creating, confirm with the user (or infer from context):

| Field | Question |
|---|---|
| Title | Short imperative description |
| Milestone | M0–MN (or DevEx / Docs for cross-cutting) |
| Area | Infra / Backend / Frontend / Docs |
| Kind | Feature / Setup / Research / Bug / Docs / Improvement |
| Priority | Urgent / High / Medium / Low |
| Story Points | 1, 2, 3, 5, 8, 13 (Fibonacci) |
| Sprint | Derived from milestone (M0→Sprint 1, M1→Sprint 2, ...) |
| Body | Requirements/Deliverables + DoD checklist |

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

Use `references/issue-template.md`. Fill every section based on the issue Kind.

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
  --repo "$REPO" \
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
# Active sprint → "To Do"; future sprint → "Backlog"
STAGE_OPT=$(jq -r '.fields.Stage.options["To Do"]' .asome/config.json)
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",fieldId:\"$F_STAGE\",value:{singleSelectOptionId:\"$STAGE_OPT\"}}){projectV2Item{id}}}"

# Step 5 — Set Priority
PRIORITY_OPT=$(jq -r '.fields.Priority.options["High"]' .asome/config.json)   # replace as needed
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",fieldId:\"$F_PRIORITY\",value:{singleSelectOptionId:\"$PRIORITY_OPT\"}}){projectV2Item{id}}}"

# Step 6 — Set Kind
KIND_OPT=$(jq -r '.fields.Kind.options["Feature"]' .asome/config.json)   # replace as needed
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",fieldId:\"$F_KIND\",value:{singleSelectOptionId:\"$KIND_OPT\"}}){projectV2Item{id}}}"

# Step 7 — Set Area
AREA_OPT=$(jq -r '.fields.Area.options["Backend"]' .asome/config.json)   # replace as needed
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",fieldId:\"$F_AREA\",value:{singleSelectOptionId:\"$AREA_OPT\"}}){projectV2Item{id}}}"

# Step 8 — Set Story Points (NOTE: must be inlined as number literal)
SP=5
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",fieldId:\"$F_SP\",value:{number:$SP}}){projectV2Item{id}}}"

# Step 9 — Set Start + Target dates
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",fieldId:\"$F_START\",value:{date:\"YYYY-MM-DD\"}}){projectV2Item{id}}}"
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",fieldId:\"$F_TARGET\",value:{date:\"YYYY-MM-DD\"}}){projectV2Item{id}}}"

# Step 10 — Set Sprint
SPRINT_OPT=$(jq -r '.fields.Sprint.iterations[] | select(.title | test("Sprint 1")) | .id' .asome/config.json)
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",fieldId:\"$F_SPRINT\",value:{iterationId:\"$SPRINT_OPT\"}}){projectV2Item{id}}}"
```

---

## SDD reminder

After creating the issue:
- **Feature / Improvement / Setup** (SP ≥ 3): start `/asome-sdd` → use `/sdd-ff <change-name>` before touching code.
- **Bug / Docs / Chore**: go straight to implementation + `/asome-commit`.
- **Research**: use `/sdd-explore <topic>`, document findings as an issue comment.

---

## Known gotchas

- **NEVER** use `--assignee ""` in `gh issue create` — fails silently (no issue created, no error shown).
- **Story Points MUST be inlined** as `value:{number:5}` in the mutation — passing via `-f val=5` sends a string and GraphQL rejects it silently.
- `--milestone` expects the exact milestone title string, not the number.
- To refresh config after adding new sprints or fields: run `/asome-setup`.
