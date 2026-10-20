---
name: asome-standup
description: >
  Generate a daily standup digest from any ASOME project board — what's in progress,
  what's blocked, what shipped recently.
  Trigger: "standup", "daily", "qué está pasando", "resumen del board",
  "qué tenemos en progreso", "digest del proyecto", "qué se cerró".
license: Apache-2.0
metadata:
  author: asome
  version: "1.1"
---

# ASOME — Daily Standup

Generates a markdown digest of the board state in < 10 seconds. Read-only.

> **Prerequisite**: `.asome/config.json` must exist. If missing, run `/asome-setup` first.

---

## What it produces

```
## 🟡 In Progress (N issues · X SP)
  #3  NestJS bootstrap — AppModule + config [5SP] · Backend
  #4  Vite + React + Tailwind [5SP] · Frontend

## 🔴 Blocked (N issues)
  #N  <title> — last updated <date>

## 🟣 In Review (N issues · X SP)
  #N  <title> · <area>

## ✅ Done recently (closed in last 48h · X SP shipped)
  #N  <title>

## 📋 To Do — Sprint N (remaining X SP)
  #1  Monorepo init [3SP] · Infra
  #2  NestJS bootstrap [5SP] · Backend
  ...

---
Sprint N velocity: X SP done / Y SP total
```

---

## Execution

```bash
PROJECT_NUM=$(jq -r '.project_num' .asome/config.json)
ORG=$(jq -r '.repo | split("/")[0]' .asome/config.json)
SINCE=$(date -u -v-2d +%Y-%m-%d 2>/dev/null || date -u -d '2 days ago' +%Y-%m-%d)
TMP=$(mktemp -d)

gh project item-list "$PROJECT_NUM" --owner "$ORG" --format json --limit 1000 > "$TMP/items.json"
# The board export carries no close date, so the 48h window takes closedAt from search —
# one call that also covers boards spanning several repos.
gh search issues --owner "$ORG" --closed ">=$SINCE" --limit 200 \
  --json number,repository,closedAt > "$TMP/closed.json"

# Files as arguments, not a pipe: with `python3 << 'EOF'` the heredoc already is stdin.
python3 - "$TMP/items.json" "$TMP/closed.json" << 'EOF'
import sys, json
from datetime import date, datetime, timezone, timedelta

items  = json.load(open(sys.argv[1])).get("items") or []
cutoff = datetime.now(timezone.utc) - timedelta(hours=48)
closed = {(c["repository"]["nameWithOwner"], c["number"]) for c in json.load(open(sys.argv[2]))
          if datetime.fromisoformat(c["closedAt"].replace("Z", "+00:00")) >= cutoff}

def running(s):
    start = date.fromisoformat(s["startDate"])
    return start <= date.today() < start + timedelta(days=s["duration"])

sprint = next((i["sprint"]["title"] for i in items if i.get("sprint") and running(i["sprint"])), None)
label  = sprint or "Board (no sprint running)"

in_progress, blocked, in_review, done_recent, todo = [], [], [], [], []
sprint_done = sprint_total = 0

for item in items:
    # gh lowercases each field name's first letter: Status → status, Story Points → story Points
    stage   = item.get("status") or item.get("stage") or "Backlog"
    sp      = item.get("story Points") or 0
    content = item.get("content") or {}
    num     = content.get("number", "?")
    area    = item.get("area") or ""
    tag     = f"  #{num}  {item.get('title', '?')[:60]} [{sp}SP]{' · '+area if area else ''}"
    in_scope = sprint is None or (item.get("sprint") or {}).get("title") == sprint

    if in_scope and stage != "Cancelled":
        sprint_total += sp
        sprint_done  += sp if stage == "Done" else 0

    if stage == "In Progress":   in_progress.append((tag, sp))
    elif stage == "Blocked":     blocked.append((tag, 0))
    elif stage == "In Review":   in_review.append((tag, sp))
    elif stage == "Done":
        if (content.get("repository"), num) in closed: done_recent.append((tag, sp))
    elif stage in ("To Do", "Todo") and in_scope:      todo.append((tag, sp))

def section(header, rows):
    print(f"\n## {header}")
    for tag, _ in rows:
        print(tag)

total = lambda rows: sum(s for _, s in rows)
section(f"🟡 In Progress ({len(in_progress)} issues · {total(in_progress)} SP)", in_progress)
section(f"🔴 Blocked ({len(blocked)} issues)", blocked)
section(f"🟣 In Review ({len(in_review)} issues · {total(in_review)} SP)", in_review)
section(f"✅ Done recently (closed in last 48h · {total(done_recent)} SP shipped)", done_recent)
section(f"📋 To Do — {label} (remaining {total(todo)} SP)", todo)
print(f"\n---\n{label} velocity: {sprint_done} SP done / {sprint_total} SP total")
EOF
rm -rf "$TMP"
```

Boards differ on the status name: some renamed it `To Do`, others kept GitHub's default `Todo`.
The script matches both.

---

## Output destinations

The digest is plain markdown — paste into:
- **Slack**: paste directly, renders with bold headers
- **Notion**: paste as markdown block
- **GitHub Discussion**: paste as comment
- **Email**: wrap in a `<pre>` tag

---

## Optional: filter by area

```bash
gh project item-list "$PROJECT_NUM" --owner "$ORG" --format json --limit 1000 | \
  python3 -c "
import sys, json
data = json.load(sys.stdin)
for i in data['items']:
    if i.get('area') == 'Backend':
        print(f\"  #{(i.get('content') or {}).get('number', '?')} [{i.get('status') or i.get('stage') or '?'}] {i.get('title','?')[:60]}\")
"
```

Replace `'Backend'` with any value from `jq -r '.fields.Area.options | keys[]' .asome/config.json`.
