---
name: asome-onboard
description: >
  Introduce a developer to any ASOME project by reading GitHub issues and project context —
  summarizes what's being built, current sprint state, open work, and where to start.
  Falls back to CLAUDE.md and repo structure when no issues exist.
  Trigger: "onboard", "introduce me to the project", "what is this project", "qué es este proyecto",
  "poneme al día", "where do I start", "project overview", "qué hay que hacer",
  or when a new dev joins and needs project context.
license: Apache-2.0
metadata:
  author: asome
  version: "1.0"
---

# ASOME — Developer Onboarding

Gives a new (or returning) developer a full situational snapshot of the current ASOME project.
Reads live GitHub issues, sprint board, and repo context. Read-only — makes no changes.

**No prerequisite strictly required**, but `.asome/config.json` unlocks board-level data.
If missing, the skill falls back to repo-only context (issues + CLAUDE.md + file tree).

---

## What it produces

```
## Project: <repo name>

### What we're building
<2-4 sentences from CLAUDE.md or README describing the product>

### Current sprint
Sprint N · <start> → <end>
Velocity: X SP done / Y SP total

### 🟡 In Progress
  #N  <title> [XSP] · <area>

### 🔴 Blocked
  #N  <title> — needs: <reason>

### 📋 Open backlog (To Do)
  #N  <title> [XSP] · <kind> · <priority>

### ✅ Recently shipped (last 7 days)
  #N  <title>

### Where to start
<Recommended first issue(s) for a new contributor, or the highest-priority To Do item>

### Key context
- Stack: <detected from CLAUDE.md or package.json/go.mod/pyproject.toml>
- Conventions: <summary of CLAUDE.md dev conventions>
- Infra: <summary if infra skills or terraform present>
```

---

## Execution

### Step 1 — check for `.asome/config.json`

```bash
if [ -f .asome/config.json ]; then
  BOARD_MODE=true
  REPO=$(jq -r '.repo' .asome/config.json)
  PROJECT_NUM=$(jq -r '.project_num' .asome/config.json)
  ORG=${REPO%%/*}
else
  BOARD_MODE=false
  REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
fi
```

### Step 2 — read project description

```bash
# Try CLAUDE.md first, then README
if [ -f CLAUDE.md ]; then
  head -60 CLAUDE.md
elif [ -f README.md ]; then
  head -60 README.md
fi
```

### Step 3 — detect stack

```bash
# Node/Bun
[ -f package.json ] && cat package.json | jq '{deps: .dependencies, devDeps: .devDependencies}' 2>/dev/null

# Go
[ -f go.mod ] && head -10 go.mod

# Python
[ -f pyproject.toml ] && head -20 pyproject.toml

# Terraform
[ -d infra ] && ls infra/ 2>/dev/null
```

### Step 4a — board mode (`.asome/config.json` exists)

```bash
gh project item-list $PROJECT_NUM --owner "$ORG" --format json | python3 << 'EOF'
import sys, json
from datetime import datetime, timezone, timedelta

data = json.load(sys.stdin)
now = datetime.now(timezone.utc)
cutoff = now - timedelta(days=7)

by_stage = {}
for item in data.get('items', []):
    stage = item.get('status', 'Unknown')
    by_stage.setdefault(stage, []).append(item)

def fmt(item):
    num = item.get('number', '?')
    title = item.get('title', 'Untitled')
    sp = item.get('storyPoints', '')
    area = item.get('area', '')
    sp_str = f" [{sp}SP]" if sp else ""
    area_str = f" · {area}" if area else ""
    return f"  #{num}  {title}{sp_str}{area_str}"

for stage in ['In Progress', 'Blocked', 'In Review', 'To Do', 'Done']:
    items = by_stage.get(stage, [])
    if not items:
        continue
    if stage == 'Done':
        # only last 7 days
        recent = [i for i in items if i.get('updatedAt','') >= cutoff.isoformat()]
        if recent:
            print(f"\n### ✅ Recently shipped (last 7 days)")
            for i in recent[:5]: print(fmt(i))
    else:
        emoji = {'In Progress':'🟡','Blocked':'🔴','In Review':'🟣','To Do':'📋'}.get(stage,'•')
        print(f"\n### {emoji} {stage}")
        for i in items: print(fmt(i))
EOF
```

### Step 4b — fallback mode (no config)

```bash
# Install gh if needed
if ! command -v gh &>/dev/null; then
  brew install gh 2>/dev/null || echo "gh CLI not found — install from https://cli.github.com"
fi

# List open issues
if [ -n "$REPO" ]; then
  gh issue list --repo "$REPO" --state open --limit 30 \
    --json number,title,labels,assignees,milestone \
    --template '{{range .}}#{{.number}} {{.title}} [{{range .labels}}{{.name}} {{end}}]{{"\n"}}{{end}}'
else
  echo "No remote detected. Reading local context only."
fi
```

### Step 5 — file tree snapshot (always)

```bash
# Top-level structure only — no node_modules / .git
find . -maxdepth 2 \
  -not -path './.git/*' \
  -not -path './node_modules/*' \
  -not -path './.terraform/*' \
  -not -name '*.lock' \
  | sort | head -50
```

### Step 6 — synthesize and output

Using all data gathered above, produce the full onboarding summary:

1. **What we're building** — 2-4 sentences (from CLAUDE.md/README)
2. **Stack** — languages, frameworks, infra tools detected
3. **Current sprint** — SP totals if board mode
4. **Board state** — In Progress, Blocked, In Review, To Do, recently Done
5. **Where to start** — top 1-3 recommended issues for a new contributor (highest priority To Do, or smallest SP open issue)
6. **Key conventions** — bullet summary from CLAUDE.md
7. **Next step** — single actionable sentence ("Run `/asome-setup` then pick issue #N")

---

## Decision tree

```
.asome/config.json exists?
  YES → board mode: sprint velocity + staged issues
  NO  → fallback: gh issue list + local context

gh CLI available?
  YES → fetch issues
  NO  → brew install gh → retry
      → if install fails: read CLAUDE.md + file tree only

Open issues exist?
  YES → summarize by priority/stage
  NO  → analyze repo structure + CLAUDE.md + recent commits
        present as "project is pre-issue — here's what's here"
```

---

## No-issues fallback

When the repo has no open issues (new project or all closed):

```bash
# Recent commits for context
git log --oneline --since="30 days ago" | head -20

# Key files
for f in CLAUDE.md README.md docs/ARCHITECTURE.md; do
  [ -f "$f" ] && echo "=== $f ===" && head -40 "$f"
done
```

Synthesize from commits + CLAUDE.md + file tree. Present as:
- What appears to have been built already
- What the stated goals are (from docs)
- Suggested first action (create first issue, run setup, etc.)

---

## Known gotchas

- `gh` may need `gh auth login` if not authenticated — prompt user to run `! gh auth login`.
- Board item fields (SP, Area, Stage) are only available in board mode; fallback shows raw issue list.
- `project item-list` returns all stages combined — the Python script splits by `status` field.
- If `.asome/config.json` exists but sprint data is stale (new sprint added), suggest re-running `/asome-setup`.
