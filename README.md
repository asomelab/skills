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
| `asome-setup` | `setup asome`, `configurar proyecto`, `asome doctor` | Board config **and** manual compliance: OpenSpec, `AGENTS.md`, MCP allowlist, secret scanning, `docs/` registers. `doctor` mode audits repo + machine |
| `asome-onboard` | `onboard`, `introduce me to the project`, `poneme al día` | Project snapshot for new devs — reads issues, sprint board, stack, and recommends where to start |
| `asome-create-skill` | `create skill`, `nueva skill`, `add skill` | Scaffold a new ASOME skill with SKILL.md, metadata.json, and registry entry |
| `asome-discovery` | `product research`, `investigar producto`, `nuevo producto`, `escribir HUs` | Product discovery: docs/product/ doc set, HU template, decision/assumption registers — runs before SDD |
| `asome-sdd` | `sdd`, `start feature`, `empezar feature`, `openspec` | SDD with OpenSpec: when it is required, the `/opsx:*` sequence, board-stage map, and what goes to OpenSpec vs engram |
| `asome-create-issue` | `create issue`, `nueva issue` | Create an enriched GitHub issue — one vertical demonstrable slice, traced to the mapa operativo |
| `asome-commit` | `commit`, `commitear` | Conventional commit with type+scope inferred from diff |
| `asome-branch-pr` | `create PR`, `abrir PR` | Branch + PR with test plan, changes table, board move |
| `asome-review` | `review PR`, `revisar código` | The `verify` phase: diff against `openspec/changes/`, plus antipatterns and design-system reuse. CRITICAL/WARNING/SUGGESTION |
| `asome-sprint` | `plan sprint`, `cerrar sprint`, `armar los sprints` | Owns the sprint cycle: bootstrap a project from the ASOME canon, plan under a capacity ceiling, close with retro, report velocity per lane |
| `asome-standup` | `standup`, `daily` | Daily digest: In Progress / Blocked / Done / velocity |
| `design-system-asome-lab` | `design system`, `tokens` | Design tokens + component specs for ASOME Lab UI |
| `asome-deploy` | `deploy`, `deploy to staging`, `deploy to main` | Promote code dev→staging→main via guarded PRs (Gitflow), waits on CI checks, halts on red |
| `asome-infra-setup` | `setup infra`, `bootstrap infra` | Scaffold infra from asomelab/infrastructure patterns by architecture |
| `asome-infra-audit` | `audit infra`, `check terraform` | Audit Terraform, AWS, GHA against best practices (CRITICAL/WARNING/SUGGESTION) |
| `asome-infra-costs` | `aws costs`, `reduce costs` | Explore AWS spend, find idle resources, get cost-reduction recommendations |
| `asome-infra-plan` | `terraform plan`, `apply infra` | Safe terraform plan+apply wrapper with destroy guards and confirmation |
| `asome-meeting` | `agenda una reunion`, `schedule a meeting`, `sprint review` | Schedule ASOME calendar events with ASOME title/reminder/Meet conventions and history-based attendee resolution |
| `asome-kickoff` | `kickoff`, `reunión de inicio`, `armar el kickoff`, `acta de kickoff` | Project kick-off: batched relevamiento, then a ready-to-paste Claude Design prompt for the fixed 13-block / 15-slide deck, plus the same-day acta and calendar events |

## Dev flow

```
# First time in a new project:
/asome-setup         → board config + manual compliance (OpenSpec, AGENTS.md, MCP, secrets)
/asome-setup doctor  → audit repo and machine against the manual, changes nothing

# For every Feature / Improvement / Setup issue:
/asome-create-issue  → create issue + add to board
/asome-sdd           → the SDD guide. /opsx:propose <name> before touching code
/opsx:apply          → implement the tasks
/asome-commit        → conventional commit per task
/asome-review        → the verify phase: diff vs openspec/changes/<name>
/asome-branch-pr     → open PR against dev, board → In Review
/asome-sprint        → board → Done after merge
/opsx:archive        → close the change, fold specs into openspec/specs/

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
