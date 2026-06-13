---
name: asome-sprint
description: >
  Manage the ASOME project sprint board: plan a sprint, move issue stages, report velocity.
  Trigger: "plan sprint", "sprint report", "move issue", "mover issue", "sprint actual",
  "qué hay en el sprint", "cuántos puntos", "stage del issue", or any board management request.
license: Apache-2.0
metadata:
  author: asome
  version: "1.1"
---

# ASOME — Sprint Management

Three sub-commands: **plan**, **move**, **report**. Executes directly.

> **Prerequisite**: `.asome/config.json` must exist. If missing, run `/asome-setup` first.

---

## Resolve project context

```bash
REPO=$(jq -r '.repo' .asome/config.json)
PROJECT_NUM=$(jq -r '.project_num' .asome/config.json)
PROJECT_ID=$(jq -r '.project_id' .asome/config.json)
ORG=${REPO%%/*}

F_STAGE=$(jq -r '.fields.Stage.id' .asome/config.json)
F_SPRINT=$(jq -r '.fields.Sprint.id' .asome/config.json)
F_SP=$(jq -r '."fields"."Story Points".id' .asome/config.json)

# Stage option IDs
STAGE_BACKLOG=$(jq -r '.fields.Stage.options["Backlog"]' .asome/config.json)
STAGE_TODO=$(jq -r '.fields.Stage.options["To Do"]' .asome/config.json)
STAGE_IN_PROGRESS=$(jq -r '.fields.Stage.options["In Progress"]' .asome/config.json)
STAGE_IN_REVIEW=$(jq -r '.fields.Stage.options["In Review"]' .asome/config.json)
STAGE_BLOCKED=$(jq -r '.fields.Stage.options["Blocked"]' .asome/config.json)
STAGE_DONE=$(jq -r '.fields.Stage.options["Done"]' .asome/config.json)
STAGE_CANCELLED=$(jq -r '.fields.Stage.options["Cancelled"]' .asome/config.json)
```

To look up a sprint iteration ID:
```bash
# By title match (e.g., "Sprint 2")
jq -r '.fields.Sprint.iterations[] | select(.title | test("Sprint 2")) | .id' .asome/config.json

# List all sprints
jq -r '.fields.Sprint.iterations[] | "\(.title): \(.id) (\(.start) – \(.end))"' .asome/config.json
```

---

## Sub-command: plan

**Trigger:** "plan sprint N", "assign issues to sprint", "qué va en el sprint"

Assigns a list of issues to a sprint and sets their Stage to **To Do**.

```bash
ISSUE_NUM=5
SPRINT_ITER_ID=$(jq -r '.fields.Sprint.iterations[] | select(.title | test("Sprint 1")) | .id' .asome/config.json)

# Get item ID from issue
ISSUE_NODE=$(gh api repos/$REPO/issues/$ISSUE_NUM --jq .node_id)
ITEM_ID=$(gh api graphql -f query="
{node(id:\"$ISSUE_NODE\"){...on Issue{projectItems(first:5){nodes{id}}}}}" \
  --jq '.data.node.projectItems.nodes[0].id')

# Set Sprint
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{
  projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",
  fieldId:\"$F_SPRINT\",
  value:{iterationId:\"$SPRINT_ITER_ID\"}}){projectV2Item{id}}}"

# Set Stage → To Do
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{
  projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",
  fieldId:\"$F_STAGE\",
  value:{singleSelectOptionId:\"$STAGE_TODO\"}}){projectV2Item{id}}}"

echo "Issue #$ISSUE_NUM → Sprint + To Do"
```

---

## Sub-command: move

**Trigger:** "move issue N to In Progress", "mover al #N a Done", "marcar como bloqueado"

Moves a single issue to a new Stage on the board.

Stage lookup:
```bash
# Get option ID for any stage name
STAGE_OPT=$(jq -r '.fields.Stage.options["In Progress"]' .asome/config.json)
```

```bash
ISSUE_NUM=3
TARGET_STAGE_ID=$(jq -r '.fields.Stage.options["In Progress"]' .asome/config.json)

ISSUE_NODE=$(gh api repos/$REPO/issues/$ISSUE_NUM --jq .node_id)
ITEM_ID=$(gh api graphql -f query="
{node(id:\"$ISSUE_NODE\"){...on Issue{projectItems(first:5){nodes{id}}}}}" \
  --jq '.data.node.projectItems.nodes[0].id')

gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{
  projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",
  fieldId:\"$F_STAGE\",
  value:{singleSelectOptionId:\"$TARGET_STAGE_ID\"}}){projectV2Item{id}}}"

echo "Issue #$ISSUE_NUM Stage → <target>"

# Also update status label if applicable
gh issue edit $ISSUE_NUM --repo "$REPO" --add-label "status:in-review"   # for In Review
gh issue edit $ISSUE_NUM --repo "$REPO" --remove-label "status:blocked"  # cleanup
```

---

## Sub-command: report

**Trigger:** "sprint report", "reporte del sprint", "velocity", "cuántos puntos hicimos", "qué está bloqueado"

Fetches the board state and generates a sprint summary.

```bash
gh project item-list $PROJECT_NUM --owner "$ORG" --format json | python3 - << 'EOF'
import sys, json

data = json.load(sys.stdin)
by_stage = {}
total_sp = 0
blocked = []

for item in data.get("items", []):
    stage = item.get("Stage", "—")
    sp    = item.get("Story Points", 0) or 0
    title = item.get("title", "?")
    num   = item.get("number", "?")

    by_stage.setdefault(stage, {"items": [], "sp": 0})
    by_stage[stage]["items"].append(f"  #{num} {title} [{sp}SP]")
    by_stage[stage]["sp"] += sp
    total_sp += sp if stage == "Done" else 0

    if stage == "Blocked":
        blocked.append(f"#{num} {title}")

ORDER = ["In Progress", "In Review", "Blocked", "To Do", "Done", "Backlog", "Cancelled"]
print("# Sprint Report\n")
for stage in ORDER:
    if stage not in by_stage: continue
    info = by_stage[stage]
    print(f"## {stage} ({info['sp']} SP)")
    for i in info["items"]:
        print(i)
    print()

print(f"## Velocity (Done SP): {total_sp}")
if blocked:
    print(f"\n## Blockers")
    for b in blocked:
        print(f"  - {b}")
EOF
```

The report output is markdown — paste directly into Slack/Notion/standup.
