---
name: asome-create-issue
description: >
  Create one or many enriched GitHub issues for any ASOME project following ASOME conventions:
  one vertical, demonstrable slice per issue, traced to a problem in the mapa operativo, with
  Priority, Sprint, dates and assignee always set from a load-based recommendation the user
  approves. Detects duplicates, creates the [UX] twin when the slice needs design, and verifies
  every board field after writing it.
  Trigger: "create issue", "new issue", "agregar issue", "crear issue", "asome issue",
  "crear estos issues", "cargar issues", or when the user describes one or more
  tasks/bugs/research items for the current project.
license: Apache-2.0
metadata:
  author: asome
  version: "3.0"
---

# ASOME — Create Issue

Creates fully enriched GitHub issues in the current project AND adds them to the linked GitHub
Project board with every custom field populated (Stage, Priority, Kind, Story Points, Area, Start,
Target, Sprint) plus milestone, labels and assignee.

Two modes, same pipeline:

- **Single** — the user describes one issue.
- **Batch** — the user describes two or more (a list, a pasted HU set, "creá estos 5"). One plan
  table, one approval, created in dependency order.

**Executes directly**, with ONE decision point: the skill **recommends** Sprint, Priority,
assignee and the UX twin from the board's load; the **user decides**. Nothing else is asked.

> **Prerequisite**: `.asome/config.json` must exist. If missing, run `/asome-setup` first.

---

## Pipeline

```
1 Draft → 2 Dedupe → 3 UX twin → 4 Plan (load + recommend) → 5 Ask → 6 Preflight → 7 Create + verify → 8 Summary
```

Steps 1–5 write nothing. Step 6 aborts before anything is created if any id or label is missing.
In batch mode steps 1–4 run for the whole set before the single question in step 5.

---

## Resolve project context

```bash
CFG=.asome/config.json
REPO=$(jq -r '.repo' $CFG)
PROJECT_ID=$(jq -r '.project_id' $CFG)
PROJECT_NUM=$(jq -r '.project_num' $CFG)
ORG=${REPO%%/*}
TODAY=$(date +%F)

# The status field is `Status` on some boards and `Stage` on others — resolve, never hardcode.
STAGE_KEY=$(jq -r '.fields | if has("Status") then "Status" else "Stage" end' $CFG)
F_STAGE=$(jq -r --arg k "$STAGE_KEY" '.fields[$k].id' $CFG)
F_PRIORITY=$(jq -r '.fields.Priority.id' $CFG)
F_KIND=$(jq -r '.fields.Kind.id' $CFG)
F_SP=$(jq -r '.fields."Story Points".id' $CFG)
F_AREA=$(jq -r '.fields.Area.id' $CFG)
F_START=$(jq -r '.fields.Start.id' $CFG)
F_TARGET=$(jq -r '.fields.Target.id' $CFG)
F_SPRINT=$(jq -r '.fields.Sprint.id' $CFG)

# opt FIELD REGEX → option id. ALWAYS by case-insensitive regex: boards disagree on spelling
# ("To Do"/"Todo", "Med"/"Medium"); a literal key returns null and the mutation fails.
opt() { jq -r --arg f "$1" --arg r "$2" \
  '.fields[$f].options | to_entries[] | select(.key | test($r; "i")) | .value' $CFG | head -1; }
```

### Label → board option mapping

Labels and board options are two vocabularies. Map the **label** (the source of truth) to the
board option with these regexes:

| Label | Board field | Regex |
|---|---|---|
| `priority:high` · `priority:med` · `priority:low` | Priority | `^high` · `^med` · `^low` |
| `type:feature` · `type:setup` · `type:improvement` | Kind | `^feat` · `^setup` · `^improv` |
| `type:research` · `type:bug` · `type:docs` | Kind | `research\|spike` · `^bug` · `^doc` |
| `area:fullstack` · `area:ux` · `area:infra` · `area:producto` | Area | `full.?stack` · `^ux\|design` · `^infra` · `^product` |
| (always) | Stage | `^to ?do$` |

If a regex matches no option (e.g. a board whose Area only has `Backend`/`Frontend`), **do not
pick the nearest one** — `Backend` on a fullstack issue is exactly the layer split the slicing
rules forbid. Stop and tell the user to add the option on the board and re-run `/asome-setup`.

---

## Step 1 — Draft

For each issue, decide title, labels, Story Points, lane and body. Read the **Slicing rules** and
**Issue title format** below first.

**Story Points — recommend from hours** (scale from `/asome-sprint` `references/sprint-canon.md`):

| SP | horas | `effort:` |
|---|---|---|
| 1 | 5h | `effort:S` |
| 2 | 10h | `effort:S` |
| 3 | 15h | `effort:M` |
| 5 | 25h | `effort:M` |
| 8 | 40h | `effort:L` |
| 13 | 65h | `effort:XL` — **split the issue**, don't create it at 13 |

Use `.capacity.hours_per_sp` from config instead of 5h when `/asome-sprint close` has measured it.

**SDD gate.** A `type:feature`, `type:improvement` or `type:setup` with SP ≥ 3 requires SDD.
Add to `## Technical notes`:

```markdown
- **SDD obligatorio** — antes de codear: `/opsx:propose <change-name>` (ver `/asome-sdd`).
```

**Dependencies.** If the issue cannot start until another dev issue is done, add `needs:dep` and
this pointer as the **first line of the body** — exact string, other skills grep it:

```markdown
> ⛔ **Depende de:** #N — *título*.
```

Body: use `references/issue-template.md` — the single source for every body structure.

---

## Step 2 — Dedupe

Before planning, search the repo for each draft. Search **all states** — a closed duplicate is
still a duplicate.

```bash
# By ref when there is one (HU-001, D-04…), else by 2-3 distinctive nouns from the title
gh issue list --repo "$REPO" --state all --limit 10 \
  --search '"HU-001" in:title' --json number,title,state,url \
  --jq '.[] | "#\(.number) [\(.state)] \(.title)"'
```

A hit with the same ref, or the same outcome in other words, is a **possible duplicate**. Do not
create silently: it becomes an option in Step 5 — *crear igual · usar el existente · descartar*.
"Usar el existente" means: no new issue; report the URL (and, if fields are empty, offer to
fill them via `/asome-sprint`).

---

## Step 3 — UX twin

A `track:dev` feature needs a `[UX]` twin when it adds a **new screen or surface**, or changes an
existing flow's information architecture. It does **not** need one for: infra or backend-only
work with no new surface, bugs restoring already-designed behavior, docs/research/chores, or UI
that only assembles existing components against a design that already shipped (criteria from
`/asome-setup` Step 7 — keep them in sync).

When a twin is needed:

1. Dedupe it too: search `"[UX] HU-001" in:title`. If it exists, **link to it**, don't create one.
2. Otherwise draft it: title `[UX] <same ref> — <screens>`, labels
   `track:ux,area:ux,type:feature,priority:<same>`, body from the UX template, its own SP (UX lane).
3. The dev issue gets `needs:ux` and this pointer as the **first lines of its body** (exact
   string — `/asome-sprint ux-link` greps it):

```markdown
> ⛔ **Bloqueado por UX:** #N — *[UX] HU-001 — título*.
> El diseño tiene que estar cerrado antes de empezar a implementar esto.
```

The twin is a **recommendation**: offered in Step 5, the user can decline it.

---

## Step 4 — Plan: measure load, recommend

### Load per sprint and lane

The ceiling comes from `/asome-sprint` **plan → Gate 1** (`ceiling_sp()`, capacity constants,
`.capacity` and lane dedication from config). Reuse it — do not reinvent the capacity model.

```bash
# Open sprints (not yet ended)
jq -r --arg t "$TODAY" '.fields.Sprint.iterations[] | select(.end >= $t)
  | "\(.title)\t\(.start)\t\(.end)"' $CFG

# Board snapshot — fetch ONCE per run, reuse for every issue in the batch
ITEMS=$(gh project item-list "$PROJECT_NUM" --owner "$ORG" --format json --limit 1000)

# Committed SP per sprint × lane
jq -r '.items[] | select(.sprint.title != null)
  | [.sprint.title,
     (if ((.labels // []) | index("track:ux")) then "ux" else "dev" end),
     (."story Points" // 0)] | @tsv' <<<"$ITEMS" \
| awk -F'\t' '{sp[$1"\t"$2]+=$3} END {for (k in sp) printf "%s\t%d\n", k, sp[k]}'

# Committed SP per person in a sprint (for the assignee recommendation)
jq -r --arg s "$SPRINT_TITLE" '.items[] | select(.sprint.title == $s)
  | (.assignees // [])[] as $a | [$a, (."story Points" // 0)] | @tsv' <<<"$ITEMS" \
| awk -F'\t' '{sp[$1]+=$2} END {for (p in sp) printf "%s\t%d\n", p, sp[p]}'
```

If no sprint is open, **stop**: tell the user to run `/asome-sprint bootstrap`. No issue is
created without a sprint.

### Recommend

Keep a **running total** per sprint × lane and per person: every issue planned in this run
(twins included) adds its SP before the next one is placed. Without it, a batch of five lands
all five in the same "free" sprint.

Place issues in **dependency order** (twins and `Depende de` targets first):

- **Sprint** — the earliest open sprint where `running + SP ≤ ceiling` for the issue's lane, and:
  - a dev issue with a UX twin goes **at least one sprint after** the twin (design leads by one
    sprint — `/asome-sprint` plan → Gate 2);
  - an issue never lands before an issue it depends on.
  - Exception: `type:bug` + `priority:high` → current sprint even if it overflows; say so.
- **Priority** — `high` if it blocks other issues, is a production bug, or sits on the current
  milestone's critical path; `low` if nice-to-have with no dependents; else `med`.
- **Milestone** — derived from the sprint: a sprint titled `Sprint 4 (M2)` → the repo milestone
  whose title starts with `M2`. If the sprint title has no `(Mx)` or no milestone matches, the
  milestone becomes a question in Step 5 (list from `gh api repos/$REPO/milestones --jq '.[].title'`).
- **Dates** — Start/Target = the sprint's `start` / `end`.
- **Assignee** — candidates from `.team` in config if present, else
  `gh api repos/$REPO/assignees --jq '.[].login'`. Recommend the person in the issue's lane with
  the lowest running SP in that sprint. "Sin asignar" is always a valid choice.

---

## Step 5 — Ask: the user decides

Print the load table first, then ask with `AskUserQuestion` (recommended option first, labelled
"(Recommended)").

### Single mode — one call, up to four questions

```
CARGA · carril dev · issue de 5 SP

  sprint      fechas                 techo   comprometido   + este   estado
  Sprint 3    2026-10-06 → 10-17     20 SP        18 SP      23 SP   ⚠️ +3 sobre el techo
  Sprint 4    2026-10-20 → 10-31     20 SP         9 SP      14 SP   ✓  recomendado
  Sprint 5    2026-11-03 → 11-14     20 SP         0 SP       5 SP   ✓

Prioridad recomendada: med — no bloquea a nadie, no está en el camino crítico de M2.
Responsable recomendado: @ana — 6 SP en Sprint 4 (vs @leo 12 SP).
Gemelo UX: [UX] HU-001 (3 SP) en Sprint 3 → dev en Sprint 4.
```

| # | Question | Options |
|---|---|---|
| 1 | Sprint | one per open sprint, max 4 |
| 2 | Priority | high · med · low |
| 3 | Responsable | recommended person · next least loaded · Sin asignar |
| 4 | Gemelo UX / duplicado / milestone | only the one that applies; omit if none |

If more than one of row 4 applies, use the 4th slot for the duplicate (it can cancel everything)
and ask the remaining one in a follow-up call.

### Batch mode — one plan, one approval

```
PLAN · 6 issues (incl. 1 gemelo UX) · 21 SP

  #  título                                        carril  SP  prio  sprint    resp.   notas
  1  [UX] HU-003 — Alta de contrato: formulario    ux       3  high  Sprint 3  @sofi   gemelo de 2
  2  HU-003 — Alta de contrato                     dev      5  high  Sprint 4  @ana    needs:ux → 1
  3  HU-004 — Listado de contratos con filtros     dev      3  med   Sprint 4  @leo
  4  Bug — Total mal calculado sin pagos           dev      2  high  Sprint 3  @ana    bug high → sprint actual
  5  Spike — Proveedor de firma digital            dev      2  med   Sprint 4  @leo    time-box 10h
  6  HU-005 — Exportar contratos a PDF             dev      5  low   Sprint 5  —       ⚠️ posible duplicado de #212

  CARGA DESPUÉS DEL PLAN
  Sprint 3   dev 20/20 ✓   ux 8/12 ✓
  Sprint 4   dev 19/20 ✓   ux 0/12 ✓
  Sprint 5   dev  5/20 ✓
```

Ask once: **Crear así (Recommended)** · **Ajustar** · **Cancelar**. On "Ajustar" the user types
the changes in free text ("3 a Sprint 5, 6 descartar, 2 prioridad med"); recompute the running
totals, re-print the table, ask again. Flag possible duplicates and overflowing sprints in the
`notas` column — approving the plan registers those decisions.

Either mode: if the chosen sprint overflows its ceiling, the user's choice stands but must be
explicit — never overflow on the default.

---

## Step 6 — Preflight (nothing is created if this fails)

Resolve **every** id for **every** issue first, then check labels exist. Any `null` or missing
label aborts the whole run — a half-created batch is worse than none.

```bash
PRIORITY_OPT=$(opt Priority '^med')            # from the user's choice, via the mapping table
KIND_OPT=$(opt Kind '^feat')
AREA_OPT=$(opt Area 'full.?stack')
STAGE_OPT=$(opt "$STAGE_KEY" '^to ?do$')
SPRINT=$(jq -c --arg s "$SPRINT_TITLE" '.fields.Sprint.iterations[] | select(.title == $s)' $CFG)
SPRINT_ID=$(jq -r '.id' <<<"$SPRINT")
START=${START:-$(jq -r '.start' <<<"$SPRINT")}   # user may override dates
TARGET=${TARGET:-$(jq -r '.end' <<<"$SPRINT")}
SP=5
LABELS="track:dev,area:fullstack,type:feature,priority:med"   # + needs:ux / needs:dep / effort:*

for v in "$PRIORITY_OPT" "$KIND_OPT" "$AREA_OPT" "$STAGE_OPT" "$SPRINT_ID" "$START" "$TARGET"; do
  case "$v" in ""|null) echo "✖ id sin resolver — no se crea nada"; exit 1;; esac
done

# Labels must exist — gh issue create fails on a missing label
EXISTING=$(gh label list --repo "$REPO" --limit 500 --json name --jq '.[].name')
MISSING_LABELS=$(tr , '\n' <<<"$LABELS" | grep -vxF -f <(echo "$EXISTING"))   # bash + zsh
[ -z "$MISSING_LABELS" ] || { echo "✖ faltan labels: $MISSING_LABELS — correr /asome-setup (Step 7)"; exit 1; }
```

---

## Step 7 — Create and verify

Create in the order of Step 4 (twins and dependencies first) so each pointer can carry the real
`#N`. After creating a twin or a dependency, substitute its number into the dependent's body
before creating the dependent.

```bash
# 7.1 — Issue. Assignee only when chosen: NEVER pass --assignee "" (fails silently, no issue).
ARGS=()
[ -n "$ASSIGNEE" ] && ARGS+=(--assignee "$ASSIGNEE")
ISSUE_URL=$(gh issue create --repo "$REPO" \
  --title "<title — see Issue title format>" \
  --body-file "$BODY_FILE" \
  --milestone "$MILESTONE" \
  --label "$LABELS" "${ARGS[@]}") || { echo "✖ gh issue create falló"; exit 1; }
ISSUE_NUM=${ISSUE_URL##*/}
ISSUE_NODE=$(gh api repos/$REPO/issues/$ISSUE_NUM --jq .node_id)

# 7.2 — Add to board
ITEM_ID=$(gh api graphql -f query="
mutation{addProjectV2ItemById(input:{projectId:\"$PROJECT_ID\",contentId:\"$ISSUE_NODE\"}){item{id}}}" \
  --jq '.data.addProjectV2ItemById.item.id')

# 7.3 — Every field in ONE mutation (aliases). Story Points inlined as a number, never a string.
upd() { echo "$1: updateProjectV2ItemFieldValue(input:{projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",fieldId:\"$2\",value:{$3}}){clientMutationId}"; }
gh api graphql --silent -f query="mutation{
  $(upd stage    "$F_STAGE"    "singleSelectOptionId:\"$STAGE_OPT\"")
  $(upd priority "$F_PRIORITY" "singleSelectOptionId:\"$PRIORITY_OPT\"")
  $(upd kind     "$F_KIND"     "singleSelectOptionId:\"$KIND_OPT\"")
  $(upd area     "$F_AREA"     "singleSelectOptionId:\"$AREA_OPT\"")
  $(upd sp       "$F_SP"       "number:$SP")
  $(upd start    "$F_START"    "date:\"$START\"")
  $(upd target   "$F_TARGET"   "date:\"$TARGET\"")
  $(upd sprint   "$F_SPRINT"   "iterationId:\"$SPRINT_ID\"")
}" || echo "✖ mutation de campos falló — reintentar 7.3 (es idempotente)"

# 7.4 — Read back. Trust the board, not the exit code.
GOT=$(gh api graphql -f query="
query{node(id:\"$ITEM_ID\"){... on ProjectV2Item{fieldValues(first:30){nodes{
  ... on ProjectV2ItemFieldSingleSelectValue{v:name   field{... on ProjectV2FieldCommon{name}}}
  ... on ProjectV2ItemFieldNumberValue      {v:number field{... on ProjectV2FieldCommon{name}}}
  ... on ProjectV2ItemFieldDateValue        {v:date   field{... on ProjectV2FieldCommon{name}}}
  ... on ProjectV2ItemFieldIterationValue   {v:title  field{... on ProjectV2FieldCommon{name}}}
}}}}}" --jq '[.data.node.fieldValues.nodes[] | select(.field) | {(.field.name): .v}] | add')
MISSING=$(jq -r --arg s "$STAGE_KEY" \
  '[$s,"Priority","Kind","Area","Story Points","Start","Target","Sprint"] - keys | join(", ")' <<<"$GOT")
[ -z "$MISSING" ] || echo "✖ #$ISSUE_NUM sin: $MISSING — reintentar 7.3"
```

If 7.3 still fails after one retry, **do not delete the issue**: report it as created-but-incomplete
in the summary with the missing fields, and continue with the rest of the batch.

---

## Step 8 — Summary

One table, built from the read-back (7.4), not from what was intended:

```
CREADOS · 5 de 6 (1 descartado: duplicado de #212)

  #     título                                  sprint    prio  SP  resp.   board
  #231  [UX] HU-003 — Alta de contrato          Sprint 3  high   3  @sofi   ✓
  #232  HU-003 — Alta de contrato               Sprint 4  high   5  @ana    ✓  needs:ux → #231 · SDD
  #233  HU-004 — Listado de contratos           Sprint 4  med    3  @leo    ✓  SDD
  #234  Bug — Total mal calculado sin pagos     Sprint 3  high   2  @ana    ✓
  #235  Spike — Proveedor de firma digital      Sprint 4  med    2  @leo    ⚠️ falta Area
```

Mark issues that require SDD so the user knows the next command is `/opsx:propose`, not code.

---

## Slicing rules — read before deciding how many issues

**One issue = one vertical, demonstrable slice.** If closing it doesn't let you show something to
somebody, it isn't an issue: it's a subtask, and it belongs as a checkbox inside another one.

**Never split by layer.** This is the antipattern that matters most:

```
✓  HU-001 — Padrón de soportes: alta, edición, baja y listado con filtros   track:dev
   ## Scope
   ### Datos     ### API     ### Pantalla
   ───────────────────────────────────────────────────────────────────────
   [UX] HU-001 — Padrón de soportes: listado, filtros y ficha               track:ux

✗  HU-001: endpoints de soporte                                        area:backend
   Padrón: listado con filtros                                         area:frontend
```

The reference model is de-wall's: **one dev issue per story, fullstack, with per-layer
subsections inside — plus a `[UX] HU-NN` twin.** Not two sibling issues.

Splitting by layer produces two issues where neither is demonstrable alone, a "Done" that lies,
story points counted twice, and a dependency nobody tracks.

Legitimate exceptions — work with no user-facing surface:

- infra, pipeline, hosting
- a data schema transversal to N features
- a time-boxed spike or research item
- UX work (its own lane, `track:ux`)

### Every feature issue traces to a problem

From the code of ethics: *"Antes de aprobar una funcionalidad preguntamos qué problema del
relevamiento resuelve. Si no hay respuesta, no se construye."*

So `## Context` on a feature issue **must name the problem from the mapa operativo it resolves**.
If you cannot name one, do not create the issue — raise it as an out-of-scope request instead, which
is what *"Solo lo necesario"* requires. In batch mode, drop that row from the plan and say why.

---

## Issue title format

```
<HU or ref, if there is one> — <imperative description of the user-visible outcome>
```

Examples:

- `HU-001 — Padrón de soportes: alta, edición, baja y listado con filtros`
- `[UX] HU-001 — Padrón de soportes: listado, filtros y ficha`
- `Infra — Hosting de frontend: CDN, dominio y certificado`
- `Spike — Proveedor de mapas (D-04)`
- `Bug — Finance summary devuelve margen incorrecto cuando no hay pagos`

**Do not put the milestone or the area in the title.** Both are board fields. A title like
`S3 · Backend — HU-001: …` duplicates two fields and rots the moment the issue slips a sprint —
and `Backend` is exactly the axis the slicing rules forbid.

---

## Labels to apply

Every issue carries **exactly one** label from each of the four required groups.

| Group | Required | Options |
|---|---|---|
| track | yes | `track:dev` · `track:ux` |
| area | yes | `area:fullstack` · `area:ux` · `area:infra` · `area:producto` |
| type | yes | `type:feature` · `type:setup` · `type:research` · `type:bug` · `type:docs` · `type:improvement` |
| priority | yes | `priority:high` · `priority:med` · `priority:low` — matches the board Priority |
| effort | no | `effort:S` · `effort:M` · `effort:L` · `effort:XL` — from the SP table |
| needs | when it applies | `needs:ux` (UX twin) · `needs:dep` (`Depende de:` pointer) · `needs:third-party` · `needs:client` |

---

## Quality checklist (per issue, before Step 6)

- [ ] **Demonstrable on its own** — closing it means something can be shown
- [ ] **No sibling issue holds "the other half"** of the same feature
- [ ] **Not a duplicate** — Step 2 ran, hits resolved by the user
- [ ] For a feature: `## Context` **names the problem from the mapa operativo** it resolves
- [ ] `## Scope` has meaningful subsections — no flat bullet dumps
- [ ] `## Technical notes` has at least one constraint; SDD line when SP ≥ 3 on feature/improvement/setup
- [ ] `## Definition of Done` present
- [ ] Pointers (`Bloqueado por UX:` / `Depende de:`) are the first lines, with real `#N`
- [ ] Dates table at the bottom = Start/Target on the board
- [ ] Priority, Sprint and assignee chosen by the user from the recommendation, not defaulted

---

## Known gotchas

- **NEVER** use `--assignee ""` in `gh issue create` — fails silently (no issue created, no error shown).
- **Story Points MUST be inlined** as `number:5` in the mutation — passing via `-f val=5` sends a
  string and GraphQL rejects it silently.
- `--milestone` expects the exact milestone title string, not the number.
- **Milestone, Priority, Sprint, Start and Target — always.** A sprint far out is a placeholder,
  not a commitment: move it later with `/asome-sprint resequence` instead of leaving it empty.
- **Resolve the status FIELD name too, not just its options.** The field is `Status` on some
  boards (`asomelab/de-wall`) and `Stage` on others; `.fields.Stage.id` on a `Status` board
  returns `null` and the mutation dies with `Could not resolve to a node with the global id of
  'null'`.
- **Every option id by regex (`opt`), never by literal key** — Stage, Priority, Kind and Area alike.
- **A non-zero exit is not the only failure mode.** Always run the read-back (7.4); a field can
  come back empty with exit 0.
- **Don't use GitHub sub-issues for `needs:ux` / `needs:dep`.** The single parent slot belongs to
  the EPIC hierarchy; reparenting drops the issue out of its EPIC. Use the body pointers.
- **Pointer strings are machine-read** (`Bloqueado por UX:`, `Depende de:`) — never reword them.
- `gh project item-list` caps at `--limit`; on boards above 1000 items the load under-counts —
  raise the limit.
- If `.asome/config.json` is missing, run `/asome-setup` first — all field and option ids come from there.
