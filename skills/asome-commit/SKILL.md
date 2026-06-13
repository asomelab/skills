---
name: asome-commit
description: >
  Create a conventional commit for asomelab/asome-portal: validate format, suggest type+scope
  from staged diff, and commit with co-author trailer.
  Trigger: "commit", "commitear", "hacer commit", "conventional commit",
  "qué tipo de commit va", "commit con mensaje", or any request to commit staged changes.
license: Apache-2.0
metadata:
  author: asome
  version: "1.0"
  project: asomelab/asome-portal
---

# ASOME — Conventional Commit

Inspects staged changes, suggests a conventional commit message, validates the format,
and commits with the co-author trailer. Executes directly.

---

## Commit format

```
<type>(<scope>): <description>

[optional body]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### Validation regex
```
^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\([a-z0-9._-]+\))?!?: .+
```

### Type → meaning

| Type | When to use |
|---|---|
| `feat` | New feature or endpoint |
| `fix` | Bug fix |
| `refactor` | Code restructuring, no behavior change |
| `docs` | Documentation, comments, Swagger annotations |
| `test` | Tests only |
| `chore` | Tooling, deps, config, CI |
| `style` | Formatting, lint fixes (no logic change) |
| `perf` | Performance improvement |
| `build` | Build system changes |
| `ci` | GitHub Actions, workflows |
| `revert` | Reverts a previous commit |

### Scope → NestJS module or web feature

| Area | Scope examples |
|---|---|
| API modules | `auth`, `clients`, `projects`, `team`, `finance`, `dashboard`, `users` |
| API cross-cutting | `prisma`, `config`, `common`, `main` |
| Web features | `clients`, `projects`, `team`, `finance`, `dashboard`, `auth` |
| Web infra | `api-client`, `query-keys`, `router`, `stores` |
| Root / infra | `ci`, `docker`, `env`, `deps` |

---

## Execution steps

```bash
# 1. Show staged changes summary
git diff --cached --stat

# 2. Infer type + scope from the diff
# (Claude reads the diff and suggests based on the table above)
# Example output: "feat(clients): add paginated list endpoint"

# 3. Validate the message format before committing
# Message must match: ^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\([a-z0-9._-]+\))?!?: .+

# 4. Commit with trailer
git commit -m "$(cat <<'EOF'
<type>(<scope>): <description>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Multi-commit workflow (feature branch)

When implementing a full issue across multiple commits, follow this progression:

```bash
# Prisma schema + migration first
git commit -m "feat(clients): add Client model and migration"

# Service layer
git commit -m "feat(clients): implement ClientsService with CRUD methods"

# Controller + DTOs
git commit -m "feat(clients): add ClientsController with paginated list endpoint"

# Tests
git commit -m "test(clients): add unit tests for ClientsService"

# Frontend
git commit -m "feat(clients): add clients list page with search and filters"
```

Each commit should be atomic — one coherent change that passes lint + typecheck on its own.

---

## Common mistakes to avoid

- **DON'T**: `git commit -m "changes"` — non-conventional
- **DON'T**: `git commit -m "feat: add stuff"` — too vague, no scope
- **DON'T**: `git commit -m "WIP"` — not allowed on `main` or PR branches
- **DON'T**: Mix backend + frontend changes in one commit — split them
- **DO**: `git commit -m "feat(auth): add CognitoJwtStrategy with JWKS validation"`
- **DO**: `git commit -m "fix(prisma): handle P2002 unique constraint as 409 Conflict"`

---

## If pre-commit hook fails

```bash
# Run manually what the hook runs:
cd api && npm run lint && tsc --noEmit
cd web && npm run lint && tsc --noEmit

# Fix issues, re-stage, then:
git commit -m "<same message>"
# Do NOT use --no-verify to bypass the hook
```
