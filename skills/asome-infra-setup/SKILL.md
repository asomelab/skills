---
name: asome-infra-setup
description: >
  Bootstrap infrastructure for any ASOME project by cloning canonical architecture patterns
  from github.com/asomelab/infrastructure. Supports multiple architectures (serverless, ecs,
  ec2, static-site, etc.). Copies the chosen architecture's Terraform modules and GitHub
  Actions workflows, replaces placeholders, and runs terraform init.
  Trigger: "setup infra", "bootstrap infrastructure", "init infra", "configurar infra",
  "scaffold terraform", "infra serverless", "infra ecs", or when starting infrastructure
  for a new ASOME project. Accepts optional architecture arg: /asome-infra-setup <arch>.
license: Apache-2.0
metadata:
  author: asome
  version: "1.1"
---

# ASOME — Infrastructure Setup

Clones `asomelab/infrastructure`, lists available architectures, copies the selected one's
Terraform modules and GitHub Actions workflows, replaces placeholders, and runs `terraform init`.

Usage: `/asome-infra-setup [architecture]`
- With arg: `/asome-infra-setup serverless` → directly selects the `serverless` architecture.
- Without arg: lists available architectures and prompts the user to choose.

**Executes directly. Review copied files before committing.**

> **Prerequisites**: `gh`, `terraform`, and `aws` CLIs must be installed and authenticated.
> `.asome/config.json` must exist. If missing, run `/asome-setup` first.

---

## Resolve project context

```bash
REPO=$(jq -r '.repo' .asome/config.json)
PROJECT=$(jq -r '.repo | split("/")[1]' .asome/config.json)
ORG=$(jq -r '.repo | split("/")[0]' .asome/config.json)
```

---

## Execution steps

### Step 1 — clone canonical infra repo

```bash
rm -rf /tmp/asome-infra
gh repo clone asomelab/infrastructure /tmp/asome-infra
echo "Cloned asomelab/infrastructure"
```

### Step 2 — discover available architectures

The canonical repo organizes patterns under an `architectures/` directory (or equivalent
top-level folders). Detect them:

```bash
echo "=== Available architectures ==="
ls /tmp/asome-infra/architectures/ 2>/dev/null \
  || ls /tmp/asome-infra/ | grep -v -E "^(\.git|README|LICENSE|docs)$"
```

If no argument was given, **list architectures** and ask the user which to use.
Example architectures to expect (adapt to what's actually present in the repo):

| Architecture | Description |
|---|---|
| `serverless` | Lambda + API Gateway + DynamoDB (or S3), fully managed |
| `ecs` | ECS Fargate service with ALB, ECR, VPC |
| `ec2` | EC2 instance(s) with ALB, ASG, or standalone |
| `static-site` | S3 + CloudFront + Route53 + ACM |
| `rds` | RDS PostgreSQL/MySQL + security groups, subnet groups |
| `base` | Shared VPC, subnets, IAM roles, S3 backend (use as foundation) |

If the argument matches a known architecture → proceed directly. If unknown → list and ask.

```bash
ARCH="${1:-}"   # architecture passed as argument, empty if none
if [ -z "$ARCH" ]; then
  echo "No architecture specified. Available:"
  ls /tmp/asome-infra/architectures/
  # Prompt user to choose
fi
echo "Using architecture: $ARCH"
ARCH_DIR="/tmp/asome-infra/architectures/$ARCH"
```

### Step 3 — show what will be copied

```bash
echo "=== Terraform modules in $ARCH ==="
ls "$ARCH_DIR/modules/" 2>/dev/null || echo "(no modules subdir — files are at root)"

echo ""
echo "=== GitHub Actions workflows in $ARCH ==="
ls "$ARCH_DIR/.github/workflows/" 2>/dev/null \
  || ls /tmp/asome-infra/.github/workflows/ 2>/dev/null \
  || echo "(no workflows found)"

echo ""
echo "=== Root Terraform configs in $ARCH ==="
ls "$ARCH_DIR/infra/" 2>/dev/null || ls "$ARCH_DIR/"*.tf 2>/dev/null || echo "(none found)"
```

Ask user to confirm before copying (or proceed directly if they passed the arch argument).

### Step 4 — copy selected architecture

```bash
# Copy Terraform config
mkdir -p ./infra
if [ -d "$ARCH_DIR/infra" ]; then
  cp -r "$ARCH_DIR/infra/." ./infra/
elif [ -d "$ARCH_DIR/modules" ]; then
  mkdir -p ./infra/modules
  cp -r "$ARCH_DIR/modules/." ./infra/modules/
else
  cp "$ARCH_DIR/"*.tf ./infra/ 2>/dev/null
fi
echo "Copied Terraform config → ./infra/"

# Copy GitHub Actions workflows (arch-specific first, fallback to repo root)
mkdir -p ./.github/workflows
if [ -d "$ARCH_DIR/.github/workflows" ]; then
  cp -r "$ARCH_DIR/.github/workflows/." ./.github/workflows/
elif [ -d /tmp/asome-infra/.github/workflows ]; then
  cp -r /tmp/asome-infra/.github/workflows/. ./.github/workflows/
fi
echo "Copied workflows → ./.github/workflows/"
```

> **Never copy** `*.tfstate`, `*.tfstate.backup`, `*.tfvars` (may contain secrets).
> Never overwrite existing `infra/` without explicit user confirmation.

### Step 5 — replace placeholders

```bash
# Preview what needs replacing
grep -r "PROJECT_NAME\|ORG_NAME\|PLACEHOLDER\|<project>\|<org>" \
  ./infra/ ./.github/workflows/ 2>/dev/null | head -30

# Replace in all .tf, .yml, .yaml files
find ./infra ./.github/workflows -type f \( -name "*.tf" -o -name "*.yml" -o -name "*.yaml" \) \
  -exec sed -i '' "s/PROJECT_NAME/$PROJECT/g; s/ORG_NAME/$ORG/g" {} \;

echo "Replacements done: ORG_NAME=$ORG, PROJECT_NAME=$PROJECT"
```

### Step 6 — print TODO list

Print a per-architecture checklist the developer must complete:

```
=== TODO: complete before running terraform plan ===

[ ] backend.tf  — set S3 bucket name, key prefix, region for state backend
[ ] variables.tf / terraform.tfvars — fill required vars (add tfvars to .gitignore)
[ ] Confirm AWS region matches your target account
[ ] GitHub secrets required by copied workflows:
    - AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY  OR  configure OIDC (recommended)
    - See /asome-infra-audit for the OIDC setup recommendation
[ ] Run /asome-infra-audit to validate against Terraform, AWS, and GHA best practices
[ ] Run /asome-infra-plan to preview changes before first apply
```

Architecture-specific reminders (print only for the selected arch):
- **serverless**: set Lambda memory/timeout, confirm runtime version, check API GW stage name.
- **ecs**: set ECR repo name, container CPU/memory, desired count, ALB listener port.
- **ec2**: set instance type, key pair name, AMI ID (consider Graviton — see /asome-infra-costs).
- **static-site**: set domain name, hosted zone ID, ACM certificate ARN (must be in us-east-1).
- **rds**: set engine version, instance class, subnet group; never expose port 5432/3306 publicly.
- **base**: deploy `base` before any other architecture — it provides shared VPC, subnets, roles.

### Step 7 — terraform init

```bash
cd infra
terraform fmt
terraform init
echo "terraform init complete."
echo "Next: run /asome-infra-plan to preview, then /asome-infra-audit to validate."
```

---

## Gitignore

Add infra secrets to `.gitignore` (skip if already present):

```bash
grep -q '.terraform/' .gitignore 2>/dev/null || cat >> .gitignore << 'EOF'

# Terraform
**/.terraform/
*.tfstate
*.tfstate.backup
*.tfplan
*.tfvars
!*.tfvars.example
.terraform.lock.hcl
EOF
echo "Added Terraform entries to .gitignore"
```

---

## Known gotchas

- Always `rm -rf /tmp/asome-infra` before re-running — stale clone causes silent diffs.
- `sed -i ''` macOS syntax; Linux: `sed -i` (no trailing `''`). Adjust in CI.
- Don't commit `terraform.tfvars` — it may contain AWS keys or sensitive defaults.
- If `asomelab/infrastructure` is private, ensure `gh auth` has org access before cloning.
- `base` architecture must be applied first — other architectures depend on its VPC outputs.
- After copying, always run `/asome-infra-audit` before `/asome-infra-plan`.
