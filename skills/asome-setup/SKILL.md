---
name: asome-setup
description: >
  One-time project setup for ASOME skills. Discovers the GitHub Project linked to the
  current repo and writes `.asome/config.json` with all field IDs needed by other skills.
  Trigger: "setup asome", "init asome", "asome config", "configurar proyecto",
  or automatically when another ASOME skill reports that `.asome/config.json` is missing.
license: Apache-2.0
metadata:
  author: asome
  version: "1.3"
---

# ASOME — Project Setup

Discovers project constants for the current ASOME project and writes `.asome/config.json`.
Run once per project. Re-run when the GitHub Project changes (fields added, sprints added, etc.).

**Executes directly. Safe to re-run — overwrites config.**

---

## What it creates

1. `.asome/config.json` — read by all other ASOME skills (structure below).
2. **The repo's label set** — `type:*`, `priority:*`, `area:*`, `effort:*`, plus `track:*` and
   `needs:ux` on software projects and `funnel:*` / `formato:*` on content projects. See Step 7.

`.asome/config.json` structure:

```json
{
  "repo": "<org>/<repo>",
  "project_num": 6,
  "project_id": "PVT_...",
  "fields": {
    "Stage": {
      "id": "PVTSSF_...",
      "options": {
        "Backlog": "...", "To Do": "...", "In Progress": "...",
        "In Review": "...", "Blocked": "...", "Done": "...", "Cancelled": "..."
      }
    },
    "Priority": {
      "id": "PVTSSF_...",
      "options": { "Urgent": "...", "High": "...", "Medium": "...", "Low": "...", "No Priority": "..." }
    },
    "Kind": {
      "id": "PVTSSF_...",
      "options": { "Feature": "...", "Setup": "...", "Research": "...", "Bug": "...", "Docs": "...", "Improvement": "..." }
    },
    "Area": {
      "id": "PVTSSF_...",
      "options": { "Infra": "...", "Backend": "...", "Frontend": "...", "Docs": "..." }
    },
    "Story Points": { "id": "PVTF_..." },
    "Start":         { "id": "PVTF_..." },
    "Target":        { "id": "PVTF_..." },
    "Sprint": {
      "id": "PVTIF_...",
      "iterations": [
        { "id": "...", "title": "Sprint 1 (M0)", "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" }
      ]
    }
  }
}
```

---

## Execution steps

### Step 1 — detect repo

```bash
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "Repo: $REPO"
```

### Step 2 — list projects and pick one

```bash
ORG=${REPO%%/*}
gh project list --owner "$ORG" --format json --limit 20
```

Ask the user: "Which project number should ASOME skills use for this repo?" (or auto-detect if only one project exists).

```bash
PROJECT_NUM=<selected number>
```

### Step 3 — get project node ID

```bash
PROJECT_ID=$(gh project view "$PROJECT_NUM" --owner "$ORG" --format json --jq '.id')
echo "Project ID: $PROJECT_ID"
```

### Step 4 — fetch all field IDs and option IDs

```bash
gh api graphql -f query="
{
  node(id: \"$PROJECT_ID\") {
    ... on ProjectV2 {
      fields(first: 30) {
        nodes {
          ... on ProjectV2SingleSelectField {
            id
            name
            options { id name }
          }
          ... on ProjectV2IterationField {
            id
            name
            configuration {
              iterations { id title startDate duration }
            }
          }
          ... on ProjectV2Field {
            id
            name
          }
        }
      }
    }
  }
}"
```

Parse the response to extract:
- `Stage` field ID + all option IDs by name
- `Priority` field ID + option IDs
- `Kind` field ID + option IDs
- `Area` field ID + option IDs
- `Story Points` field ID (numeric field, no options)
- `Start` field ID (date field)
- `Target` field ID (date field)
- `Sprint` field ID + all iteration IDs, titles, and dates

### Step 5 — auto-detect deploy branches

Detect branch names for `/asome-deploy` (dev → staging → main promotion skill):

```bash
DEV_BRANCH=$(git branch -r 2>/dev/null | grep -oE 'origin/(dev|development)' | head -1 | sed 's/origin\///')
STG_BRANCH=$(git branch -r 2>/dev/null | grep -oE 'origin/(staging|stg)' | head -1 | sed 's/origin\///')
PROD_BRANCH=$(git branch -r 2>/dev/null | grep -oE 'origin/(main|master)' | head -1 | sed 's/origin\///')

# Fallback defaults if not detected
DEV_BRANCH="${DEV_BRANCH:-dev}"
STG_BRANCH="${STG_BRANCH:-staging}"
PROD_BRANCH="${PROD_BRANCH:-main}"

echo "Deploy branches: dev=$DEV_BRANCH staging=$STG_BRANCH prod=$PROD_BRANCH"
```

### Step 6 — write config

```bash
mkdir -p .asome
cat > .asome/config.json << 'EOF'
{
  "repo": "<REPO>",
  "project_num": <PROJECT_NUM>,
  "project_id": "<PROJECT_ID>",
  "deploy": {
    "dev": "<DEV_BRANCH>",
    "staging": "<STG_BRANCH>",
    "prod": "<PROD_BRANCH>"
  },
  "fields": {
    <...parsed fields...>
  }
}
EOF
echo "Written: .asome/config.json"
```

The `deploy` block is optional but enables `/asome-deploy` to skip auto-detection on every run.
Update manually if you rename environment branches.

### Step 7 — bootstrap repo labels

Labels are the other half of the contract: the Project board carries Stage/Priority/Kind/Area,
and the repo carries labels so issues stay filterable from the issue list and from `gh` without
touching GraphQL. Create them here so every ASOME repo starts with the same set.

`gh label create` fails if the label exists — pipe through `grep -v` so re-running setup is safe.

```bash
R=$(jq -r '.repo' .asome/config.json)
mk(){ gh label create "$1" --repo "$R" --color "$2" --description "$3" 2>&1 | grep -v "already exists" || true; }
```

**Base set — every project:**

```bash
# type — what kind of work
mk "type:feature"     "A2EEEF" "New feature"
mk "type:setup"       "CFD3D7" "Project setup / scaffolding"
mk "type:research"    "D876E3" "Research / spike"
mk "type:bug"         "D73A4A" "Something is broken"
mk "type:docs"        "0075CA" "Documentation"
mk "type:improvement" "BFD4F2" "Improvement on existing work"

# priority
mk "priority:high"    "D93F0B" "High"
mk "priority:med"     "FBCA04" "Medium"
mk "priority:low"     "0E8A16" "Low"

# effort — mirrors Story Points
mk "effort:S"  "EDEDED" "1-2 SP"
mk "effort:M"  "EDEDED" "3-5 SP"
mk "effort:L"  "EDEDED" "8 SP"
mk "effort:XL" "EDEDED" "13 SP"
```

**Area set — pick the one that matches the project type.** Areas must mirror the `Area` field
options of the linked GitHub Project (Step 4), or filtering by label and filtering by board
field give different answers.

```bash
# software projects
mk "area:infra"    "0052CC" "Infrastructure / Terraform / CI"
mk "area:backend"  "1D76DB" "Backend"
mk "area:frontend" "0E8A16" "Frontend"
mk "area:docs"     "0075CA" "Documentation"

# track — software projects run two tracks in parallel: design leads, code follows
mk "track:ux"  "CC317C" "UX/UI design track — leads implementation by one sprint"
mk "track:dev" "0052CC" "Development (code) track"
mk "needs:ux"  "C2185B" "Blocked: needs the UX/UI design closed before implementation starts"

# content / marketing projects — mirror the production pipeline
mk "area:idea"        "C5DEF5" "Idea bank and scoring"
mk "area:guion"       "1D76DB" "Script writing"
mk "area:grabacion"   "0E8A16" "Recording"
mk "area:edicion"     "FBCA04" "Editing and subtitles"
mk "area:publicacion" "5319E7" "Publishing"
mk "area:estrategia"  "B60205" "Strategy and framework"
mk "area:metricas"    "006B75" "Metrics tracking"
```

**Content projects only — funnel stage and content type.** Skip these on software repos.

```bash
# funnel — where the piece sits in the funnel. Target mix 70/20/10
mk "funnel:tofu" "0E8A16" "Discovery — stories, strong hooks (70%)"
mk "funnel:mofu" "FBCA04" "Consideration — education, objections (20%)"
mk "funnel:bofu" "D93F0B" "Sales — process, cases, interviews (10%)"

# formato — content type / production format
mk "formato:yapping"       "1D76DB" "One take to camera, no rigid script, 30-60s"
mk "formato:storytelling"  "5319E7" "Word-for-word scripted narrative, 30-90s"
mk "formato:cara-pantalla" "0052CC" "Dual camera face + screen (demo), 45-90s"
mk "formato:talking-head"  "006B75" "Semi-scripted Q&A, 30-45s"
mk "formato:entrevista"    "B60205" "15-30 min interview to atomize into clips"
mk "formato:clip"          "C5DEF5" "Cut from an interview or external appearance, 30-60s"
mk "formato:carrusel"      "BFD4F2" "Image carousel (support format)"
mk "formato:split-screen"  "E99695" "Split-screen comparison, 30-45s"
```

Every issue gets **exactly one** `type:*`, one `priority:*`, and one `area:*`. `effort:*` is
optional. On content projects add exactly one `funnel:*` and at least one `formato:*` — a piece
that will be cut into clips carries both its source format and `formato:clip`.

#### The two-track convention (software projects)

Design and implementation are separate issues, never the same one. The design issue leads the
implementation issue by roughly one sprint.

- `track:ux` — owned by the designer. Its deliverable is a Figma frame plus the decisions
  written down (states, copy, empty/error cases). It ships no code.
- `track:dev` — owned by an engineer. Its deliverable is the merged PR.
- `needs:ux` — goes on the **dev** issue, not the UX one. It means: this cannot start until the
  paired `track:ux` issue is Done.

**Every open `track:ux` issue must have a paired `track:dev` issue** — a design nobody is
scheduled to build is a design that rots. When the pair exists, the dev issue carries `needs:ux`
plus this pointer as the **first lines of its body**, so the block is visible without opening
Figma or the board:

```markdown
> ⛔ **Bloqueado por UX:** #659 — *S5: UX — Planificación: diseñar el flujo sin nombre precargado*.
> El diseño tiene que estar cerrado antes de empezar a implementar esto.
```

That exact `Bloqueado por UX:` string is the machine-readable half of the link — `/asome-sprint
ux-link` greps for it to audit the board, so don't reword it.

**The reverse is not true: most dev issues need no UX at all.** Do not put `needs:ux` on:

- `area:backend` / `area:infra` work with no new user-facing surface (APIs, migrations, cron,
  CI, Terraform, observability)
- bugs that restore already-designed behavior — the design exists, the code broke
- `type:docs`, `type:research`, and chores
- UI work that only assembles existing components and tokens against a design that already
  shipped

Reserve it for a new screen or surface, a change to an existing flow's information architecture
or copy hierarchy, and anything the client asked for in words rather than in a design.

Do not use GitHub sub-issues to express this dependency. An issue has a single parent and that
slot belongs to the EPIC hierarchy — reparenting a dev issue under its UX issue silently drops
it out of its EPIC.

Verify:

```bash
gh label list --repo "$R" --limit 60 --json name --jq '[.[].name] | sort | join("  ")'
```

---

### Step 8 — commit the config

`.asome/config.json` contains no secrets — only GraphQL node IDs (project/field/option IDs)
and branch names, all of which are project-public. It's the shared contract every ASOME
skill reads, so it's tracked in git rather than gitignored: every teammate (and every
agent run) gets the same config without re-running setup.

```bash
git add .asome/config.json
git status --short .asome/config.json
```

If `.gitignore` already has a stale `.asome/config.json` (or `.asome/`) entry from before
this convention, remove it:

```bash
grep -vE '^\.asome/(config\.json)?$' .gitignore > /tmp/gitignore.tmp 2>/dev/null && mv /tmp/gitignore.tmp .gitignore
```

---

## Verification

After writing, confirm the config is valid:

```bash
# Should print the project title
gh project view $(jq .project_num .asome/config.json) --owner $(jq -r '.repo | split("/")[0]' .asome/config.json)
```

---

## Re-running

Re-run `/asome-setup` whenever:
- A new sprint is added to the project
- A new field option is added (e.g., new Kind or Area)
- The GitHub Project number changes
- A new team member clones the repo and needs the config locally
