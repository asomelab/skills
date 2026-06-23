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
  version: "1.0"
---

# ASOME — Project Setup

Discovers project constants for the current ASOME project and writes `.asome/config.json`.
Run once per project. Re-run when the GitHub Project changes (fields added, sprints added, etc.).

**Executes directly. Safe to re-run — overwrites config.**

---

## What it creates

`.asome/config.json` — read by all other ASOME skills. Structure:

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

### Step 7 — add to .gitignore (if not already)

```bash
grep -q '.asome/config.json' .gitignore 2>/dev/null || echo '.asome/config.json' >> .gitignore
```

> `.asome/config.json` contains project-specific GraphQL IDs. Commit `.asome/` to `.gitignore`
> unless the team wants to share the config (in which case skip this step).

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
