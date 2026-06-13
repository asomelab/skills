# ASOME Skills — AI Agent Instructions

This repo contains agent skills for the ASOME Portal development workflow.

## Structure

```
skills/<name>/
  SKILL.md        — skill instructions (read by the agent)
  metadata.json   — version, abstract, references
  AGENTS.md       — agent-specific notes (optional)
  README.md       — human-readable description (optional)
  references/     — templates referenced by the skill (optional)
```

## Adding a skill

1. Create `skills/<name>/SKILL.md` with frontmatter (`name`, `description`, `license`, `metadata`)
2. Add `skills/<name>/metadata.json` with `version`, `organization`, `date`, `abstract`, `references`
3. Add the skill name to the relevant group in `skills.sh.json`

## Conventions

- All ASOME skills target `asomelab/asome-portal` — project constants are embedded in each SKILL.md
- Version follows semver; bump `metadata.json` version on breaking changes
- Skills execute directly — no preview/confirmation step unless the action is destructive
