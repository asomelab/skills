---
name: asome-branch-pr
description: >
  Create a branch off the root development branch and open an enriched PR for any
  ASOME project targeting that same dev branch, with test plan, changes table, and
  auto-move board stage to In Review.
  Trigger: "create PR", "open PR", "abrir PR", "crear PR", "branch and PR",
  "push and PR", "ready for review", or when implementation is done and needs review.
license: Apache-2.0
metadata:
  author: asome
  version: "1.2"
---

# ASOME — Branch + PR

Creates a conventional branch off the project's root development branch, validates
commits, opens a PR **targeting that same dev branch** with full body, and moves the
linked issue's Stage to **In Review** on the project board.

Feature/fix branches never branch from or target `main`/`staging` directly — those
are promotion-only targets handled by `/asome-deploy`. See that skill's branch model.

**Executes directly.**

> **Prerequisite**: `.asome/config.json` must exist. If missing, run `/asome-setup` first.

---

## Resolve project context

```bash
REPO=$(jq -r '.repo' .asome/config.json)
PROJECT_ID=$(jq -r '.project_id' .asome/config.json)
F_STAGE=$(jq -r '.fields.Stage.id' .asome/config.json)
IN_REVIEW=$(jq -r '.fields.Stage.options["In Review"]' .asome/config.json)
DONE=$(jq -r '.fields.Stage.options["Done"]' .asome/config.json)

# Root development branch — same resolution as /asome-deploy
DEV_BRANCH=$(jq -r '.deploy.dev // empty' .asome/config.json 2>/dev/null)
if [ -z "$DEV_BRANCH" ]; then
  git fetch origin --quiet
  DEV_BRANCH=$(git branch -r | grep -oE 'origin/(develop|dev|development)' | head -1 | sed 's/origin\///')
fi
echo "Root dev branch: $DEV_BRANCH"
```

If no `dev`/`develop`/`development` branch is found, ask the user which branch is
the root development branch before proceeding — do not fall back to `main`.

---

## Pre-flight checks

Before creating anything, verify:

1. Linked issue number (ask if not provided)
2. Issue exists: `gh issue view <N> --repo "$REPO"`
3. Working tree is clean OR staged changes are ready
4. **For Feature / Improvement / Setup issues**: `/sdd-verify` must have passed (no CRITICAL findings).
   - If SDD verify has not been run, run it now before proceeding.
5. Tests pass (adapt commands to the project's test setup)
6. Lint + typecheck pass

If any check fails → fix first, then proceed.

---

## Branch naming

```
<type>/<short-slug>
```

Types: `feat` · `fix` · `chore` · `docs` · `refactor` · `perf` · `test` · `build` · `ci`
Slug: lowercase, `a-z0-9-` only, max 40 chars.

Examples:
- `feat/client-crud-api`
- `fix/prisma-exception-filter`
- `refactor/auth-decorators`
- `docs/api-swagger-annotations`

```bash
git checkout -b <type>/<slug> origin/$DEV_BRANCH
```

---

## Commit convention

```
<type>(<scope>): <description>
```

- `type` — same list as branch types above
- `scope` — matches the module or feature folder being changed
- `description` — imperative, lowercase, no period

```bash
git commit -m "$(cat <<'EOF'
feat(clients): add paginated list endpoint with search and status filter

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## PR body format

Use `references/pr-template.md`. Every section is required.

For Feature / Improvement / Setup PRs, add the SDD change reference at the top:

```markdown
> SDD change: `<change-name>`

Closes #<issue-number>
...
```

---

## Execution steps

```bash
# 1. Create and push branch off the root dev branch
git fetch origin --quiet
git checkout -b <type>/<slug> origin/$DEV_BRANCH
# ... make changes + commits (use /asome-commit) ...
git push -u origin <type>/<slug>

# 2. Open PR
PR_URL=$(gh pr create \
  --repo "$REPO" \
  --title "<type>(<scope>): <description>" \
  --body "$(cat <<'BODY'
> SDD change: `<change-name>`    ← include for Feature/Improvement/Setup; omit for Bug/Chore

Closes #<N>

## Summary
- ...

## Changes
| File | Change |
|---|---|
| `<path/to/file>` | what changed |

## Test plan
### Automated
- [ ] Tests pass
- [ ] Lint clean
- [ ] Type-check clean

### Manual
- [ ] <check>

## Checklist
- [ ] Linked issue
- [ ] Conventional commits
- [ ] Tests written
- [ ] SDD verify passed (Feature/Improvement/Setup)
BODY
)" \
  --base "$DEV_BRANCH")
echo "PR: $PR_URL"

# 3. Add type label
PR_NUM=$(echo "$PR_URL" | grep -oE '[0-9]+$')
gh pr edit $PR_NUM --repo "$REPO" --add-label "type:<x>"

# 4. Move issue Stage → In Review on the board
ISSUE_NODE=$(gh api repos/$REPO/issues/<N> --jq .node_id)
ITEM_ID=$(gh api graphql -f query="
{
  node(id:\"$ISSUE_NODE\"){
    ...on Issue{
      projectItems(first:5){nodes{id}}
    }
  }
}" --jq '.data.node.projectItems.nodes[0].id')

gh api graphql -f query="
mutation{
  updateProjectV2ItemFieldValue(input:{
    projectId:\"$PROJECT_ID\"
    itemId:\"$ITEM_ID\"
    fieldId:\"$F_STAGE\"
    value:{singleSelectOptionId:\"$IN_REVIEW\"}
  }){projectV2Item{id}}
}"
echo "Stage → In Review"
```

---

## After merge

When the PR is merged:

```bash
# Move Stage → Done
gh api graphql -f query="
mutation{
  updateProjectV2ItemFieldValue(input:{
    projectId:\"$PROJECT_ID\"
    itemId:\"$ITEM_ID\"
    fieldId:\"$F_STAGE\"
    value:{singleSelectOptionId:\"$DONE\"}
  }){projectV2Item{id}}
}"

# Archive the SDD change (for Feature/Improvement/Setup)
# /sdd-archive <change-name>

# Delete local branch
git branch -d <type>/<slug>
```

Or use `/asome-sprint move <issue> done` to move stage automatically.
