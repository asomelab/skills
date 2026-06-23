---
name: asome-infra-audit
description: >
  Audit an ASOME project's infrastructure against Terraform, AWS Well-Architected, and
  GitHub Actions best practices. Emits findings as CRITICAL / WARNING / SUGGESTION with
  a summary table. Read-only — makes no changes.
  Trigger: "audit infra", "review infra", "check terraform", "auditar infraestructura",
  "infrastructure review", "check best practices", or before /asome-infra-plan on any
  project with Terraform or GitHub Actions workflows.
license: Apache-2.0
metadata:
  author: asome
  version: "1.0"
---

# ASOME — Infrastructure Audit

Scans `infra/**/*.tf` and `.github/workflows/*.yml` against a curated checklist and
emits findings with severity levels. Run before every `terraform apply` or PR to `main`.

**Read-only. Makes no changes.**

> **Prerequisite**: Project must have an `infra/` directory or `.github/workflows/` to audit.
> For a fresh project, run `/asome-infra-setup` first.

---

## Severity levels

| Level | Meaning |
|---|---|
| **CRITICAL** | Security risk or data-loss risk. Block apply until fixed. |
| **WARNING** | Reliability, cost, or maintainability issue. Fix before production. |
| **SUGGESTION** | Best-practice improvement. Address when convenient. |

---

## Execution steps

### Step 1 — locate files

```bash
TF_FILES=$(find ./infra -name "*.tf" 2>/dev/null)
WORKFLOW_FILES=$(find ./.github/workflows -name "*.yml" -o -name "*.yaml" 2>/dev/null)

echo "Terraform files: $(echo "$TF_FILES" | wc -l | tr -d ' ')"
echo "Workflow files:  $(echo "$WORKFLOW_FILES" | wc -l | tr -d ' ')"
```

### Step 2 — run checklist (see `references/audit-checklist.md`)

For each check, emit a finding line:

```
[CRITICAL] <check title> — <file>:<line> — <why it matters>
[WARNING]  <check title> — <file>:<line> — <recommended fix>
[SUGGESTION] <check title> — <file>:<line> — <improvement>
```

Run all Terraform, AWS, and GitHub Actions checks from `references/audit-checklist.md`.

Example inline checks:

```bash
# Terraform: no hardcoded AWS keys
grep -rn "AKIA\|aws_secret_access_key\s*=\s*\"" ./infra/ \
  && echo "[CRITICAL] Hardcoded AWS credentials detected"

# Terraform: remote state backend configured
grep -rn 'backend\s*"s3"' ./infra/ > /dev/null \
  || echo "[CRITICAL] No remote state backend — state will be local only"

# Terraform: provider versions pinned
grep -A5 'required_providers' ./infra/**/*.tf | grep -v 'version\s*=' \
  && echo "[WARNING] Provider version not pinned — add version constraints"

# AWS: no public S3 bucket
grep -rn 'acl\s*=\s*"public-read\|public-read-write"' ./infra/ \
  && echo "[CRITICAL] Public S3 ACL detected"

# GHA: OIDC vs long-lived keys
grep -rn 'AWS_ACCESS_KEY_ID\|AWS_SECRET_ACCESS_KEY' ./.github/workflows/ \
  && echo "[WARNING] Long-lived AWS keys in workflows — migrate to OIDC"

# GHA: pinned action SHAs
grep -rn 'uses:.*@[^0-9a-f]' ./.github/workflows/ | grep -v '@v[0-9]' \
  && echo "[WARNING] Actions not pinned to a SHA or version tag"
```

### Step 3 — emit summary table

After all checks, print a summary:

```
=== Audit Summary ===

| Severity    | Count | Top finding                              |
|-------------|-------|------------------------------------------|
| CRITICAL    | N     | <first critical or "none">               |
| WARNING     | N     | <first warning or "none">                |
| SUGGESTION  | N     | <first suggestion or "none">             |

Overall: PASS / NEEDS ATTENTION / BLOCKED
```

- **PASS** — zero CRITICAL, zero WARNING.
- **NEEDS ATTENTION** — zero CRITICAL, one or more WARNING.
- **BLOCKED** — one or more CRITICAL. Do not run `/asome-infra-plan apply` until resolved.

---

## Known gotchas

- This skill is heuristic — it catches common patterns but is not a full static analysis tool.
  Use `tfsec`, `checkov`, or `terrascan` in CI for complete coverage.
- `grep -rn` on large repos can be slow; scope to `./infra` and `.github/workflows` only.
- Some CRITICAL findings (e.g., hardcoded keys) may be false positives in example/docs files.
  Always verify the context before acting.
- GHA workflow files may be split across `on:` triggers — read the full file before marking it
  as non-compliant.
