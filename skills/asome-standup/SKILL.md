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

gh project item-list $PROJECT_NUM --owner "$ORG" --format json | python3 << 'EOF'
import sys, json
from datetime import datetime, timezone, timedelta

data = json.load(sys.stdin)
now = datetime.now(timezone.utc)
cutoff = now - timedelta(hours=48)

in_progress, blocked, in_review, done_recent, todo = [], [], [], [], []

for item in data.get("items", []):
    stage  = item.get("Stage", "Backlog")
    sp     = item.get("Story Points", 0) or 0
    title  = item.get("title", "?")[:60]
    num    = item.get("number", "?")
    area   = item.get("Area", "")
    tag    = f"  #{num}  {title} [{sp}SP]{' · '+area if area else ''}"

    if stage == "In Progress":   in_progress.append((tag, sp))
    elif stage == "Blocked":     blocked.append(tag)
    elif stage == "In Review":   in_review.append((tag, sp))
    elif stage == "Done":        done_recent.append((tag, sp))
    elif stage == "To Do":       todo.append((tag, sp))

def section(emoji, label, items, show_sp=True):
    sp_total = sum(s for _, s in items) if show_sp else 0
    header = f"\n## {emoji} {label}" + (f" ({len(items)} issues · {sp_total} SP)" if show_sp else f" ({len(items)} issues)")
    print(header)
    for (tag, *_) in items:
        print(tag)

section("🟡", "In Progress", in_progress)
section("🔴", "Blocked",     [(t, 0) for t in blocked], show_sp=False)
section("🟣", "In Review",   in_review)
section("✅", "Done recently", done_recent)
section("📋", "To Do",       todo)

total_done = sum(s for _, s in done_recent)
total_sprint = sum(s for _, s in in_progress + in_review + done_recent + todo)
print(f"\n---\nVelocity: {total_done} SP done / {total_sprint} SP in sprint")
EOF
```

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
gh project item-list $PROJECT_NUM --owner "$ORG" --format json | \
  python3 -c "
import sys, json
data = json.load(sys.stdin)
for i in data['items']:
    if i.get('Area') == 'Backend':
        print(f\"  #{i.get('number','?')} [{i.get('Stage','?')}] {i.get('title','?')[:60]}\")
"
```

Replace `'Backend'` with any value from `jq -r '.fields.Area.options | keys[]' .asome/config.json`.
