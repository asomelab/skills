# ASOME Skills

Agent skills for the [ASOME Portal](https://github.com/asomelab/asome-portal) dev workflow.  
Compatible with [Claude Code](https://claude.ai/code) and other agents via [skills.sh](https://www.skills.sh).

## Install

```bash
npx skills add asomelab/skills
```

## Skills

| Skill | Trigger | Description |
|---|---|---|
| `asome-create-issue` | `create issue`, `nueva issue` | Create enriched GitHub issue with all Project #6 fields |
| `asome-commit` | `commit`, `commitear` | Conventional commit with type+scope inferred from diff |
| `asome-branch-pr` | `create PR`, `abrir PR` | Branch + PR with test plan, changes table, board move |
| `asome-review` | `review PR`, `revisar código` | CRITICAL/WARNING/SUGGESTION checklist vs CLAUDE.md |
| `asome-sprint` | `plan sprint`, `move issue` | Manage sprint board: plan, move stages, report velocity |
| `asome-standup` | `standup`, `daily` | Daily digest: In Progress / Blocked / Done / velocity |
| `design-system-asome-lab` | `design system`, `tokens` | Design tokens + component specs for ASOME Lab UI |

## Dev flow

```
/asome-create-issue  → create issue + add to board
/asome-commit        → conventional commit during implementation
/asome-branch-pr     → open PR, move board → In Review
/asome-review        → review checklist before approving
/asome-sprint        → move board → Done after merge
/asome-standup       → daily digest
```

## Project constants

These skills target `asomelab/asome-portal` and `Project #6`. If you fork for another project, update the constants in each `SKILL.md`.
