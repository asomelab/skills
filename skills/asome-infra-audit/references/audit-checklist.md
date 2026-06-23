# Infrastructure Audit Checklist

Used by `/asome-infra-audit`. Each item maps to a severity level and a grep-detectable
pattern where possible.

---

## Terraform

### CRITICAL

| Check | Why | Detection |
|---|---|---|
| Remote state backend configured (`backend "s3"` or `backend "azurerm"`) | Local state is lost on machine change; no locking | Absence of `backend` block in `*.tf` |
| State locking enabled (`dynamodb_table` for S3 backend) | Concurrent applies corrupt state | `backend "s3"` without `dynamodb_table` |
| No hardcoded secrets or AWS keys | Keys in code = credentials leak | `grep -rn "AKIA\|aws_secret_access_key\s*="` |
| No hardcoded passwords in resource definitions | DB passwords in plaintext = security incident | `grep -rn 'password\s*=\s*"[^$]'` |
| Sensitive outputs marked `sensitive = true` | Secrets appear in `terraform output` and CI logs | Output block with `value` referencing secrets |

### WARNING

| Check | Why | Detection |
|---|---|---|
| Provider versions pinned (`version = "~> x.y"`) | Unpinned = surprise breaking changes | `required_providers` block missing `version` |
| Module sources pinned to a version/tag/SHA | `source = "git://...?ref=main"` drifts silently | Module `source` without `?ref=` or `version` |
| `for_each` preferred over `count` for resource sets | `count` causes resource recreation on list reorder | Repeated resources using `count` |
| All resources tagged (`tags` block with at least `Project`, `Env`, `ManagedBy`) | Untagged resources = cost blindspot | Missing `tags` on `aws_*` resources |
| No deprecated provider config (e.g., AWS classic-style) | Deprecated patterns removed in newer providers | Old `provider "aws"` `access_key`/`secret_key` attrs |
| `terraform.tfvars` not committed | Contains env-specific or sensitive values | File exists AND is tracked by git |

### SUGGESTION

| Check | Why |
|---|---|
| Variables have `description` and `type` declared | Self-documenting, catches type errors |
| Outputs have `description` | Makes module re-use clearer |
| Modules split by concern (networking, compute, storage) | Easier to read and test |
| `.terraform.lock.hcl` committed | Pins provider versions for reproducible runs |
| `terraform validate` passes clean | Catches syntax errors before plan |

---

## AWS (Well-Architected)

### CRITICAL

| Check | Why | Detection |
|---|---|---|
| No public S3 buckets (`acl = "public-read"` or `block_public_acls = false`) | Data exposure | `grep -rn 'acl.*public\|block_public_acls.*false'` |
| S3 buckets have versioning enabled (for state/data buckets) | Accidental delete = unrecoverable | `aws_s3_bucket_versioning` resource present |
| Encryption at rest enabled (S3 SSE, RDS `storage_encrypted = true`, EBS) | Compliance + breach scope reduction | Missing encryption config |
| IAM policies use least privilege (no `"*"` actions on `"*"` resources) | Overly broad → blast radius on compromise | `grep -rn '"Action": "\*"'` or `"Resource": "\*"` |
| Security groups don't allow `0.0.0.0/0` ingress on sensitive ports (22, 3306, 5432, 6379) | Open DB/SSH = internet-exposed | `grep -rn 'cidr_blocks.*0\.0\.0\.0/0'` near port rules |

### WARNING

| Check | Why |
|---|---|
| RDS has `deletion_protection = true` in prod | Accidental destroy = data loss |
| RDS uses Multi-AZ (`multi_az = true`) in prod | Single-AZ = downtime on AZ failure |
| EBS volumes encrypted (`encrypted = true`) | At-rest data protection |
| CloudTrail enabled | Audit trail for security incidents |
| Instance types are right-sized (not `t2.*` — prefer `t3`/`t4g` Graviton) | t2 is older gen; Graviton = cheaper + faster |
| NAT Gateway: single NAT for non-prod, multi-AZ for prod | Single NAT in prod = AZ failure = outage |
| S3 lifecycle rules configured for log/archive buckets | Old objects accumulate cost |
| VPC flow logs enabled | Network visibility for security investigations |

### SUGGESTION

| Check | Why |
|---|---|
| Use `aws_iam_role` + instance profile instead of user keys for EC2 | Keys on instances rotate poorly |
| Enable S3 server access logging | Audit trail for data access |
| Tag-based cost allocation (every resource has `Env` tag) | Fine-grained cost reports |
| Use Parameter Store or Secrets Manager for runtime secrets (not env vars) | Secrets in SSM rotate cleanly |

---

## GitHub Actions

### CRITICAL

| Check | Why | Detection |
|---|---|---|
| No secrets logged (`echo $SECRET`) | Secrets in logs = leak | `grep -rn 'echo.*SECRET\|echo.*TOKEN\|echo.*KEY'` |
| Actions pinned to commit SHA or version tag (not `@main`/`@master`) | Unpinned = supply-chain attack | `grep -rn 'uses:.*@main\|uses:.*@master'` |
| No `pull_request_target` on untrusted input without explicit protection | Code injection risk | Presence of `pull_request_target` — review manually |

### WARNING

| Check | Why | Detection |
|---|---|---|
| OIDC used instead of long-lived `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` secrets | Long-lived keys rotate poorly; OIDC = keyless | `grep -rn 'AWS_ACCESS_KEY_ID\|AWS_SECRET_ACCESS_KEY'` |
| `permissions:` block present (least privilege) | Default GITHUB_TOKEN is over-permissioned | Absence of `permissions:` at job or workflow level |
| Environment protection rules set for `production`/`main` environments | Prevent unauthorized deploys to prod | Check if `environment: production` has reviewers configured |
| Workflow timeout set (`timeout-minutes:`) | Hung workflow = wasted minutes | Absence of `timeout-minutes` |
| Secrets not passed as args (use env vars or `${{ secrets.X }}`) | Args appear in process list | `grep -rn -- '--secret\|--token'` in run steps |

### SUGGESTION

| Check | Why |
|---|---|
| Reusable workflows (`.github/workflows/reusable-*.yml`) for shared CI logic | DRY, easier to maintain |
| Workflow files named by purpose (`ci.yml`, `deploy-staging.yml`, `deploy-prod.yml`) | Clarity in Actions UI |
| `concurrency:` group set on deploy workflows | Prevents parallel deploys to same env |
| Dependabot configured for GitHub Actions updates | Keeps action pins current |
