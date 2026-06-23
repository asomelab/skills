---
name: asome-infra-plan
description: >
  Safe Terraform plan and apply wrapper for ASOME projects. Runs init, validate, fmt-check,
  and plan — summarizes adds/changes/destroys — then requires explicit confirmation before
  applying. Also supports drift detection. Never auto-approves; always plan before apply.
  Trigger: "terraform plan", "apply infra", "infra plan", "deploy infra", "planear infra",
  "terraform apply", "check drift", or any request to preview or apply Terraform changes.
license: Apache-2.0
metadata:
  author: asome
  version: "1.0"
---

# ASOME — Infrastructure Plan & Apply

Runs `terraform plan`, summarizes the diff with destroys called out loudly, and gates
`terraform apply` behind explicit user confirmation.

**Apply changes infrastructure. Always plan and review first.**

> **Prerequisites**: `terraform` and `aws` CLIs installed and authenticated.
> Run `/asome-infra-audit` before applying to validate best practices.
> Terraform state backend must be configured (`backend.tf`).

---

## Usage

```
/asome-infra-plan           → plan only (default, safe to run any time)
/asome-infra-plan apply     → plan then apply (asks for explicit confirmation)
/asome-infra-plan drift     → detect config drift (plan -detailed-exitcode)
/asome-infra-plan destroy   → plan destroy (DESTRUCTIVE — extra confirmation required)
```

---

## Execution steps

### Step 1 — init and validate

```bash
cd infra

terraform init -upgrade
terraform validate
terraform fmt -check -recursive || echo "[WARNING] Some files are not formatted. Run: terraform fmt -recursive"
```

If `terraform validate` fails → stop and print the error. Do not proceed to plan.

### Step 2 — plan

```bash
terraform plan -out=tfplan 2>&1 | tee /tmp/tf-plan-output.txt
```

### Step 3 — summarize the plan

Parse `/tmp/tf-plan-output.txt` and extract the change summary line:

```
Plan: N to add, N to change, N to destroy.
```

Print a structured summary:

```
=== Terraform Plan Summary ===

  ✅ Add:     N resources
  🔄 Change:  N resources
  ❌ Destroy: N resources
```

If **Destroy > 0**, call out each destroyed resource explicitly:

```
⚠️  DESTRUCTIVE CHANGES DETECTED — resources to be destroyed:

  - aws_rds_instance.main        ← DATABASE — data loss if not backed up
  - aws_s3_bucket.uploads        ← STORAGE — objects will be permanently deleted
  - aws_vpc.main                 ← NETWORK — all dependent resources will break
```

Flag stateful resources (RDS, S3, EBS, DynamoDB, ElasticSearch) with extra emphasis.

If plan shows `No changes.` → print "✅ Infrastructure is up to date. Nothing to apply." and stop.

### Step 4 — apply (only if requested)

Do **not** proceed to apply unless the user explicitly passed `apply` or confirms after the plan.

```bash
# Ask for confirmation before apply
echo ""
echo "Do you want to apply these changes? (yes/no)"
# Wait for explicit 'yes' — any other answer aborts
```

If confirmed `yes`:

```bash
terraform apply tfplan
echo "✅ Apply complete."
```

If destroys were flagged:
- Require the user to type `yes, destroy` (extra confirmation phrase).
- Print: `"Before proceeding: confirm you have a backup/snapshot of any stateful resources listed above."`

### Step 5 — drift detection (if `drift` mode)

```bash
terraform plan -detailed-exitcode
# Exit code 0 = no changes (no drift)
# Exit code 1 = error
# Exit code 2 = changes present (drift detected)
```

```
=== Drift Report ===
Exit code: 2

Drift detected — infrastructure state differs from Terraform config.
Run /asome-infra-plan apply to reconcile, or investigate manual changes in the AWS console.
```

### Step 6 — cleanup

```bash
rm -f tfplan /tmp/tf-plan-output.txt
```

Never commit `tfplan` files — they may contain sensitive values from state.

---

## Known gotchas

- Never use `-auto-approve` outside of fully automated CI with environment protection gates.
- `tfplan` binary files should never be committed to git (add to `.gitignore`).
- Terraform state files (`*.tfstate`) must be stored in a remote backend — never commit them.
- `terraform init -upgrade` bumps provider lock file — commit `.terraform.lock.hcl` after upgrade.
- Destroying `aws_rds_instance` with `skip_final_snapshot = true` permanently loses data.
  Always take a manual snapshot before any RDS destroy.
- If plan shows a replacement (`-/+`) for a stateful resource, treat it the same as a destroy.
- Run `/asome-infra-audit` before apply if any `CRITICAL` findings were outstanding.
