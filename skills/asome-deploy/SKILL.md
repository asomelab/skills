---
name: asome-deploy
description: >
  Promote code between environments following a strict Gitflow chain: dev → staging → main.
  Opens a PR from the source branch to the target — never pushes directly. Enforces the
  promotion order: staging only from dev, main only from staging. Supports branch-name
  aliases (dev/development, staging/stg, main/master) resolved from .asome/config.json.
  After a staging → main promotion PR is merged, tags a semver release (git tag, asks
  the user for major/minor/patch), and publishes a GitHub Release with auto-generated
  notes (`gh release create --generate-notes`).
  Trigger: "deploy", "deploy to staging", "deploy to main", "promote", "desplegar",
  "merge to staging", "merge to prod", "release to staging", "release to main",
  "tag release", "crear release", "versionar", "semver",
  or any request to promote code between environments or cut a release.
  Usage: /asome-deploy <dev|staging|main>
license: Apache-2.0
metadata:
  author: asome
  version: "1.2"
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

### Step 6 — wait for required checks before declaring the PR promotable

**Never tell the user a promotion PR is ready to merge until checks are green.**

```bash
echo "Waiting for CI checks on PR #$PR_NUM..."
gh pr checks "$PR_NUM" --repo "$REPO" --watch --interval 15
CHECKS_EXIT=$?

if [ $CHECKS_EXIT -ne 0 ]; then
  echo "❌ One or more checks failed on PR #$PR_NUM."
  echo "Promotion stopped — do NOT merge $PR_URL until checks are fixed and green."
  exit 1
fi

echo "✅ All checks passed on PR #$PR_NUM. Ready for review/merge."
```

`gh pr checks --watch` blocks until every required check finishes and exits non-zero if any
check fails or times out. Treat a non-zero exit as a hard stop — end the task here, surface
the failing check(s) (`gh pr checks "$PR_NUM" --repo "$REPO"` for the list), and do not
proceed to merge, tag, or release.

---

## After merge

When the promotion PR is merged, the target environment is updated. CI/CD workflows
(copied by `/asome-infra-setup`) handle the actual deployment pipeline.

**For `staging → $PROD_BRANCH` merges only**, also cut a semver release (see below).
Promotions to staging are not tagged or released.

To keep branches in sync after merging `staging → main`:
```bash
# Ensure staging has everything main has (back-sync is rare but good hygiene)
git fetch --all
git log --oneline origin/main..origin/staging   # should be empty after a clean merge
```

---

## Release (semver tag + GitHub Release) — main promotions only

Run this after confirming the `staging → $PROD_BRANCH` promotion PR is merged.

```bash
# 0. Confirm the PR actually merged
gh pr view "$PR_NUM" --repo "$REPO" --json state,mergedAt --jq '.state'
# Must print "MERGED" — if not, stop, it hasn't shipped yet.

git fetch --all --prune --tags
```

### Step 0b — wait for the post-merge deploy workflow, stop if it fails

The merge itself may trigger a deploy workflow on `$PROD_BRANCH`. Don't tag a release on
top of a broken deploy.

```bash
MERGE_SHA=$(gh pr view "$PR_NUM" --repo "$REPO" --json mergeCommit --jq '.mergeCommit.oid')
RUN_ID=$(gh run list --repo "$REPO" --branch "$PROD_BRANCH" --commit "$MERGE_SHA" --json databaseId --jq '.[0].databaseId')

if [ -n "$RUN_ID" ]; then
  echo "Watching deploy workflow run $RUN_ID on $PROD_BRANCH..."
  gh run watch "$RUN_ID" --repo "$REPO" --exit-status
  if [ $? -ne 0 ]; then
    echo "❌ Post-merge workflow run failed for $MERGE_SHA on $PROD_BRANCH."
    echo "Promotion stopped — fix the failure before tagging or releasing."
    exit 1
  fi
  echo "✅ Post-merge checks passed."
else
  echo "No workflow run found for $MERGE_SHA on $PROD_BRANCH — skipping watch."
fi
```

Treat any non-zero `gh run watch` exit as a hard stop: end the task, do not tag, do not
publish a release.

### Step 1 — find the latest tag

```bash
LATEST_TAG=$(git tag --list 'v[0-9]*.[0-9]*.[0-9]*' --sort=-v:refname | head -1)
LATEST_TAG="${LATEST_TAG:-v0.0.0}"
echo "Latest release: $LATEST_TAG"
```

### Step 2 — ask the user for the bump type

Show the commits included in this promotion as context (`git log --oneline
origin/$PROD_BRANCH..origin/staging` from Step 2 above, or `git log <LATEST_TAG>..origin/$PROD_BRANCH`
if that range is now empty post-merge), then **ask the user**: "¿major, minor o patch?"
Do not infer it automatically — always ask.

### Step 3 — compute and create the tag

```bash
# Strip leading 'v', split into MAJOR.MINOR.PATCH
VERSION="${LATEST_TAG#v}"
MAJOR=$(echo "$VERSION" | cut -d. -f1)
MINOR=$(echo "$VERSION" | cut -d. -f2)
PATCH=$(echo "$VERSION" | cut -d. -f3)

case "$BUMP" in   # BUMP = answer from Step 2: major | minor | patch
  major) MAJOR=$((MAJOR+1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR+1)); PATCH=0 ;;
  patch) PATCH=$((PATCH+1)) ;;
  *) echo "❌ Invalid bump type: $BUMP"; exit 1 ;;
esac

NEW_TAG="v${MAJOR}.${MINOR}.${PATCH}"
echo "Tagging release: $NEW_TAG"

git checkout "$PROD_BRANCH"
git pull origin "$PROD_BRANCH"
git tag -a "$NEW_TAG" -m "Release $NEW_TAG"
git push origin "$NEW_TAG"
```

### Step 4 — publish the GitHub Release with auto-generated notes

```bash
gh release create "$NEW_TAG" \
  --repo "$REPO" \
  --target "$PROD_BRANCH" \
  --title "$NEW_TAG" \
  --generate-notes \
  --notes-start-tag "$LATEST_TAG"

echo "✅ Released $NEW_TAG"
```

`--generate-notes` builds release notes from merged PRs/commits since `$LATEST_TAG` —
no separate changelog tooling needed. GitHub keeps the full release history as the
changelog (visible at `https://github.com/$REPO/releases`).

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
- Tags follow `vMAJOR.MINOR.PATCH` (semver). Only `staging → main` promotions get tagged
  and released — `dev → staging` does not. If `git tag --list 'v*'` is empty, the skill
  starts from `v0.0.0`.
- Never re-tag or force-push an existing tag. If a release was tagged in error, create a
  new patch tag pointing at the correct commit instead of moving the old one.
- **CI gates are hard stops, not warnings.** `gh pr checks --watch` failing means stop and
  report — never merge, tag, or release around a red check. Same for the post-merge
  `gh run watch` on the deploy workflow.
