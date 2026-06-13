---
name: asome-branch-pr
description: >
  Create a branch and open an enriched PR for asomelab/asome-portal with test plan,
  changes table, and auto-move board stage to In Review.
  Trigger: "create PR", "open PR", "abrir PR", "crear PR", "branch and PR",
  "push and PR", "ready for review", or when implementation is done and needs review.
license: Apache-2.0
metadata:
  author: asome
  version: "1.0"
  project: asomelab/asome-portal
---

# ASOME — Branch + PR

Creates a conventional branch, validates commits, opens a PR with full body,
and moves the linked issue's Stage to **In Review** on Project #6.

**Executes directly.**

---

## Project constants

```
REPO       = asomelab/asome-portal
PROJECT_ID = PVT_kwDODNkJ584Bakec
Stage field       PVTSSF_lADODNkJ584BakeczhVbLds
In Review option  0e32ac74
Done option       75d5718b
```

---

## Pre-flight checks

Before creating anything, verify:
1. There is a linked issue number (ask if not provided)
2. The issue exists: `gh issue view <N> --repo asomelab/asome-portal`
3. Working tree is clean OR staged changes are ready
4. Tests pass: `cd api && npm test` + `cd web && npm test`
5. Lint + typecheck: `npm run lint && tsc --noEmit` in both `api/` and `web/`

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
git checkout -b <type>/<slug> main
```

---

## Commit convention

```
<type>(<scope>): <description>
```

- `type` — same list as branch types above
- `scope` — optional, matches the NestJS module or web feature folder (e.g. `clients`, `auth`, `finance`, `dashboard`)
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

```markdown
Closes #<issue-number>

## Summary
- bullet 1
- bullet 2
- bullet 3 (max)

## Changes

| File | Change |
|---|---|
| `api/src/clients/clients.controller.ts` | Add GET /clients with pagination |
| `api/src/clients/dto/paginated-clients.dto.ts` | New DTO |

## Test plan

### Automated
- [ ] `cd api && npm test` — Jest passes (or `cd web && npm test` — Vitest passes)
- [ ] `npm run lint` passes in api/ and web/
- [ ] `tsc --noEmit` passes in api/ and web/

### Manual
- [ ] <specific thing to test manually, e.g. "GET /api/clients returns paginated list">
- [ ] <another manual check>

### API (if backend)
\`\`\`bash
# example curl or httpie call
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/clients
\`\`\`

## Checklist
- [ ] Linked approved issue (`Closes #N`)
- [ ] Conventional commit format
- [ ] Tests written and passing
- [ ] Lint + typecheck clean
- [ ] `@ApiProperty` on all new DTOs
- [ ] No `process.env` outside `src/config/` (api)
- [ ] shadcn components in `src/components/ui/` (web)
- [ ] No direct fetch/axios calls in components — always React Query (web)
```

---

## Execution steps

```bash
# 1. Create and push branch
git checkout -b <type>/<slug> main
# ... make changes + commits ...
git push -u origin <type>/<slug>

# 2. Open PR
PR_URL=$(gh pr create \
  --repo asomelab/asome-portal \
  --title "<type>(<scope>): <description>" \
  --body "$(cat <<'BODY'
Closes #<N>

## Summary
- ...

## Changes
| File | Change |
|---|---|
| `path/to/file` | what changed |

## Test plan
### Automated
- [ ] Jest passes
- [ ] Lint clean
- [ ] tsc --noEmit clean

### Manual
- [ ] <check>

## Checklist
- [ ] Linked issue
- [ ] Conventional commits
- [ ] Tests written
- [ ] @ApiProperty on DTOs
BODY
)" \
  --base main)
echo "PR: $PR_URL"

# 3. Add type label
PR_NUM=$(echo "$PR_URL" | grep -oE '[0-9]+$')
gh pr edit $PR_NUM --repo asomelab/asome-portal --add-label "type:<x>"

# 4. Move issue Stage → In Review on the board
# Get the project item ID for issue #N
ISSUE_NODE=$(gh api repos/asomelab/asome-portal/issues/<N> --jq .node_id)
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
    projectId:\"PVT_kwDODNkJ584Bakec\"
    itemId:\"$ITEM_ID\"
    fieldId:\"PVTSSF_lADODNkJ584BakeczhVbLds\"
    value:{singleSelectOptionId:\"0e32ac74\"}
  }){projectV2Item{id}}
}"
echo "Stage → In Review"
```

---

## After merge

When the PR is merged, run:

```bash
# Move Stage → Done
gh api graphql -f query="
mutation{
  updateProjectV2ItemFieldValue(input:{
    projectId:\"PVT_kwDODNkJ584Bakec\"
    itemId:\"$ITEM_ID\"
    fieldId:\"PVTSSF_lADODNkJ584BakeczhVbLds\"
    value:{singleSelectOptionId:\"75d5718b\"}
  }){projectV2Item{id}}
}"

# Delete local branch
git branch -d <type>/<slug>
```

Or use `/asome-sprint move <issue> done` to do this automatically.
