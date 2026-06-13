---
name: asome-commit
description: >
  Create a conventional commit for any ASOME project: validate format, suggest type+scope
  from staged diff, and commit with co-author trailer.
  Trigger: "commit", "commitear", "hacer commit", "conventional commit",
  "qué tipo de commit va", "commit con mensaje", or any request to commit staged changes.
license: Apache-2.0
metadata:
  author: asome
  version: "1.1"
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

### Scope → module or feature

Scope should match the module, feature folder, or cross-cutting area being changed.
Infer it from the staged diff's file paths.

| Kind | Scope examples |
|---|---|
| Backend module | `auth`, `clients`, `projects`, `team`, `finance`, `users` |
| Backend cross-cutting | `prisma`, `config`, `common`, `main` |
| Frontend feature | `clients`, `projects`, `auth`, `dashboard` |
| Frontend infra | `api-client`, `router`, `stores` |
| Repo / CI | `ci`, `docker`, `env`, `deps` |

Adapt scope names to the project's actual module structure.

---

## Execution steps

```bash
# 1. Show staged changes summary
git diff --cached --stat

# 2. Infer type + scope from the diff
# (read the diff and suggest based on the tables above)

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

## SDD-aligned commit workflow

When implementing a feature via SDD, each commit maps to one task from the task list:

```bash
# Example: implementing task "Add Client model and migration"
git commit -m "feat(clients): add Client model and migration"

# Task: implement ClientsService
git commit -m "feat(clients): implement ClientsService with CRUD methods"

# Task: add controller + DTOs
git commit -m "feat(clients): add ClientsController with paginated list endpoint"

# Task: tests
git commit -m "test(clients): add unit tests for ClientsService"
```

Each commit should be atomic — one task, passes lint + typecheck on its own.

---

## Common mistakes to avoid

- **DON'T**: `git commit -m "changes"` — non-conventional
- **DON'T**: `git commit -m "feat: add stuff"` — too vague, no scope
- **DON'T**: `git commit -m "WIP"` — not allowed on `main` or PR branches
- **DON'T**: Mix multiple unrelated changes in one commit — split them
- **DO**: `git commit -m "feat(auth): add JWT strategy with JWKS validation"`
- **DO**: `git commit -m "fix(prisma): handle P2002 unique constraint as 409 Conflict"`

---

## If pre-commit hook fails

```bash
# Run what the hook runs (adapt to project's lint/typecheck setup):
npm run lint && tsc --noEmit

# Fix issues, re-stage, then:
git commit -m "<same message>"
# Do NOT use --no-verify to bypass the hook
```
