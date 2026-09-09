---
name: asome-setup
description: >
  Project setup for ASOME skills, and compliance bootstrap for the ASOME Engineering Manual.
  Discovers the GitHub Project and writes `.asome/config.json`; installs OpenSpec, `AGENTS.md`,
  the MCP allowlist, secret scanning and the `docs/` registers; and audits the developer's own
  machine for the harness the manual requires, fixing what is missing.
  Modes: `/asome-setup` (full bootstrap) · `/asome-setup doctor` (audit only, changes nothing).
  Trigger: "setup asome", "init asome", "asome config", "configurar proyecto", "asome doctor",
  "¿cumplo el manual?", "check compliance", "falta algo del manual", or automatically when
  another ASOME skill reports that `.asome/config.json` is missing.
license: Apache-2.0
metadata:
  author: asome
  version: "2.0"
---

# ASOME — Project Setup

Discovers project constants for the current ASOME project and writes `.asome/config.json`.
Run once per project. Re-run when the GitHub Project changes (fields added, sprints added, etc.).

**Executes directly. Safe to re-run — overwrites config.**

---

## Modes

| Invocation | What it does |
| --- | --- |
| `/asome-setup` | Full bootstrap: board config + labels (Steps 1–8) **and** manual compliance (Steps 9–14) |
| `/asome-setup doctor` | **Audits only. Changes nothing.** Reports what is missing and what each gap breaks. Jump straight to Step 14 |
| `/asome-setup board` | Steps 1–8 only — when you just need the board config refreshed |

## What it creates

**Board layer (Steps 1–8)**

1. `.asome/config.json` — read by all other ASOME skills (structure below).
2. **The repo's label set** — `type:*`, `priority:*`, `area:*`, `effort:*`, plus `track:*` and
   `needs:ux` on software projects and `funnel:*` / `formato:*` on content projects. See Step 7.

**Manual compliance layer (Steps 9–14)**

3. `openspec/` + the `/opsx:*` commands — the specification method (§7.6).
4. `AGENTS.md` — single source of agent context, with the MCP allowlist (§7.4, §7.8).
5. `.claude/settings.json` — the MCP `deny` rules that actually enforce that allowlist (§8.9).
6. Secret scanning in two layers: `secretlint` in pre-commit, `gitleaks` in CI (§8.2).
7. `docs/adr/`, `docs/DEBT.md`, `docs/EXCEPTIONS.md`, `docs/RUNBOOK.md` (§4.2, §4.3, §14.3, §12.2).
8. A report of what the **developer's own machine** is missing to satisfy §7.3 and §15.1.

> A repository that passes Steps 1–8 but fails 9–14 is configured for the board and
> unconfigured for the manual. Both halves matter.

`.asome/config.json` structure:

```json
{
  "repo": "<org>/<repo>",
  "project_num": 6,
  "project_id": "PVT_...",
  "fields": {
    "Status": {
      "id": "PVTSSF_...",
      "options": {
        "Backlog": "...", "To Do": "...", "In Progress": "...",
        "In Review": "...", "Blocked": "...", "Done": "...", "Cancelled": "..."
      }
    },
    "Priority": {
      "id": "PVTSSF_...",
      "options": { "Urgent": "...", "High": "...", "Medium": "...", "Low": "...", "No Priority": "..." }
    },
    "Kind": {
      "id": "PVTSSF_...",
      "options": { "Feature": "...", "Setup": "...", "Research": "...", "Bug": "...", "Docs": "...", "Improvement": "..." }
    },
    "Area": {
      "id": "PVTSSF_...",
      "options": { "Infra": "...", "Backend": "...", "Frontend": "...", "Docs": "..." }
    },
    "Story Points": { "id": "PVTF_..." },
    "Start":         { "id": "PVTF_..." },
    "Target":        { "id": "PVTF_..." },
    "Sprint": {
      "id": "PVTIF_...",
      "iterations": [
        { "id": "...", "title": "Sprint 1 (M0)", "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" }
      ]
    }
  }
}
```

---

## Execution steps

### Step 1 — detect repo

```bash
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "Repo: $REPO"
```

### Step 2 — list projects and pick one

```bash
ORG=${REPO%%/*}
gh project list --owner "$ORG" --format json --limit 20
```

Ask the user: "Which project number should ASOME skills use for this repo?" (or auto-detect if only one project exists).

```bash
PROJECT_NUM=<selected number>
```

### Step 3 — get project node ID

```bash
PROJECT_ID=$(gh project view "$PROJECT_NUM" --owner "$ORG" --format json --jq '.id')
echo "Project ID: $PROJECT_ID"
```

### Step 4 — fetch all field IDs and option IDs

```bash
gh api graphql -f query="
{
  node(id: \"$PROJECT_ID\") {
    ... on ProjectV2 {
      fields(first: 30) {
        nodes {
          ... on ProjectV2SingleSelectField {
            id
            name
            options { id name }
          }
          ... on ProjectV2IterationField {
            id
            name
            configuration {
              iterations { id title startDate duration }
            }
          }
          ... on ProjectV2Field {
            id
            name
          }
        }
      }
    }
  }
}"
```

Parse the response to extract:
- The status field ID + all option IDs by name. **Write it under the name the board actually
  uses** — GitHub's default is `Status`, some ASOME boards renamed it to `Stage`. Do not
  normalize it: consumers resolve the key with
  `jq '.fields | if has("Status") then "Status" else "Stage" end'`, and a config whose key
  disagrees with the board is worse than either spelling.
- `Priority` field ID + option IDs
- `Kind` field ID + option IDs
- `Area` field ID + option IDs
- `Story Points` field ID (numeric field, no options)
- `Start` field ID (date field)
- `Target` field ID (date field)
- `Sprint` field ID + all iteration IDs, titles, and dates

### Step 5 — auto-detect deploy branches

Detect branch names for `/asome-deploy` (dev → staging → main promotion skill):

```bash
DEV_BRANCH=$(git branch -r 2>/dev/null | grep -oE 'origin/(dev|development)' | head -1 | sed 's/origin\///')
STG_BRANCH=$(git branch -r 2>/dev/null | grep -oE 'origin/(staging|stg)' | head -1 | sed 's/origin\///')
PROD_BRANCH=$(git branch -r 2>/dev/null | grep -oE 'origin/(main|master)' | head -1 | sed 's/origin\///')

# Fallback defaults if not detected
DEV_BRANCH="${DEV_BRANCH:-dev}"
STG_BRANCH="${STG_BRANCH:-staging}"
PROD_BRANCH="${PROD_BRANCH:-main}"

echo "Deploy branches: dev=$DEV_BRANCH staging=$STG_BRANCH prod=$PROD_BRANCH"
```

### Step 6 — write config

```bash
mkdir -p .asome
cat > .asome/config.json << 'EOF'
{
  "repo": "<REPO>",
  "project_num": <PROJECT_NUM>,
  "project_id": "<PROJECT_ID>",
  "deploy": {
    "dev": "<DEV_BRANCH>",
    "staging": "<STG_BRANCH>",
    "prod": "<PROD_BRANCH>"
  },
  "fields": {
    <...parsed fields...>
  }
}
EOF
echo "Written: .asome/config.json"
```

The `deploy` block is optional but enables `/asome-deploy` to skip auto-detection on every run.
Update manually if you rename environment branches.

### Step 7 — bootstrap repo labels

Labels are the other half of the contract: the Project board carries Stage/Priority/Kind/Area,
and the repo carries labels so issues stay filterable from the issue list and from `gh` without
touching GraphQL. Create them here so every ASOME repo starts with the same set.

`gh label create` fails if the label exists — pipe through `grep -v` so re-running setup is safe.

```bash
R=$(jq -r '.repo' .asome/config.json)
mk(){ gh label create "$1" --repo "$R" --color "$2" --description "$3" 2>&1 | grep -v "already exists" || true; }
```

**Base set — every project:**

```bash
# type — what kind of work
mk "type:feature"     "A2EEEF" "New feature"
mk "type:setup"       "CFD3D7" "Project setup / scaffolding"
mk "type:research"    "D876E3" "Research / spike"
mk "type:bug"         "D73A4A" "Something is broken"
mk "type:docs"        "0075CA" "Documentation"
mk "type:improvement" "BFD4F2" "Improvement on existing work"

# priority
mk "priority:high"    "D93F0B" "High"
mk "priority:med"     "FBCA04" "Medium"
mk "priority:low"     "0E8A16" "Low"

# effort — mirrors Story Points
mk "effort:S"  "EDEDED" "1-2 SP"
mk "effort:M"  "EDEDED" "3-5 SP"
mk "effort:L"  "EDEDED" "8 SP"
mk "effort:XL" "EDEDED" "13 SP"
```

**Area set — pick the one that matches the project type.** Areas must mirror the `Area` field
options of the linked GitHub Project (Step 4), or filtering by label and filtering by board
field give different answers.

> **`area:backend` / `area:frontend` are deliberately gone from the software set.** Splitting the
> area axis by layer is what produces two half-issues per feature, neither demonstrable on its own
> — see the slicing rules in `/asome-create-issue`. The dev-vs-design distinction now lives on the
> `track:*` axis, which is what it was always describing.
>
> On an existing project that already uses them, do **not** delete the labels — relabel gradually
> and let them age out. `mk` is idempotent, so re-running setup never destroys anything.

```bash
# software projects
mk "area:fullstack" "1D76DB" "Product work: one vertical slice, datos + API + pantalla"
mk "area:ux"        "CC317C" "Design lane"
mk "area:infra"     "0052CC" "Infrastructure / Terraform / CI"
mk "area:producto"  "0075CA" "Relevamiento, decisiones, documentacion, spikes"

# track — software projects run two tracks in parallel: design leads, code follows
mk "track:ux"  "CC317C" "UX/UI design track — leads implementation by one sprint"
mk "track:dev" "0052CC" "Development (code) track"
mk "needs:ux"  "C2185B" "Blocked: needs the UX/UI design closed before implementation starts"

# content / marketing projects — mirror the production pipeline
mk "area:idea"        "C5DEF5" "Idea bank and scoring"
mk "area:guion"       "1D76DB" "Script writing"
mk "area:grabacion"   "0E8A16" "Recording"
mk "area:edicion"     "FBCA04" "Editing and subtitles"
mk "area:publicacion" "5319E7" "Publishing"
mk "area:estrategia"  "B60205" "Strategy and framework"
mk "area:metricas"    "006B75" "Metrics tracking"
```

**Content projects only — funnel stage and content type.** Skip these on software repos.

```bash
# funnel — where the piece sits in the funnel. Target mix 70/20/10
mk "funnel:tofu" "0E8A16" "Discovery — stories, strong hooks (70%)"
mk "funnel:mofu" "FBCA04" "Consideration — education, objections (20%)"
mk "funnel:bofu" "D93F0B" "Sales — process, cases, interviews (10%)"

# formato — content type / production format
mk "formato:yapping"       "1D76DB" "One take to camera, no rigid script, 30-60s"
mk "formato:storytelling"  "5319E7" "Word-for-word scripted narrative, 30-90s"
mk "formato:cara-pantalla" "0052CC" "Dual camera face + screen (demo), 45-90s"
mk "formato:talking-head"  "006B75" "Semi-scripted Q&A, 30-45s"
mk "formato:entrevista"    "B60205" "15-30 min interview to atomize into clips"
mk "formato:clip"          "C5DEF5" "Cut from an interview or external appearance, 30-60s"
mk "formato:carrusel"      "BFD4F2" "Image carousel (support format)"
mk "formato:split-screen"  "E99695" "Split-screen comparison, 30-45s"
```

Every issue gets **exactly one** `type:*`, one `priority:*`, and one `area:*`. `effort:*` is
optional. On content projects add exactly one `funnel:*` and at least one `formato:*` — a piece
that will be cut into clips carries both its source format and `formato:clip`.

#### The two-track convention (software projects)

Design and implementation are separate issues, never the same one. The design issue leads the
implementation issue by roughly one sprint.

- `track:ux` — owned by the designer. Its deliverable is a Figma frame plus the decisions
  written down (states, copy, empty/error cases). It ships no code.
- `track:dev` — owned by an engineer. Its deliverable is the merged PR.
- `needs:ux` — goes on the **dev** issue, not the UX one. It means: this cannot start until the
  paired `track:ux` issue is Done.

**Every open `track:ux` issue must have a paired `track:dev` issue** — a design nobody is
scheduled to build is a design that rots. When the pair exists, the dev issue carries `needs:ux`
plus this pointer as the **first lines of its body**, so the block is visible without opening
Figma or the board:

```markdown
> ⛔ **Bloqueado por UX:** #659 — *S5: UX — Planificación: diseñar el flujo sin nombre precargado*.
> El diseño tiene que estar cerrado antes de empezar a implementar esto.
```

That exact `Bloqueado por UX:` string is the machine-readable half of the link — `/asome-sprint
ux-link` greps for it to audit the board, so don't reword it.

**The reverse is not true: most dev issues need no UX at all.** Do not put `needs:ux` on:

- `area:infra` work, and any backend-only change with no new user-facing surface (APIs,
  migrations, cron, CI, Terraform, observability)
- bugs that restore already-designed behavior — the design exists, the code broke
- `type:docs`, `type:research`, and chores
- UI work that only assembles existing components and tokens against a design that already
  shipped

Reserve it for a new screen or surface, a change to an existing flow's information architecture
or copy hierarchy, and anything the client asked for in words rather than in a design.

Do not use GitHub sub-issues to express this dependency. An issue has a single parent and that
slot belongs to the EPIC hierarchy — reparenting a dev issue under its UX issue silently drops
it out of its EPIC.

Verify:

```bash
gh label list --repo "$R" --limit 60 --json name --jq '[.[].name] | sort | join("  ")'
```

---

### Step 8 — commit the config

`.asome/config.json` contains no secrets — only GraphQL node IDs (project/field/option IDs)
and branch names, all of which are project-public. It's the shared contract every ASOME
skill reads, so it's tracked in git rather than gitignored: every teammate (and every
agent run) gets the same config without re-running setup.

```bash
git add .asome/config.json
git status --short .asome/config.json
```

If `.gitignore` already has a stale `.asome/config.json` (or `.asome/`) entry from before
this convention, remove it:

```bash
grep -vE '^\.asome/(config\.json)?$' .gitignore > /tmp/gitignore.tmp 2>/dev/null && mv /tmp/gitignore.tmp .gitignore
```

---

# Manual compliance — Steps 9 to 14

Everything below implements the ASOME Engineering Manual. Each step names the section it
satisfies. **Skip nothing silently:** if a step cannot run, say so and record it in
`docs/DEBT.md` rather than pretending it passed (§0.3).

### Step 9 — OpenSpec (§7.6)

The specification method. Artifacts are versioned Markdown that travel in the same PR as the
code — that is the whole point, so `openspec/` is never gitignored.

```bash
command -v openspec >/dev/null || npm install -g @fission-ai/openspec@latest
openspec init --tools claude,codex,agents --language es
openspec list   # must answer
```

`--tools claude,codex,agents` covers the primary harness (Claude Code) and the secondary one
used for cross-review (Codex), per §7.3 and §7.10. `--language es` matches §0: Spanish body,
structural headings and SHALL/MUST in English.

Profile `core` ships **no** `verify` workflow. `/asome-review` covers that phase — say so in
`AGENTS.md` so nobody goes looking for `/opsx:verify`.

### Step 10 — `AGENTS.md` (§7.4)

Single source of agent context. Template: Appendix A of the manual. Fill from what the
repository actually shows — README, `package.json`, `infra/`, branches.

**Never invent a value.** Contract restrictions, sensitive data and the release authority are
not inferable from code. Mark each gap in place as `<<HUECO M-NN>>` and batch the questions for
the next client touchpoint (§3.2). A plausible invented value becomes a real requirement the
moment someone implements against it.

The harness context file (`CLAUDE.md`) becomes a one-line pointer to `AGENTS.md`. If it already
holds real conventions, **do not migrate them in this PR** — §14.7 says existing projects are
not migrated wholesale. Add the pointer, register the consolidation in `docs/DEBT.md`.

### Step 11 — MCP allowlist (§7.8, §8.9)

Two files, and they are not interchangeable:

- `AGENTS.md` §7 — the readable table with each server's scope. **Documentation.**
- `.claude/settings.json` — the `deny` rules. **The actual control.**

A table alone is not an allowlist: it tells the agent what it may use, it does not stop it using
the rest. P5 — *a permission that depends on the dev remembering is not a permission.*

Enumerate what is reachable before writing anything:

```bash
claude mcp list 2>/dev/null
python3 -c "import json,os;d=json.load(open(os.path.expanduser('~/.claude.json')));print(list((d.get('mcpServers') or {}).keys()))"
```

Deny every server that can **write or send** — mail, messaging, payments, calendars, docs,
ad spend. §8.12 forbids an agent sending external communications, and §8.9 keeps write-capable
servers out of autonomous sessions. Put the rules in the **repository** settings, not the global
one, so the developer's commercial work outside the repo keeps working.

Watch for the sharp case: a server that reaches the client's **production data** — an
integration the product itself uses — must be denied. §8.6 admits no exception.

### Step 12 — secret scanning, two layers (§8.2)

§14.3 lists secret rotation among the five rules that admit **no exception**. A repository with
zero layers is the most common finding.

```bash
pnpm add -Dw secretlint @secretlint/secretlint-rule-preset-recommend   # ask a human first (§4.4)
```

Local layer in `.husky/pre-commit`, **before** lint or typecheck:

```sh
STAGED=$(git diff --cached --name-only --diff-filter=ACM)
if [ -n "$STAGED" ]; then
  echo "$STAGED" | tr '\n' '\0' | xargs -0 pnpm exec secretlint --maskSecrets || {
    echo "✖ posible secreto en los archivos staged. Un secreto que entró se considera comprometido (§8.2)."
    exit 1
  }
fi
```

CI layer with a **different tool** — diversity of detection, not power (§7.10). Use the gitleaks
**binary**, not `gitleaks-action`: the Action requires a paid licence for organizations
(`[org] is an organization. License key is required`). Pin the version (§5.14).

**Verify it, do not assume it.** §15.4 asks for exactly this evidence:

```bash
printf 'const T = "ghp_16C7e42F292c6912E7710c838347Ae178B4a";\n' > .secret-test.ts
git add .secret-test.ts && git commit -m "test"   # MUST fail with exit 1
git restore --staged .secret-test.ts && rm -f .secret-test.ts
```

If the commit succeeds, check `git config core.hooksPath`. On a fresh clone husky is not
installed until `pnpm install` runs — a hook that is present but inactive is worse than none,
because it manufactures false confidence.

### Step 13 — the `docs/` registers (§4.2, §4.3, §12.2, §14.3)

Create them empty rather than not at all: an absent register makes the debt invisible.

| File | Section | Contents |
| --- | --- | --- |
| `docs/adr/` | §4.2 | Decisions expensive to reverse. Template: Appendix C |
| `docs/DEBT.md` | §4.3 | Accepted debt: what, what should have been, why, cost, trigger, who accepted |
| `docs/EXCEPTIONS.md` | §14.3 | Registered rule breaks. Max 90 days, always with mitigation |
| `docs/RUNBOOK.md` | §12.2 | Mandatory for anything in production |
| `.env.example` | §5.9 | Every variable, commented, **no real values** |

`docs/RUNBOOK.md` and `.env.example` need environment knowledge. If it is not available, create
them with the section skeleton and `<<HUECO M-NN>>` markers — never with plausible values.

### Step 14 — doctor: audit the repo and the developer

**This is the whole `/asome-setup doctor` mode.** Read-only. Report, do not fix, until the
developer says go.

**A · The repository**

```bash
echo "config board   : $([ -f .asome/config.json ] && echo ok || echo FALTA)"
echo "openspec       : $([ -d openspec ] && echo ok || echo FALTA)"
echo "AGENTS.md      : $([ -f AGENTS.md ] && echo ok || echo FALTA)"
echo "MCP deny       : $(python3 -c "import json;print(len(json.load(open('.claude/settings.json'))['permissions'].get('deny',[])))" 2>/dev/null || echo FALTA)"
echo "secretlint     : $(grep -q secretlint .husky/pre-commit 2>/dev/null && echo ok || echo FALTA)"
echo "gitleaks CI    : $([ -f .github/workflows/secret-scan.yml ] && echo ok || echo FALTA)"
echo "hooks activos  : $(git config core.hooksPath || echo 'FALTA — correr pnpm install')"
echo "docs/adr       : $([ -d docs/adr ] && echo ok || echo FALTA)"
echo "docs/DEBT.md   : $([ -f docs/DEBT.md ] && echo ok || echo FALTA)"
echo "docs/RUNBOOK   : $([ -f docs/RUNBOOK.md ] && echo ok || echo FALTA)"
echo ".env.example   : $([ -f .env.example ] && echo ok || echo FALTA)"
echo "ramas entorno  : $(git ls-remote --heads origin dev staging main 2>/dev/null | wc -l)/3"
echo "default branch : $(gh repo view --json defaultBranchRef --jq .defaultBranchRef.name)"
```

Two checks that need judgement, not a command:

- **Branch protection.** `gh api repos/{owner}/{repo}/branches/dev/protection`. A `403
  Upgrade to GitHub Pro` on a private repo means §5.1, §9.5 and §10.3 have **no mechanism** —
  two of them are on the no-exception list of §14.3. Do not report this as passing. It is a
  `TARGET` with a date and an owner (§0.3), and the fix is a paid plan, not more discipline.
- **Default branch.** If it is not the development branch, `git clone` leaves people on the
  wrong branch. One click in Settings; it prevents a class of error §5.2 cannot.

**B · The developer's machine** — §7.3 requires eight harness capabilities; §15.1 lists the install order

```bash
echo "node        : $(node --version 2>/dev/null || echo FALTA)"          # ≥ 20.19 for openspec
echo "pnpm        : $(pnpm --version 2>/dev/null || echo FALTA)"
echo "gh          : $(gh auth status >/dev/null 2>&1 && echo autenticado || echo 'FALTA o sin auth')"
echo "openspec    : $(openspec --version 2>/dev/null || echo FALTA)"
echo "harness 1   : $(command -v claude >/dev/null && echo ok || echo FALTA)"
echo "harness 2   : $(command -v codex >/dev/null && echo ok || echo 'FALTA — sin review cruzado (§7.10)')"
echo "skills      : $(ls ~/.agents/skills 2>/dev/null | grep -c '^asome-') asome-* instaladas"
echo "memoria     : engram responde a mem_context"
```

**What each gap actually breaks — say this, not just "missing":**

| Gap | Consequence |
| --- | --- |
| No secondary harness (Codex) | No cross-review. §7.10 is `POLICY` and the agent ends up approving its own code |
| `core.hooksPath` unset | **No hook runs** — not the secret one, not the pre-push guarding the environment branches |
| No `openspec/` | `/opsx:*` does not exist in this repo; SDD has nowhere to write |
| No `AGENTS.md` | Every agent starts without contract restrictions or sensitive zones |
| Empty MCP `deny` | Every connected server is reachable, including any that can send mail or spend money |
| No `.asome/config.json` | §2.4 is `POLICY`: no board skill works here |
| No branch protection | §5.1, §9.5 and §10.3 rest on a local hook that `--no-verify` skips |
| Missing `asome-*` skills | Reinstall: `npx skills add asomelab/skills` |

**Output shape.** Group findings as **CRITICAL** (an unmet `POLICY`), **WARNING** (an unmet
`STANDARD`) and **TARGET** (correct but blocked by something outside the developer's control,
such as the GitHub plan). Then ask before fixing anything.

Never report a rule as satisfied because the file exists. `AGENTS.md` full of `<<HUECO>>`
markers is honest and incomplete; a hook that is present but inactive is a **CRITICAL**, not a
pass.

### Step 15 — how it lands

Everything from Steps 9 to 13 goes in **one PR against the development branch**, never pushed
straight to an environment branch (§5.1). Split the commits by concern (§5.3): OpenSpec, secret
scanning, and documents are three, not one.

The PR body says what was left out and why, and marks each `<<HUECO M-NN>>` that still needs a
client answer.

---

## Verification

After writing, confirm the config is valid:

```bash
# Should print the project title
gh project view $(jq .project_num .asome/config.json) --owner $(jq -r '.repo | split("/")[0]' .asome/config.json)
```

---

## Re-running

Re-run `/asome-setup board` whenever:
- A new sprint is added to the project
- A new field option is added (e.g., new Kind or Area)
- The GitHub Project number changes
- A new team member clones the repo and needs the config locally

Run `/asome-setup doctor` whenever:
- Somebody joins the project, before their first PR (§15.5)
- A repository has been running a while and nobody checked it against the manual
- The quarterly standards review comes round (§14.5)
- A skill fails complaining that something is missing
- After a `gentle-ai sync` or a harness reinstall — those can revert managed config
