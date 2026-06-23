---
name: asome-deploy
description: >
  Promote code between environments following a strict Gitflow chain: dev → staging → main.
  Opens a PR from the source branch to the target — never pushes directly. Enforces the
  promotion order: staging only from dev, main only from staging. Supports branch-name
  aliases (dev/development, staging/stg, main/master) resolved from .asome/config.json.
  Trigger: "deploy", "deploy to staging", "deploy to main", "promote", "desplegar",
  "merge to staging", "merge to prod", "release to staging", "release to main",
  or any request to promote code between environments.
  Usage: /asome-deploy <dev|staging|main>
license: Apache-2.0
metadata:
  author: asome
  version: "1.0"
---

# ASOME — Deploy (Environment Promotion)

Opens a promotion PR from the correct source branch to the target environment.
Enforces the Gitflow chain — no skipping environments.

**PR-first. Never direct-pushes to environment branches.**

> **Prerequisite**: `.asome/config.json` must exist. If missing, run `/asome-setup` first.

---

## Branch model

```
feature/fix branches
        │
        ▼ PR
      dev  (or: development)
        │
        ▼ PR only (/asome-deploy staging)
    staging  (or: stg)
        │
        ▼ PR only (/asome-deploy main)
      main  (or: master)
```

Rules:
- `main` accepts PRs **only** from `staging`. Any other source is rejected.
- `staging` accepts PRs **only** from `dev`. Any other source is rejected.
- `dev` receives feature/fix branches via `/asome-branch-pr`. Not a promotion target.
- `main` must always be in sync with `staging` (main ⊇ staging after every merge).
- `staging` must always be in sync with `dev` (staging ⊇ dev after every merge).

---

## Resolve project context

```bash
REPO=$(jq -r '.repo' .asome/config.json)

# Branch name resolution — read from optional deploy block, fall back to aliases
DEV_BRANCH=$(jq -r '.deploy.dev // empty' .asome/config.json 2>/dev/null)
STG_BRANCH=$(jq -r '.deploy.staging // empty' .asome/config.json 2>/dev/null)
PROD_BRANCH=$(jq -r '.deploy.prod // empty' .asome/config.json 2>/dev/null)
```

If the `deploy` block is missing, auto-detect via git remote branches:

```bash
# Auto-detect dev
DEV_BRANCH=$(git branch -r | grep -oE 'origin/(dev|development)' | head -1 | sed 's/origin\///')
# Auto-detect staging
STG_BRANCH=$(git branch -r | grep -oE 'origin/(staging|stg)' | head -1 | sed 's/origin\///')
# Auto-detect prod
PROD_BRANCH=$(git branch -r | grep -oE 'origin/(main|master)' | head -1 | sed 's/origin\///')

echo "Detected branches: dev=$DEV_BRANCH staging=$STG_BRANCH prod=$PROD_BRANCH"
```

Offer to persist detected names into `.asome/config.json` deploy block for future runs:

```bash
# Persist to .asome/config.json (if user confirms)
jq --arg dev "$DEV_BRANCH" --arg stg "$STG_BRANCH" --arg prod "$PROD_BRANCH" \
  '.deploy = {"dev": $dev, "staging": $stg, "prod": $prod}' \
  .asome/config.json > /tmp/asome-config.tmp && mv /tmp/asome-config.tmp .asome/config.json
echo "Saved deploy branch names to .asome/config.json"
```

---

## Execution steps

### Step 0 — parse target and enforce chain

```bash
TARGET="${1:-}"   # argument passed: dev, staging, or main
```

Map friendly names to resolved branch names and enforce valid source:

| Target arg | Resolved target | Allowed source | Rejected sources |
|---|---|---|---|
| `staging` or `stg` | `$STG_BRANCH` | `$DEV_BRANCH` | anything else |
| `main`, `master`, or `prod` | `$PROD_BRANCH` | `$STG_BRANCH` | anything else |
| `dev` or `development` | error — not a promotion target | — | — |

```bash
case "$TARGET" in
  staging|stg)
    TARGET_BRANCH="$STG_BRANCH"
    SOURCE_BRANCH="$DEV_BRANCH"
    ;;
  main|master|prod|production)
    TARGET_BRANCH="$PROD_BRANCH"
    SOURCE_BRANCH="$STG_BRANCH"
    # Extra confirmation for main/prod
    echo "⚠️  Deploying to PRODUCTION ($TARGET_BRANCH). This affects end users."
    echo "Confirm? (yes/no)"
    ;;
  dev|development)
    echo "❌ dev is not a promotion target — feature branches merge to dev via /asome-branch-pr."
    exit 1
    ;;
  *)
    echo "❌ Unknown target: $TARGET"
    echo "Usage: /asome-deploy <staging|main>"
    exit 1
    ;;
esac
```

### Step 1 — fetch and check status

```bash
git fetch --all --prune

# Verify source branch exists
git rev-parse --verify "origin/$SOURCE_BRANCH" > /dev/null \
  || { echo "❌ Source branch '$SOURCE_BRANCH' not found on remote."; exit 1; }

# Verify target branch exists
git rev-parse --verify "origin/$TARGET_BRANCH" > /dev/null \
  || { echo "❌ Target branch '$TARGET_BRANCH' not found on remote."; exit 1; }

# Count commits source has that target doesn't
AHEAD=$(git rev-list --count "origin/$TARGET_BRANCH..origin/$SOURCE_BRANCH")
# Count commits target has that source doesn't (divergence)
BEHIND=$(git rev-list --count "origin/$SOURCE_BRANCH..origin/$TARGET_BRANCH")

echo "$SOURCE_BRANCH is $AHEAD commit(s) ahead, $BEHIND commit(s) behind $TARGET_BRANCH"
```

Guards:
- `AHEAD == 0` → "Nothing to deploy — `$SOURCE_BRANCH` is already up to date with `$TARGET_BRANCH`." Stop.
- `BEHIND > 0` → "⚠️ `$TARGET_BRANCH` has $BEHIND commit(s) not in `$SOURCE_BRANCH` (diverged). Back-merge `$TARGET_BRANCH` → `$SOURCE_BRANCH` first before promoting." Stop.

### Step 2 — show commits to be deployed

```bash
echo ""
echo "=== Commits to be deployed ($SOURCE_BRANCH → $TARGET_BRANCH) ==="
git log --oneline "origin/$TARGET_BRANCH..origin/$SOURCE_BRANCH" | head -20
```

### Step 3 — check for open PR

```bash
EXISTING_PR=$(gh pr list --repo "$REPO" --base "$TARGET_BRANCH" --head "$SOURCE_BRANCH" --json number,url --jq '.[0]')
if [ -n "$EXISTING_PR" ]; then
  PR_URL=$(echo "$EXISTING_PR" | jq -r '.url')
  echo "✅ Promotion PR already open: $PR_URL"
  echo "Review and merge it to deploy."
  exit 0
fi
```

### Step 4 — open promotion PR

```bash
PR_URL=$(gh pr create \
  --repo "$REPO" \
  --base "$TARGET_BRANCH" \
  --head "$SOURCE_BRANCH" \
  --title "deploy: $SOURCE_BRANCH → $TARGET_BRANCH" \
  --body "$(cat <<'BODY'
## Promotion

**Source**: `SOURCE_BRANCH`
**Target**: `TARGET_BRANCH`

## Commits included

<!-- List auto-populated by git log above — paste here -->

## Verification

Before merging, verify in the source environment:

- [ ] Smoke test: critical user flows work
- [ ] No CRITICAL findings from `/asome-infra-audit` (if infra changed)
- [ ] No CRITICAL findings from `/asome-review` (if code changed)
- [ ] Monitoring shows no anomalies in `SOURCE_BRANCH` environment

## Rollback

If issues found after merge:
- **Quick**: revert this PR on GitHub (`gh pr revert`)
- **Infra**: `git revert` + `/asome-infra-plan apply`
- **Last resort**: restore from previous deploy tag/snapshot
BODY
)")
echo ""
echo "✅ Promotion PR opened: $PR_URL"
echo ""
echo "Next: review the PR, get approval, then merge to trigger deployment."
```

### Step 5 — show diff (optional)

```bash
PR_NUM=$(echo "$PR_URL" | grep -oE '[0-9]+$')
gh pr diff "$PR_NUM" --repo "$REPO" | head -100
echo "(diff truncated — view full diff at $PR_URL)"
```

---

## After merge

When the promotion PR is merged, the target environment is updated. No post-merge steps
are required by this skill — CI/CD workflows (copied by `/asome-infra-setup`) handle
the actual deployment pipeline.

To keep branches in sync after merging `staging → main`:
```bash
# Ensure staging has everything main has (back-sync is rare but good hygiene)
git fetch --all
git log --oneline origin/main..origin/staging   # should be empty after a clean merge
```

---

## Known gotchas

- **Never** `git push origin dev:staging` or `git push origin staging:main` — direct push
  bypasses CI, reviews, and protection rules. Always use a PR.
- If `TARGET_BRANCH` has commits not in `SOURCE_BRANCH` (diverged), back-merge first:
  open a reverse PR (`target → source`) to sync, then re-run `/asome-deploy`.
- Branch names vary by project (`dev` vs `development`, `main` vs `master`). The skill
  auto-detects and persists to `.asome/config.json` on first run.
- `git fetch --all --prune` is required before `rev-list` counts — local refs may be stale.
- For `main`/prod deployments, ensure branch protection rules require at least one review
  on the promotion PR (configure in GitHub → Settings → Branches).
