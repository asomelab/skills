---
name: asome-sprint
description: >
  Manage the ASOME project sprint board: plan a sprint, move issue stages, report velocity,
  and keep the UX↔dev track pairing honest.
  Trigger: "plan sprint", "sprint report", "move issue", "mover issue", "sprint actual",
  "qué hay en el sprint", "cuántos puntos", "stage del issue", "linkear UX", "auditar UX",
  "qué falta de diseño", "needs ux", or any board management request.
license: Apache-2.0
metadata:
  author: asome
  version: "1.2"
---

# ASOME — Sprint Management

Four sub-commands: **plan**, **move**, **report**, **ux-link**. Executes directly.

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

### Gate: never schedule a blocked dev issue ahead of its design

Before planning, check whether the issue carries `needs:ux`. If it does, its paired `track:ux`
issue must be Done — or land in an **earlier** sprint than this one. Design leads implementation
by roughly one sprint; putting both in the same sprint is how a dev ends up guessing at screens.

```bash
UX_BLOCKED=$(gh issue view $ISSUE_NUM --repo "$REPO" --json labels \
  --jq '[.labels[].name] | index("needs:ux") // empty')

if [ -n "$UX_BLOCKED" ]; then
  # the pointer lives in the first lines of the body — see /asome-setup Step 7
  UX_NUM=$(gh issue view $ISSUE_NUM --repo "$REPO" --json body \
    --jq '.body' | grep -m1 -oE 'Bloqueado por UX:\*\* #[0-9]+' | grep -oE '[0-9]+')
  echo "⚠️  #$ISSUE_NUM está bloqueado por UX #${UX_NUM:-???}"
  gh issue view "$UX_NUM" --repo "$REPO" --json state,title,milestone \
    --jq '"    UX #'"$UX_NUM"' [\(.state)] \(.milestone.title // "sin milestone") — \(.title)"'
fi
```

Report the conflict to the user and let them decide — do not silently skip the issue or
silently plan it anyway.

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

### Closing the loop: a `track:ux` issue reaching Done unblocks its dev issue

When the issue being moved to **Done** carries `track:ux`, strip `needs:ux` from every dev issue
that points at it. Otherwise the board keeps claiming a block that no longer exists.

```bash
IS_UX=$(gh issue view $ISSUE_NUM --repo "$REPO" --json labels \
  --jq '[.labels[].name] | index("track:ux") // empty')

if [ -n "$IS_UX" ]; then
  gh issue list --repo "$REPO" --label "needs:ux" --state open --limit 100 \
    --json number,body \
    --jq ".[] | select(.body | test(\"Bloqueado por UX:\\\\*\\\\* #$ISSUE_NUM\\\\b\")) | .number" \
  | while read -r dep; do
      gh issue edit "$dep" --repo "$REPO" --remove-label "needs:ux"
      gh issue comment "$dep" --repo "$REPO" \
        --body "🎨 El diseño (#$ISSUE_NUM) está cerrado. Se saca \`needs:ux\` — este issue queda listo para tomar."
      echo "#$dep desbloqueado"
    done
fi
```

Leave the `> ⛔ **Bloqueado por UX:** #N` line in the body — once the design is Done it stops
being a blocker and becomes the link to the design, which is exactly what the implementer wants.

---

## Sub-command: ux-link

**Trigger:** "linkear UX", "auditar UX", "qué falta de diseño", "ux link", "needs ux",
"qué issues dependen de diseño"

Audits the UX↔dev pairing across the board and repairs it. Two invariants, from
`/asome-setup` Step 7:

1. **Every open `track:ux` issue has a paired `track:dev` issue.** A design nobody is
   scheduled to build is a design that rots.
2. **Every dev issue that depends on a design carries `needs:ux`** plus the pointer line
   `> ⛔ **Bloqueado por UX:** #N` as the first lines of its body.

The second invariant is one-directional. **Most dev issues need no UX and must not be
labelled** — see the exclusion list in `/asome-setup` Step 7. `area:backend` / `area:infra`
work with no new surface, bugs that restore already-designed behaviour, docs, research, and
UI that only assembles shipped components are all fine without design.

### Step 1 — collect both tracks

```bash
REPO=$(jq -r '.repo' .asome/config.json)

gh issue list --repo "$REPO" --label "track:ux" --state open --limit 200 \
  --json number,title,milestone,body \
  --jq '.[] | "UX\t#\(.number)\t\(.milestone.title // "-")\t\(.title)"'

gh issue list --repo "$REPO" --state open --limit 400 \
  --json number,title,milestone,labels,body \
  --jq '.[] | select([.labels[].name] | index("track:ux") | not)
            | "DEV\t#\(.number)\t\(.milestone.title // "-")\t\([.labels[].name]|join(","))\t\(.title)"'
```

### Step 2 — match pairs, then **confirm with the user before writing**

Matching is a heuristic, not a lookup. In priority order:

1. An existing `Bloqueado por UX:` pointer in the dev body — already linked, nothing to do.
2. A shared story token in both titles (`HU-24`, `RN-12`, `DW-031`). Highest-confidence signal.
3. Same feature noun and same milestone family (`S6: UX — Bandeja…` ↔ `S6: Fullstack — Bandeja…`).
4. A cross-reference inside either body ("coordinar con la issue de dev hermana", "pareja de #N").

Present the proposed pairs as a table — dev, UX, both milestones — and get an explicit yes
before editing anything. A wrong pointer is worse than no pointer: it sends the implementer
to someone else's design.

Scope the run when the user asks for it (a milestone, a sprint, a label). Do not quietly widen
to the whole backlog.

### Step 3 — apply

Read the body over the API and prepend, rather than passing it back through `gh issue edit
--body` by hand — bodies contain backticks, `$`, and multi-line code fences that the shell
will happily mangle.

```bash
apply_ux_block() {  # $1 = dev issue, $2 = ux issue
  dev="$1"; ux="$2"
  uxtitle=$(gh issue view "$ux" --repo "$REPO" --json title --jq '.title')
  body=$(gh api "repos/$REPO/issues/$dev" --jq '.body // ""')

  if printf '%s' "$body" | grep -q 'Bloqueado por UX'; then
    echo "#$dev ya tiene el aviso"
  else
    { printf '> ⛔ **Bloqueado por UX:** #%s — *%s*.\n> El diseño tiene que estar cerrado antes de empezar a implementar esto.\n\n' "$ux" "$uxtitle"
      printf '%s' "$body"; } | jq -Rs '{body: .}' > /tmp/asome-ux-body.json
    gh api -X PATCH "repos/$REPO/issues/$dev" --input /tmp/asome-ux-body.json --jq '.number' > /dev/null
    echo "#$dev → aviso a #$ux"
  fi

  gh issue edit "$dev" --repo "$REPO" --add-label "needs:ux"
}
```

> **zsh gotcha.** `for p in $PAIRS` over a space-separated string does *not* word-split in zsh
> the way it does in bash — the whole string arrives as one word and `${p##*:}` silently yields
> the **last** pair's UX number for the **first** pair's dev issue. Iterate a here-doc with
> `while read -r dev ux` instead, which behaves the same in both shells.

```bash
while read -r dev ux; do
  [ -z "$dev" ] && continue
  apply_ux_block "$dev" "$ux"
done <<'PAIRS'
658 659
665 664
PAIRS
```

### Step 4 — report the gaps you did not fix

Close with the two lists the user actually has to act on:

- **UX issues with no dev counterpart** — needs a `track:dev` issue created (`/asome-create-issue`).
- **Dev issues that look UI-facing with no design at all** — needs a `track:ux` issue for the
  designer. Name them and say why; do not create them unprompted.

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
