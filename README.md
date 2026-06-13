# ASOME Skills

Agent skills for the ASOME dev workflow.  
Compatible with [Claude Code](https://claude.ai/code) and other agents via [skills.sh](https://www.skills.sh).

## Install

```bash
npx skills add asomelab/skills
```

## Skills

| Skill | Trigger | Description |
|---|---|---|
| `asome-setup` | `setup asome`, `asome config` | One-time project setup — writes `.asome/config.json` with GitHub Project field IDs |
| `asome-sdd` | `sdd`, `start feature`, `empezar feature` | SDD workflow guide: when to use SDD, board-stage mapping, full command sequence |
| `asome-create-issue` | `create issue`, `nueva issue` | Create enriched GitHub issue with all project board fields |
| `asome-commit` | `commit`, `commitear` | Conventional commit with type+scope inferred from diff |
| `asome-branch-pr` | `create PR`, `abrir PR` | Branch + PR with test plan, changes table, board move |
| `asome-review` | `review PR`, `revisar código` | CRITICAL/WARNING/SUGGESTION checklist with SDD compliance |
| `asome-sprint` | `plan sprint`, `move issue` | Manage sprint board: plan, move stages, report velocity |
| `asome-standup` | `standup`, `daily` | Daily digest: In Progress / Blocked / Done / velocity |
| `design-system-asome-lab` | `design system`, `tokens` | Design tokens + component specs for ASOME Lab UI |

## Dev flow

```
# First time in a new project:
/asome-setup         → discover GitHub Project constants, write .asome/config.json

# For every Feature / Improvement / Setup issue:
/asome-create-issue  → create issue + add to board
/asome-sdd           → follow SDD: /sdd-ff <name> before touching code
/asome-commit        → conventional commit per SDD task
/asome-branch-pr     → /sdd-verify must pass → open PR, board → In Review
/asome-review        → review checklist (includes SDD compliance)
/asome-sprint        → board → Done after merge
/sdd-archive         → close the SDD change

# For bugs / chores / docs:
/asome-create-issue  → create issue
/asome-commit        → implement + commit directly
/asome-branch-pr     → open PR
/asome-sprint        → board → Done after merge

# Daily:
/asome-standup       → digest of board state
```

## Project config

Skills are **project-agnostic** — run `/asome-setup` once per ASOME project to generate `.asome/config.json`. This file holds the GitHub Project number, node ID, and all field/option IDs for that specific project. Other skills read from it via `jq`.

## SDD mandate

Feature, Improvement, and Setup issues (SP ≥ 3) **must** go through SDD before implementation.
See `/asome-sdd` for the full workflow and decision table.
