---
name: asome-sprint
description: >
  Manage the ASOME Portal sprint board: plan a sprint, move issue stages, report velocity.
  Trigger: "plan sprint", "sprint report", "move issue", "mover issue", "sprint actual",
  "qué hay en el sprint", "cuántos puntos", "stage del issue", or any board management request.
license: Apache-2.0
metadata:
  author: asome
  version: "1.0"
  project: asomelab/asome-portal
---

# ASOME — Sprint Management

Three sub-commands: **plan**, **move**, **report**. Executes directly.

---

## Project constants

```
PROJECT_NUM = 6
PROJECT_ID  = PVT_kwDODNkJ584Bakec
OWNER       = asomelab
REPO        = asomelab/asome-portal

Stage field  PVTSSF_lADODNkJ584BakeczhVbLds
  Backlog     eb7a63bb
  To Do       8ce063f1
  In Progress c7995139
  In Review   0e32ac74
  Blocked     0a9f48e0
  Done        75d5718b
  Cancelled   69980f3e

Sprint field PVTIF_lADODNkJ584BakeczhVbLj8
  Sprint 1 (M0 Scaffolding) 4290fa00  2026-06-13 – 2026-06-20
  Sprint 2 (M1 Auth)        c98e0158  2026-06-20 – 2026-06-27
  Sprint 3 (M2 CRM)         45612da9  2026-06-27 – 2026-07-08
  Sprint 4 (M3 Proyectos)   bc1c8745  2026-07-08 – 2026-07-18
  Sprint 5 (M4 Equipo)      9bb83a8f  2026-07-18 – 2026-07-25
  Sprint 6 (M5 Finanzas)    d8dcb44e  2026-07-25 – 2026-08-05
  Sprint 7 (M6 Dashboard)   8f6809f4  2026-08-05 – 2026-08-12

Story Points field PVTF_lADODNkJ584BakeczhVbLeo
```

---

## Sub-command: plan

**Trigger:** "plan sprint N", "assign issues to sprint", "qué va en el sprint"

Assigns a list of issues to a sprint and sets their Stage to **To Do**.

```bash
# For each issue number to assign:
ISSUE_NUM=5
SPRINT_ITER_ID="4290fa00"   # Sprint 1 example

# Get item ID from issue
ISSUE_NODE=$(gh api repos/asomelab/asome-portal/issues/$ISSUE_NUM --jq .node_id)
ITEM_ID=$(gh api graphql -f query="
{node(id:\"$ISSUE_NODE\"){...on Issue{projectItems(first:5){nodes{id}}}}}" \
  --jq '.data.node.projectItems.nodes[0].id')

# Set Sprint
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{
  projectId:\"PVT_kwDODNkJ584Bakec\",itemId:\"$ITEM_ID\",
  fieldId:\"PVTIF_lADODNkJ584BakeczhVbLj8\",
  value:{iterationId:\"$SPRINT_ITER_ID\"}}){projectV2Item{id}}}"

# Set Stage → To Do
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{
  projectId:\"PVT_kwDODNkJ584Bakec\",itemId:\"$ITEM_ID\",
  fieldId:\"PVTSSF_lADODNkJ584BakeczhVbLds\",
  value:{singleSelectOptionId:\"8ce063f1\"}}){projectV2Item{id}}}"

echo "Issue #$ISSUE_NUM → Sprint + To Do"
```

---

## Sub-command: move

**Trigger:** "move issue N to In Progress", "mover al #N a Done", "marcar como bloqueado"

Moves a single issue to a new Stage on the board.

Stage → option ID map:
| Stage | ID |
|---|---|
| Backlog | eb7a63bb |
| To Do | 8ce063f1 |
| In Progress | c7995139 |
| In Review | 0e32ac74 |
| Blocked | 0a9f48e0 |
| Done | 75d5718b |
| Cancelled | 69980f3e |

```bash
ISSUE_NUM=3
TARGET_STAGE_ID="c7995139"   # In Progress example

ISSUE_NODE=$(gh api repos/asomelab/asome-portal/issues/$ISSUE_NUM --jq .node_id)
ITEM_ID=$(gh api graphql -f query="
{node(id:\"$ISSUE_NODE\"){...on Issue{projectItems(first:5){nodes{id}}}}}" \
  --jq '.data.node.projectItems.nodes[0].id')

gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{
  projectId:\"PVT_kwDODNkJ584Bakec\",itemId:\"$ITEM_ID\",
  fieldId:\"PVTSSF_lADODNkJ584BakeczhVbLds\",
  value:{singleSelectOptionId:\"$TARGET_STAGE_ID\"}}){projectV2Item{id}}}"

echo "Issue #$ISSUE_NUM Stage → <target>"

# Also add/remove status label if applicable
gh issue edit $ISSUE_NUM --repo asomelab/asome-portal --add-label "status:in-review"   # for In Review
gh issue edit $ISSUE_NUM --repo asomelab/asome-portal --remove-label "status:blocked"  # cleanup
```

---

## Sub-command: report

**Trigger:** "sprint report", "reporte del sprint", "velocity", "cuántos puntos hicimos", "qué está bloqueado"

Fetches the board state and generates a sprint summary.

```bash
# Fetch all items with Stage + SP
gh project item-list 6 --owner asomelab --format json | python3 - << 'EOF'
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
