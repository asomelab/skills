---
name: asome-commit
description: >
  Create atomic conventional commits for any ASOME project: split staged changes by
  concern, validate format per commit, and commit each with a co-author trailer.
  Trigger: "commit", "commitear", "hacer commit", "conventional commit",
  "qué tipo de commit va", "commit con mensaje", "atomic commit", "commits atomicos",
  or any request to commit staged changes.
license: Apache-2.0
metadata:
  author: asome
  version: "1.2"
---

# ASOME — Conventional Commit

Inspects staged (and unstaged, if nothing is staged) changes, splits them into
atomic groups by concern, suggests one conventional commit message per group,
validates the format, and commits each group separately with the co-author trailer.
Executes directly.

## Atomicity rule (mandatory)

One commit = one logical change = one `type(scope)`. Never bundle unrelated
concerns into a single commit, even if they were all staged together.

A diff must be **split** into separate commits when it contains changes that:
- touch different scopes (e.g. `auth` files + `billing` files)
- mix different types (e.g. a `feat` change + an unrelated `fix` or `chore`)
- mix source changes with unrelated formatting/lint-only changes
- include a generated/lock file change unrelated to the feature change

A diff may stay as **one** commit when all changed files serve the same
logical change, even across multiple files (e.g. a service + its controller +
its DTO for the same new endpoint, or a feature + its tests).

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
# 1. Show what's staged (fall back to unstaged if nothing is staged)
git diff --cached --stat
git status --porcelain
```

```bash
# 2. Read the full diff and group files by logical change
git diff --cached
```

Group changed files by concern (scope + type), per the Atomicity rule above.
Each group becomes one commit. If everything belongs to one logical change,
there is just one group.

```bash
# 3. For each group, stage ONLY that group's files, unstaging the rest first
git restore --staged .
git add <files for this group>

# 4. Validate the message format before committing
# Message must match: ^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\([a-z0-9._-]+\))?!?: .+

# 5. Commit with trailer
git commit -m "$(cat <<'EOF'
<type>(<scope>): <description>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"

# 6. Repeat steps 3-5 for the next group until all changes are committed
git status --porcelain
```

If a single file mixes two unrelated concerns (e.g. an unrelated lint fix
alongside a feature change in the same file), use `git add -p` to stage only
the relevant hunks for the current group instead of the whole file.

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
