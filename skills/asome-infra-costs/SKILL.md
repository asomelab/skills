---
name: asome-infra-costs
description: >
  Explore AWS cost usage for an ASOME project, identify idle or oversized resources, and
  get a prioritized list of cost-reduction recommendations (instance downgrades, Graviton
  swap, Spot for non-prod, storage lifecycle, orphaned resources, etc.).
  Helps configure AWS CLI credentials if not set up.
  Trigger: "costs", "aws costs", "infra costs", "reduce costs", "costos aws",
  "cuánto gastamos", "optimize spend", "aws spending", or when reviewing cloud spend.
license: Apache-2.0
metadata:
  author: asome
  version: "1.0"
---

# ASOME — Infrastructure Costs

Queries AWS Cost Explorer and resource APIs to surface spend by service and flag
idle/oversized resources. Outputs a prioritized recommendations table.

**Read-only. Suggests changes only — apply via `/asome-infra-plan`.**

> **Prerequisites**: `aws` CLI installed. Credentials configured (see Step 0 below).
> Cost Explorer must be enabled in the AWS account (one-time, no extra charge after first use).

---

## Step 0 — verify AWS credentials

```bash
aws sts get-caller-identity
```

If this fails with `Unable to locate credentials` or similar:

### Option A — IAM user keys (simple, not recommended for prod)
```bash
aws configure
# Prompts:
#   AWS Access Key ID:     [paste your key]
#   AWS Secret Access Key: [paste your secret]
#   Default region name:   us-east-1  (or your region)
#   Default output format: json
```

### Option B — AWS SSO (recommended for team accounts)
```bash
aws configure sso
# Follow prompts: SSO start URL, region, account, role
# Then: aws sso login --profile <profile-name>
```

### Option C — named profile (if you have multiple accounts)
```bash
export AWS_PROFILE=my-profile
aws sts get-caller-identity   # retry with this profile
```

> **Never paste credentials into chat, code, or env files committed to git.**
> After configuring, re-run this skill.

---

## Resolve context

```bash
REPO=$(jq -r '.repo' .asome/config.json 2>/dev/null || echo "unknown")
REGION=$(aws configure get region || echo "us-east-1")
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
echo "Account: $ACCOUNT | Region: $REGION | Repo: $REPO"
```

---

## Execution steps

### Step 1 — monthly cost by service (last 3 months)

```bash
LAST_MONTH=$(date -v-1m +%Y-%m-01 2>/dev/null || date -d "1 month ago" +%Y-%m-01)
TODAY=$(date +%Y-%m-%d)

aws ce get-cost-and-usage \
  --time-period Start="$LAST_MONTH",End="$TODAY" \
  --granularity MONTHLY \
  --metrics UnblendedCost \
  --group-by Type=DIMENSION,Key=SERVICE \
  --query 'ResultsByTime[*].Groups[?Metrics.UnblendedCost.Amount>`0.01`].[Keys[0],Metrics.UnblendedCost.Amount]' \
  --output table
```

Sort by descending cost. Print the top 10 services.

> **Note**: Cost Explorer API call costs ~$0.01 per request. Usually negligible.

### Step 2 — flag idle EC2 instances

```bash
aws ec2 describe-instances \
  --query 'Reservations[*].Instances[*].{ID:InstanceId,State:State.Name,Type:InstanceType,Name:Tags[?Key==`Name`]|[0].Value,LaunchTime:LaunchTime}' \
  --output table
```

Flag for review:
- Instances in `stopped` state for > 7 days (incurring EBS cost)
- `t2.*` family → suggest upgrade to `t3` or `t4g` (Graviton)
- Large instances in dev/staging → suggest smaller type or scheduled stop/start

### Step 3 — unattached EBS volumes

```bash
aws ec2 describe-volumes \
  --filters Name=status,Values=available \
  --query 'Volumes[*].{ID:VolumeId,Size:Size,Type:VolumeType,Created:CreateTime,AZ:AvailabilityZone}' \
  --output table
```

Any `available` volume = orphaned (not attached to any instance). Safe to snapshot + delete.

### Step 4 — old snapshots

```bash
aws ec2 describe-snapshots \
  --owner-ids "$ACCOUNT" \
  --query 'Snapshots[?StartTime<=`'$(date -v-90d +%Y-%m-%dT00:00:00 2>/dev/null || date -d "90 days ago" +%Y-%m-%dT00:00:00)'`].{ID:SnapshotId,Size:VolumeSize,Date:StartTime,Desc:Description}' \
  --output table
```

Snapshots older than 90 days with no associated AMI = candidate for deletion.

### Step 5 — idle Elastic IPs

```bash
aws ec2 describe-addresses \
  --query 'Addresses[?AssociationId==null].{IP:PublicIp,AllocationId:AllocationId}' \
  --output table
```

Unassociated EIPs cost ~$3.65/month each. Release any that are not in use.

### Step 6 — NAT Gateway cost

```bash
aws ec2 describe-nat-gateways \
  --filter Name=state,Values=available \
  --query 'NatGateways[*].{ID:NatGatewayId,VPC:VpcId,AZ:SubnetId,State:State}' \
  --output table
```

Each NAT Gateway costs ~$32/month + data transfer. Flag:
- More than one NAT in a non-prod environment (single NAT is enough)
- Any NAT in a non-prod environment where instances could use VPC endpoints instead

### Step 7 — RDS instances

```bash
aws rds describe-db-instances \
  --query 'DBInstances[*].{ID:DBInstanceIdentifier,Class:DBInstanceClass,Engine:Engine,Multi:MultiAZ,Storage:AllocatedStorage,Status:DBInstanceStatus}' \
  --output table
```

Flag:
- `db.t2.*` → upgrade to `db.t3` or `db.t4g` (better perf + same or lower cost)
- Multi-AZ enabled on dev/staging (unnecessary; saves ~50% to disable)
- Large `AllocatedStorage` that may be under-utilized

### Step 8 — S3 storage class opportunities

```bash
aws s3api list-buckets --query 'Buckets[*].Name' --output text | tr '\t' '\n' | while read bucket; do
  echo "Bucket: $bucket"
  aws s3api get-bucket-lifecycle-configuration --bucket "$bucket" 2>/dev/null \
    && echo "  lifecycle: configured" \
    || echo "  [WARNING] no lifecycle policy"
done
```

Buckets without lifecycle rules = objects accumulate at S3 Standard pricing indefinitely.

---

## Cost-reduction patterns

| Pattern | Est. saving | Effort | Best for |
|---|---|---|---|
| Delete unattached EBS volumes | $0.08–0.10/GB/mo | Low | Any env |
| Release idle EIPs | ~$3.65/EIP/mo | Low | Any env |
| Snapshot + delete old snapshots (>90d) | $0.05/GB/mo | Low | Any env |
| gp2 → gp3 EBS migration | up to 20% EBS cost | Low | Any env |
| t2 → t3 instance upgrade | same price, better perf | Low | Any env |
| t3/t4g Graviton swap | up to 40% compute cost | Medium | Any env |
| Disable Multi-AZ on dev/staging RDS | ~50% RDS cost | Medium | Non-prod |
| Downsize oversized dev/staging instances | varies | Medium | Non-prod |
| Schedule EC2/RDS stop at night (18:00–08:00) | up to 65% non-prod compute | Medium | Non-prod |
| Single NAT per non-prod VPC (instead of per-AZ) | ~$32/NAT/mo | Medium | Non-prod |
| S3 lifecycle: Standard → IA after 30d, Glacier after 90d | up to 80% S3 cost on old data | Medium | Logs, archives |
| Spot Instances for non-prod / batch workloads | up to 90% EC2 cost | High | Non-prod, CI |
| Savings Plans (1yr no-upfront) for stable prod | ~30% compute | High | Prod only |
| Reserved Instances (1yr) for steady-state RDS | ~40% RDS cost | High | Prod only |
| VPC Endpoints to avoid NAT data transfer fees | varies by traffic | Medium | Heavy S3/DynamoDB users |

---

## Known gotchas

- `aws ce get-cost-and-usage` requires Cost Explorer enabled (AWS console → Billing → Cost Explorer → Enable). Takes up to 24h for first data.
- `date -v-1m` is macOS syntax; Linux uses `date -d "1 month ago"`. The commands above include both.
- Always respect `AWS_PROFILE` and `AWS_DEFAULT_REGION` env vars if set — they override `aws configure` defaults.
- Never print `AWS_SECRET_ACCESS_KEY` or the output of `aws sts get-caller-identity --query 'Credentials'`.
- Cost data lags ~8 hours; same-day changes won't appear immediately.
- Apply cost reductions via Terraform (edit instance type, lifecycle rule, etc.) and run `/asome-infra-plan` to preview before applying.
