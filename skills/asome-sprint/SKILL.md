---
name: asome-sprint
description: >
  Own the ASOME project sprint cycle: bootstrap a new project's sprints from the ASOME canon,
  plan a sprint under a capacity ceiling, move issue stages, close a sprint with a retro,
  report velocity per lane, and keep the UX↔dev track pairing honest.
  Trigger: "plan sprint", "sprint report", "move issue", "mover issue", "sprint actual",
  "qué hay en el sprint", "cuántos puntos", "stage del issue", "linkear UX", "auditar UX",
  "qué falta de diseño", "needs ux", "cerrar sprint", "retro", "retrospectiva",
  "capacity", "capacidad del sprint", "cuánto entra", "armar los sprints",
  "plan de sprints", "definition of done", "DoD", or any board management request.
license: Apache-2.0
metadata:
  author: asome
  version: "2.1"
---

# ASOME — Sprint Management

**Seven** sub-commands: **bootstrap**, **plan**, **move**, **close**, **report**, **ux-link**,
**resequence**. Executes directly.

> **Prerequisite**: `.asome/config.json` must exist. If missing, run `/asome-setup` first.

## The canon

**Read `references/sprint-canon.md` before `bootstrap`, before planning sprint 1 or 2 of a new
project, and whenever a capacity or Definition-of-Done question comes up.** It holds the ASOME
method, the shape of a project (S0 → S1..SN → +90 days), the capacity model, the SP↔hours scale,
the three-level DoD and the slicing rules. This skill executes that canon; it does not restate it.

Three things from the canon that change how every sub-command behaves:

- **"Sprint listo" is a URL, not an artifact.** A sprint that deploys nothing cannot satisfy its
  own Definition of Done, and cannot satisfy a contract clause requiring a live demo on an
  accessible environment.
- **Milestone and Sprint mean different things.** Milestone is the commitment to the client and
  does not move; Sprint is the team's commitment. Set Milestone always; set Sprint only for the
  current sprint and the next one.
- **Over-committing costs ASOME money.** The code of ethics makes an unregistered overrun an
  estimation error the company absorbs. The capacity ceiling in `plan` is that rule in code.
- **"El Sprint se mueve solo; el Milestone no se mueve sin papel."** (§11.3) Moving an issue's
  Sprint field inside or to an earlier milestone is internal. Moving it out of a milestone whose
  deliverable names it needs written client conformity before the board changes at all.

---

## Resolve project context

```bash
REPO=$(jq -r '.repo' .asome/config.json)
PROJECT_NUM=$(jq -r '.project_num' .asome/config.json)
PROJECT_ID=$(jq -r '.project_id' .asome/config.json)
ORG=${REPO%%/*}

# The status field is named `Status` on some boards and `Stage` on others —
# resolve the key, never hardcode it. Reading the wrong one returns null and
# the mutation dies with "Could not resolve to a node with the global id of 'null'".
STAGE_KEY=$(jq -r '.fields | if has("Status") then "Status" else "Stage" end' .asome/config.json)
F_STAGE=$(jq -r --arg k "$STAGE_KEY" '.fields[$k].id' .asome/config.json)
F_SPRINT=$(jq -r '.fields.Sprint.id' .asome/config.json)
F_SP=$(jq -r '."fields"."Story Points".id' .asome/config.json)

# Stage option IDs — ALWAYS resolve by regex, never by literal key.
# Boards disagree on the spelling: "To Do" vs "Todo", "In progress" vs "In Progress".
# A literal lookup returns null and the GraphQL mutation then fails silently.
stage_opt() {  # $1 = case-insensitive regex for the option name
  jq -r --arg re "$1" --arg k "$STAGE_KEY" \
    '.fields[$k].options | to_entries[] | select(.key | test($re; "i")) | .value' \
    .asome/config.json | head -1
}

STAGE_BACKLOG=$(stage_opt '^backlog$')
STAGE_TODO=$(stage_opt '^to ?do$')
STAGE_IN_PROGRESS=$(stage_opt '^in ?progress$')
STAGE_IN_REVIEW=$(stage_opt '^in ?review$')
STAGE_BLOCKED=$(stage_opt '^blocked$')
STAGE_DONE=$(stage_opt '^done$')
STAGE_CANCELLED=$(stage_opt '^cancell?ed$')

# Fail loudly instead of writing a null option id
for name in STAGE_TODO STAGE_IN_PROGRESS STAGE_DONE; do
  eval "val=\$$name"
  [ -n "$val" ] && [ "$val" != "null" ] || \
    echo "⚠️  $name no resuelve — revisá las opciones de .fields.$STAGE_KEY en .asome/config.json"
done

# Dependency axes — see references/sprint-canon.md §10.5. Same regex-resolver shape as
# stage_opt(): boards disagree on label spelling and these four may not exist yet on a
# project that hasn't run /asome-setup since the labels were added — warn, don't fail.
dep_axes() {
  for label in "needs:ux" "needs:dep" "needs:third-party" "needs:client"; do
    id=$(gh label list --repo "$REPO" --search "$label" --json name,id \
      --jq --arg l "$label" '.[] | select(.name == $l) | .id' 2>/dev/null)
    if [ -z "$id" ]; then
      echo "⚠️  label '$label' no existe todavía en $REPO — correr /asome-setup para crearla"
    fi
    printf '%s\t%s\n' "$label" "$id"
  done
}
```

Toda mutación de campo del board sigue `references/board-mutations.md` — no inventes el payload,
difiere por tipo de campo, y milestone/assignee/labels no son campos del board.

```bash
# depth0() — flags issues carrying none of the four needs:* labels (references/sprint-canon.md
# §10.3). Feed it a JSON array of issues with a `.labels[]` array (name strings or {name} objects).
depth0() {
  jq '[.[] | select(
        ((.labels // []) | map(.name // .)) as $l
        | ($l - ["needs:ux","needs:dep","needs:third-party","needs:client"]) == $l
      )]'
}
```

**Team and capacity config.** The canon's capacity model needs to know who is on the project and
how each person splits across lanes. `/asome-setup` writes `team` into `.asome/config.json`; the
per-sprint lane dedication is asked for at `bootstrap` and at `plan` time when it is not yet known.

```bash
# Capacity constants — see references/sprint-canon.md §3
HOURS_PER_DAY=8
SPRINT_DAYS=10                 # 2 weeks, Mon-Fri
GROSS_HOURS=$(( HOURS_PER_DAY * SPRINT_DAYS ))   # 80h per person per sprint
FOCUS_DEFAULT=0.65             # sprints 1-2, no history yet
HOURS_PER_SP_DEFAULT=5         # initial calibration; recalibrated by `close`
UX_REACTIVE_RESERVE=0.40       # from sprint 2 on; 0 in sprint 1

# Measured values, if `close` has already written them
FOCUS=$(jq -r '.capacity.focus // empty' .asome/config.json)
HOURS_PER_SP=$(jq -r '.capacity.hours_per_sp // empty' .asome/config.json)
: "${FOCUS:=$FOCUS_DEFAULT}"
: "${HOURS_PER_SP:=$HOURS_PER_SP_DEFAULT}"
```

To look up a sprint iteration ID:
```bash
# By title match (e.g., "Sprint 2")
jq -r '.fields.Sprint.iterations[] | select(.title | test("Sprint 2")) | .id' .asome/config.json

# List all sprints
jq -r '.fields.Sprint.iterations[] | "\(.title): \(.id) (\(.start) – \(.end))"' .asome/config.json
```

---

## Sub-command: bootstrap

**Trigger:** "armar los sprints", "bootstrap sprints", "plan de sprints", "arrancar el proyecto"

Lays out a new project's whole sprint structure from the canon. Run once, right after
`/asome-setup` and the kick-off. **Read `references/sprint-canon.md` first** — this sub-command
executes that document.

### Step 1 — gather the shape (batched, one round of questions)

| Input | Default if not given |
|---|---|
| Number of sprints and start date | from the signed contract |
| Sprint length | 2 weeks |
| Team: who, and each person's lane dedication per sprint | from `.asome/config.json` `team` |
| Milestone name per sprint | the contract's hito names |
| Validation window | N business days, from the contract |

### Step 2 — check the shape against the canon, and say so out loud

Before writing anything, verify the plan satisfies the method. Report every violation — do not
silently fix them, they are usually contractual:

- [ ] **S1 deploys something.** A sprint whose deliverable is only documents cannot satisfy the
      per-sprint DoD ("demo en vivo", "entorno accesible post-demo"). If S1 ships no running
      software, flag it against the contract clause that requires a live demo.
- [ ] **S1 includes the relevamiento** with interviews of the people who execute the processes,
      and closes with **2-4 indicators, each with a baseline value and a target**. Not 8, not
      "to be defined by the client later" — the canon says 2 to 4, with a starting value.
- [ ] **The cloud account and repo are in the client's name**, created at S0, not at handover.
- [ ] **UX leads by one sprint** from S1 onward, and carries a 40% reactive reserve from S2.
- [ ] **The +90-day comparative measurement exists** as a milestone.
- [ ] **Only S1 and S2 carry a Sprint.** Everything later gets a Milestone and Status Backlog.
- [ ] **Lo transversal** (roles/permisos, multi-tenancy, auditoría) está con la segunda entidad,
      no en el sprint comercial ni en el de administración (§10.1).
- [ ] Existe `docs/product/long-lead.md` con los trámites canónicos evaluados uno por uno, cada
      uno con issue abierto lo antes posible y separado del feature que lo consume (§10.2).
- [ ] Hay un issue `type:setup` de plantilla de rebanada vertical en el sprint de la segunda
      entidad (§10.4).
- [ ] Las dependencias están declaradas con los cuatro ejes `needs:*`, no sólo `needs:ux` (§10.5).
- [ ] La lista de recorte está escrita, dividida en contratado-de-menor-valor vs
      fuera-de-contrato (§11.1).
- [ ] SP planificados / techo acumulado ≤ 1.3×. Si no: fecha de decisión, salidas con costo,
      dueño (§11.2).
- [ ] El carril UX entrega patrones + hi-fi de lo complejo + declaración del resto, y el contrato
      admite esa forma (§12).

### Step 3 — create the board structure

> **Guard — run this before touching the Sprint field, no exceptions.**
> `updateProjectV2Field` + `iterationConfiguration` does not append — it **replaces the whole
> iteration set** of the field. On a board that already has live iterations this mints new ids
> and silently orphans every issue's existing `sprint.iterationId`. It has already happened to a
> real board once (see `.asome/config.json` → `fields.Sprint._note` when present). Query the live
> field first and abort if it is not empty:
>
> ```bash
> LIVE_ITERATIONS=$(gh api graphql -f query="
> {node(id:\"$PROJECT_ID\"){... on ProjectV2{
>   field(name:\"Sprint\"){... on ProjectV2IterationField{
>     configuration{iterations{id title startDate}}}}}}}" \
>   --jq '.data.node.field.configuration.iterations | length')
>
> if [ "${LIVE_ITERATIONS:-0}" -gt 0 ]; then
>   echo "✖ El campo Sprint ya tiene $LIVE_ITERATIONS iteración(es) viva(s) en el board."
>   echo "  Esta mutación reescribe el set completo y orfanea los ids ya asignados a issues."
>   echo "  No corras bootstrap Step 3 contra este board. Para agregar sprints a un board vivo:"
>   echo "  hacelo desde la UI del Project (Settings → campo Sprint → + Add iteration) y después"
>   echo "  corré /asome-setup para regenerar .asome/config.json con los ids reales."
>   exit 1
> fi
> ```

```bash
# Sprint iterations (iteration fields are created/extended, not appended one by one) —
# ONLY reaches here when the guard above confirmed the field has zero live iterations.
gh api graphql -f query='
mutation($field:ID!,$start:Date!){
  updateProjectV2Field(input:{
    fieldId:$field,
    iterationConfiguration:{startDate:$start, duration:14, iterations:[
      {title:"Sprint 1", startDate:"2026-09-08"},
      {title:"Sprint 2", startDate:"2026-09-22"}
    ]}
  }){projectV2Field{... on ProjectV2IterationField{id name}}}}' \
  -f field="$F_SPRINT" -f start="2026-09-08"

# One milestone per sprint, named after the contract hito
gh api repos/$REPO/milestones -f title="S1 · <hito>" -f due_on="2026-09-21T23:59:59Z"

# The +90-day comparative measurement — ALWAYS created, at project start
gh api repos/$REPO/milestones \
  -f title="+90d · Medición comparativa de indicadores" \
  -f description="Se vuelven a medir los 2-4 indicadores acordados en S1 y se entrega el informe comparativo al cliente. Condición del método (Manual de identidad, bloque 01)." \
  -f due_on="<fecha de puesta en marcha + 90 días>T23:59:59Z"
```

> The +90-day milestone is not optional and is not a nicety. The Manual de identidad calls the
> measure-baseline → MVP → re-measure sequence *"la condición del método"*. It did not exist on any
> ASOME board before this sub-command.

### Step 4 — write the documents

- `docs/product/11-plan-de-sprints.md` — the plan the client and `/asome-kickoff` both read.
  **`/asome-kickoff` reads this file and, before v2.0, no skill produced it.** Template and
  required contents: `references/sprint-canon.md` §8.
- `docs/product/sprint-01-plan.md` … `sprint-NN-plan.md` — the nine-section per-sprint plan from
  `references/sprint-canon.md` §7.

### Step 5 — seed the capacity block

```bash
# Written now with the canon defaults; `close` overwrites with measured values each sprint
jq '.capacity = {focus: 0.65, hours_per_sp: 5, measured_from: null}' \
  .asome/config.json > /tmp/asome-cfg.$$.json && mv /tmp/asome-cfg.$$.json .asome/config.json
```

---

## Sub-command: plan

**Trigger:** "plan sprint N", "assign issues to sprint", "qué va en el sprint"

Assigns a list of issues to a sprint and sets their Stage to **To Do**.

### Gate 1 — the capacity ceiling (run this BEFORE assigning anything)

Nothing used to stop a sprint from being loaded past what the team can deliver. This is that
check. It is not advisory: an unregistered overrun is an estimation error ASOME absorbs, per the
code of ethics.

Ask for (or read from `.asome/config.json`) each person's lane dedication for this sprint, then:

```bash
# Ceiling per lane — see references/sprint-canon.md §3 for the model
#   horas_netas_persona = 80 × focus
#   techo_SP_carril     = Σ(horas_netas × dedicación al carril) / horas_por_SP
#
# Example: 2 dev + 1 UX, focus 0.65, 5h/SP
#   dev: 2 × 80 × 0.65 / 5 = 20 SP
#   ux : 1 × 80 × 0.65 / 5 = 20 SP, minus 40% reactive reserve = 12 SP plannable

ceiling_sp() {  # $1 = sum of lane dedication in person-units (e.g. 1.5)
  python3 -c "print(round($1 * $GROSS_HOURS * $FOCUS / $HOURS_PER_SP))"
}

# What is already committed to this sprint, by lane
gh project item-list "$PROJECT_NUM" --owner "$ORG" --format json --limit 500 \
| jq -r --arg s "Sprint $N" '
    .items[] | select((.sprint.title // "") == $s)
    | [ (if ((.labels // []) | index("track:ux")) then "ux" else "dev" end),
        (."story Points" // 0) ] | @tsv' \
| awk -F'\t' '{sp[$1]+=$2} END {for (l in sp) printf "%s\t%d\n", l, sp[l]}'
```

Compare committed + proposed against the ceiling and print the breakdown:

```
CAPACITY · Sprint 3 · focus 0.65 · 5h/SP

  carril    techo   comprometido   propuesto   total
  dev        20 SP        14 SP        9 SP     23 SP   ⚠️  +3 sobre el techo
  ux         12 SP         5 SP        4 SP      9 SP   ✓   (+8 SP de reserva reactiva)

⚠️  El carril dev queda 15% sobre el techo.
    Opciones: sacar un issue de 3 SP · sacar trabajo de profundidad 0 del sprint (§10.3) ·
    repuntear · declarar más dedicación al carril.
```

If a lane exceeds its ceiling, **show the breakdown and ask for an explicit confirmation** before
assigning. Do not assign silently. If the user confirms, proceed — the point is that the overrun
is a registered decision, not an accident.

With no measured history (sprints 1-2) use `FOCUS_DEFAULT` and `HOURS_PER_SP_DEFAULT`. From sprint
3 on, `close` will have written measured values into `.asome/config.json`.

### Gate 2 — design lead time: never schedule a dev issue ahead of its design

Before planning, check whether the issue carries `needs:ux`. If it does, its paired `track:ux`
issue must be Done — or land in an **earlier** sprint than this one. Design leads implementation
by roughly one sprint; putting both in the same sprint is how a dev ends up guessing at screens.

```bash
UX_BLOCKED=$(gh issue view $ISSUE_NUM --repo "$REPO" --json labels \
  --jq '[.labels[].name] | index("needs:ux") // empty')

if [ -n "$UX_BLOCKED" ]; then
  # the pointer lives in the first lines of the body — see /asome-setup Step 7
  UX_NUM=$(gh issue view $ISSUE_NUM --repo "$REPO" --json body \
    --jq '.body' | grep -m1 -oE 'Bloqueado por UX:\*\* #[0-9]+' | grep -oE '[0-9]+')
  echo "⚠️  #$ISSUE_NUM está bloqueado por UX #${UX_NUM:-???}"
  gh issue view "$UX_NUM" --repo "$REPO" --json state,title,milestone \
    --jq '"    UX #'"$UX_NUM"' [\(.state)] \(.milestone.title // "sin milestone") — \(.title)"'
fi
```

Report the conflict to the user and let them decide — do not silently skip the issue or
silently plan it anyway.

### Gate 3 — dependency gate: `needs:dep` / `needs:third-party` / `needs:client`

Same shape as Gate 2. Before assigning, check the other three axes from
`references/sprint-canon.md` §10.5 the same way Gate 2 checks `needs:ux` — grep the body for the
matching pointer string, report the blocking issue's state.

```bash
DEP_BLOCKED=$(gh issue view $ISSUE_NUM --repo "$REPO" --json labels \
  --jq '[.labels[].name] | index("needs:dep") // empty')

if [ -n "$DEP_BLOCKED" ]; then
  # the pointer is "⛔ **Depende de:** #N — *título*." — see /asome-setup §10.5, don't reword it
  DEP_NUM=$(gh issue view $ISSUE_NUM --repo "$REPO" --json body \
    --jq '.body' | grep -m1 -oE 'Depende de:\*\* #[0-9]+' | grep -oE '[0-9]+')
  echo "⚠️  #$ISSUE_NUM depende de #${DEP_NUM:-???}"
  gh issue view "$DEP_NUM" --repo "$REPO" --json state,title,milestone \
    --jq '"    dep #'"$DEP_NUM"' [\(.state)] \(.milestone.title // "sin milestone") — \(.title)"'
fi

TP_BLOCKED=$(gh issue view $ISSUE_NUM --repo "$REPO" --json labels \
  --jq '[.labels[].name] | index("needs:third-party") // empty')

if [ -n "$TP_BLOCKED" ]; then
  echo "⚠️  #$ISSUE_NUM espera un tercero — revisar el estado en docs/product/long-lead.md (§10.2)"
fi

CLIENT_BLOCKED=$(gh issue view $ISSUE_NUM --repo "$REPO" --json labels \
  --jq '[.labels[].name] | index("needs:client") // empty')

if [ -n "$CLIENT_BLOCKED" ]; then
  echo "⚠️  #$ISSUE_NUM espera dato/archivo/decisión del cliente — revisar §6 del sprint-plan"
fi
```

Report the conflict to the user and let them decide — do not silently skip the issue or
silently plan it anyway.

### Apply — assign the issue to the sprint

Only after both gates have passed (or the overrun has been explicitly confirmed).

```bash
ISSUE_NUM=5
SPRINT_ITER_ID=$(jq -r '.fields.Sprint.iterations[] | select(.title | test("Sprint 1")) | .id' .asome/config.json)

# Item id — one-call map, see references/board-mutations.md. Replaces the old two-call
# per-issue resolution (gh api repos/.../issues/N --jq .node_id, then a projectItems query),
# which costs ~2x the API calls for no benefit.
ITEM_ID=$(gh project item-list "$PROJECT_NUM" --owner "$ORG" --format json --limit 500 \
  | jq -r --arg n "$ISSUE_NUM" '.items[] | select((.content.number|tostring) == $n) | .id')

# Set Sprint
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{
  projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",
  fieldId:\"$F_SPRINT\",
  value:{iterationId:\"$SPRINT_ITER_ID\"}}){projectV2Item{id}}}"

# Set Stage → To Do
gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{
  projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",
  fieldId:\"$F_STAGE\",
  value:{singleSelectOptionId:\"$STAGE_TODO\"}}){projectV2Item{id}}}"

echo "Issue #$ISSUE_NUM → Sprint + To Do"
```

---

## Sub-command: move

**Trigger:** "move issue N to In Progress", "mover al #N a Done", "marcar como bloqueado"

Moves a single issue to a new Stage on the board.

Stage lookup — use the `stage_opt` helper from "Resolve project context" above; it resolves
both the field name (`Status` vs `Stage`) and the option spelling:
```bash
STAGE_OPT=$(stage_opt '^in ?progress$')
```

```bash
ISSUE_NUM=3
TARGET_STAGE_ID=$(stage_opt '^in ?progress$')

# Item id — one-call map, see references/board-mutations.md (replaces the old two-call
# per-issue resolution).
ITEM_ID=$(gh project item-list "$PROJECT_NUM" --owner "$ORG" --format json --limit 500 \
  | jq -r --arg n "$ISSUE_NUM" '.items[] | select((.content.number|tostring) == $n) | .id')

gh api graphql -f query="mutation{updateProjectV2ItemFieldValue(input:{
  projectId:\"$PROJECT_ID\",itemId:\"$ITEM_ID\",
  fieldId:\"$F_STAGE\",
  value:{singleSelectOptionId:\"$TARGET_STAGE_ID\"}}){projectV2Item{id}}}"

echo "Issue #$ISSUE_NUM Stage → <target>"

# Also update status label if applicable
gh issue edit $ISSUE_NUM --repo "$REPO" --add-label "status:in-review"   # for In Review
gh issue edit $ISSUE_NUM --repo "$REPO" --remove-label "status:blocked"  # cleanup
```

### Closing the loop: a `track:ux` issue reaching Done unblocks its dev issue

When the issue being moved to **Done** carries `track:ux`, strip `needs:ux` from every dev issue
that points at it. Otherwise the board keeps claiming a block that no longer exists.

```bash
IS_UX=$(gh issue view $ISSUE_NUM --repo "$REPO" --json labels \
  --jq '[.labels[].name] | index("track:ux") // empty')

if [ -n "$IS_UX" ]; then
  gh issue list --repo "$REPO" --label "needs:ux" --state open --limit 100 \
    --json number,body \
    --jq ".[] | select(.body | test(\"Bloqueado por UX:\\\\*\\\\* #$ISSUE_NUM\\\\b\")) | .number" \
  | while read -r dep; do
      gh issue edit "$dep" --repo "$REPO" --remove-label "needs:ux"
      gh issue comment "$dep" --repo "$REPO" \
        --body "🎨 El diseño (#$ISSUE_NUM) está cerrado. Se saca \`needs:ux\` — este issue queda listo para tomar."
      echo "#$dep desbloqueado"
    done
fi
```

Leave the `> ⛔ **Bloqueado por UX:** #N` line in the body — once the design is Done it stops
being a blocker and becomes the link to the design, which is exactly what the implementer wants.

---

## Sub-command: ux-link

**Trigger:** "linkear UX", "auditar UX", "qué falta de diseño", "ux link", "needs ux",
"qué issues dependen de diseño"

Audits the UX↔dev pairing across the board and repairs it. Two invariants, from
`/asome-setup` Step 7:

1. **Every open `track:ux` issue has a paired `track:dev` issue.** A design nobody is
   scheduled to build is a design that rots.
2. **Every dev issue that depends on a design carries `needs:ux`** plus the pointer line
   `> ⛔ **Bloqueado por UX:** #N` as the first lines of its body.

The second invariant is one-directional. **Most dev issues need no UX and must not be
labelled** — see the exclusion list in `/asome-setup` Step 7. `area:backend` / `area:infra`
work with no new surface, bugs that restore already-designed behaviour, docs, research, and
UI that only assembles shipped components are all fine without design.

### Step 1 — collect both tracks

```bash
REPO=$(jq -r '.repo' .asome/config.json)

gh issue list --repo "$REPO" --label "track:ux" --state open --limit 200 \
  --json number,title,milestone,body \
  --jq '.[] | "UX\t#\(.number)\t\(.milestone.title // "-")\t\(.title)"'

gh issue list --repo "$REPO" --state open --limit 400 \
  --json number,title,milestone,labels,body \
  --jq '.[] | select([.labels[].name] | index("track:ux") | not)
            | "DEV\t#\(.number)\t\(.milestone.title // "-")\t\([.labels[].name]|join(","))\t\(.title)"'
```

### Step 2 — match pairs, then **confirm with the user before writing**

Matching is a heuristic, not a lookup. In priority order:

1. An existing `Bloqueado por UX:` pointer in the dev body — already linked, nothing to do.
2. A shared story token in both titles (`HU-24`, `RN-12`, `DW-031`). Highest-confidence signal.
3. Same feature noun and same milestone family (`S6: UX — Bandeja…` ↔ `S6: Fullstack — Bandeja…`).
4. A cross-reference inside either body ("coordinar con la issue de dev hermana", "pareja de #N").

Present the proposed pairs as a table — dev, UX, both milestones — and get an explicit yes
before editing anything. A wrong pointer is worse than no pointer: it sends the implementer
to someone else's design.

Scope the run when the user asks for it (a milestone, a sprint, a label). Do not quietly widen
to the whole backlog.

### Step 3 — apply

Read the body over the API and prepend, rather than passing it back through `gh issue edit
--body` by hand — bodies contain backticks, `$`, and multi-line code fences that the shell
will happily mangle.

```bash
apply_ux_block() {  # $1 = dev issue, $2 = ux issue
  dev="$1"; ux="$2"
  uxtitle=$(gh issue view "$ux" --repo "$REPO" --json title --jq '.title')
  body=$(gh api "repos/$REPO/issues/$dev" --jq '.body // ""')

  if printf '%s' "$body" | grep -q 'Bloqueado por UX'; then
    echo "#$dev ya tiene el aviso"
  else
    { printf '> ⛔ **Bloqueado por UX:** #%s — *%s*.\n> El diseño tiene que estar cerrado antes de empezar a implementar esto.\n\n' "$ux" "$uxtitle"
      printf '%s' "$body"; } | jq -Rs '{body: .}' > "$TMP_BODY"
    gh api -X PATCH "repos/$REPO/issues/$dev" --input "$TMP_BODY" --jq '.number' > /dev/null
    echo "#$dev → aviso a #$ux"
  fi

  gh issue edit "$dev" --repo "$REPO" --add-label "needs:ux"
}
```

> **zsh gotcha.** `for p in $PAIRS` over a space-separated string does *not* word-split in zsh
> the way it does in bash — the whole string arrives as one word and `${p##*:}` silently yields
> the **last** pair's UX number for the **first** pair's dev issue. Iterate a here-doc with
> `while read -r dev ux` instead, which behaves the same in both shells.

```bash
while read -r dev ux; do
  [ -z "$dev" ] && continue
  apply_ux_block "$dev" "$ux"
done <<'PAIRS'
658 659
665 664
PAIRS
```

### Step 4 — audit design lead time

Two issues being paired is not the same as the design arriving in time to be validated. The canon
wants the `track:ux` issue closed in sprint **N-1** relative to the `track:dev` issue that consumes
it, so the client gets a full window to validate the design before it is built.

Report every pair that violates it. **This reports; it does not block** — `plan` will still let the
work through. The point is that the erosion is visible instead of silent.

```bash
# For each pair, compare the sprint of the UX issue against the sprint of its dev twin
gh project item-list "$PROJECT_NUM" --owner "$ORG" --format json --limit 500 \
| python3 - <<'EOF'
import sys, json, re
data = json.load(sys.stdin)
by_num, sprint_of = {}, {}
for it in data.get("items", []):
    n = (it.get("content") or {}).get("number")
    if n is None: continue
    by_num[n] = it
    sprint_of[n] = (it.get("sprint") or {}).get("title")

def idx(t):  # "Sprint 3" -> 3
    m = re.search(r"(\d+)", t or "");  return int(m.group(1)) if m else None

for n, it in by_num.items():
    if "track:dev" not in (it.get("labels") or []): continue
    m = re.search(r"Bloqueado por UX:\*\* #(\d+)", (it.get("content") or {}).get("body") or "")
    if not m: continue
    ux = int(m.group(1))
    d, u = idx(sprint_of.get(n)), idx(sprint_of.get(ux))
    if d is None or u is None: continue
    if u >= d:
        gap = "mismo sprint" if u == d else f"UX va {u-d} sprint(s) DETRÁS"
        print(f"⚠️  dev #{n} (S{d})  ux #{ux} (S{u})  — {gap}")
EOF
```

Expected output when the canon is respected: nothing. Anything printed is a design the client will
not have validated before the code that depends on it starts.

### Step 5 — report the gaps you did not fix

Close with the two lists the user actually has to act on:

- **UX issues with no dev counterpart** — needs a `track:dev` issue created (`/asome-create-issue`).
- **Dev issues that look UI-facing with no design at all** — needs a `track:ux` issue for the
  designer. Name them and say why; do not create them unprompted.

---

## Sub-command: resequence

**Trigger:** "resecuenciar", "reordenar los sprints", "rebalancear el board", "el sprint N está
reventado", "mover trabajo de sprint"

Re-sequences a batch of issues across Sprint/Status/Milestone against the capacity ceiling and the
contract. Two modes:

| Mode | What it does |
|---|---|
| `--suggest` | Read-only. Sorts by dependency depth (§10.3), reports the proposed plan. Writes nothing. |
| `--apply` | Dry-run → confirmation → verified, resumable execution against the live board. |

All the field-mutation mechanics below — payload shapes, the one-call item map, the drift query,
the dry-run/apply/verify protocol, pacing — live in `references/board-mutations.md`. This
sub-command is the driver; read that file once and cite it, don't re-derive it here.

### Gate 1 — drift

Before anything else, re-query the live project's fields (the drift-check query is in
`references/board-mutations.md`) and diff it against `.asome/config.json`: field ids, option ids,
iteration ids. **Any mismatch halts the run** — tell the user to re-run `/asome-setup` and stop.
No auto-fix: auto-fixing would hide that the board changed under someone, which is exactly how
this board drifted twice already.

### Gate 2 — contrato (§11.3)

Classify every proposed move:

| Clase | Cuándo |
|---|---|
| Earlier | El issue se mueve a un hito anterior al que tiene hoy |
| Same-milestone | El issue se queda dentro del mismo hito, sólo cambia el Sprint |
| Out-of-milestone | El issue sale del hito que hoy lo tiene, y ese hito tiene un entregable contractual que lo nombra |

For every **Out-of-milestone** row, print the milestone's contractual deliverable text right next
to it and **halt** until the user states in so many words that written client conformity exists
for that row, or drops the row from the plan. Nothing in this class writes to the board on an
assumption.

### Gate 3 — nada se cancela

Assert the plan contains:
- **Zero** `Status → Cancelled` rows.
- **Zero** rows touching an item whose *current* status is `Done` or `Cancelled` — moving a Done
  item's sprint corrupts the velocity that `report` reads.

Work that leaves scope goes to **Backlog + `scope:cut-1`**, never to Cancelled — visible on the
board, not erased from it.

### Step 1 — snapshot the board

The only rollback source ProjectV2 has — it has no native undo:

```bash
gh project item-list "$PROJECT_NUM" --owner "$ORG" --format json --limit 500 \
  > /tmp/resequence-items-$(date +%Y%m%d%H%M%S).json

gh api "repos/$REPO/issues?state=all" --paginate \
  > /tmp/resequence-issues-$(date +%Y%m%d%H%M%S).json
```

### Step 2 — build the map and the plan file

From the single `item-list` call, build `{issue → item id, iterationId, status, story Points,
milestone}` in one pass — see `references/board-mutations.md` for the exact `jq`. Generate a plan
file with **one row per field change, not per issue**: an issue moving both Sprint and Status is
two rows. Drop rows where `from == to`. Give each row a stable `row_id = sha1(issue+field+destino)
[:8]` so a resumed run can tell what it already did.

### Step 3 — dry-run and confirmation

Print, then ask for confirmation:

1. A before/after **SP-per-sprint table against the ceiling** (same shape as `plan`'s Gate 1
   breakdown).
2. A **mutation-type summary** — `N Sprint changes · N Status · N Story Points · …` — with the
   Gate-2-flagged rows called out **separately**, not folded into the totals.

**One confirmation for the whole run**, plus a **second, separate confirmation** that covers only
the Gate-2-flagged block. Two different questions get two different yeses.

### Step 4 — execute

Serial, paced — see the pacing/backoff rules in `references/board-mutations.md`. Verify each
mutation from its own GraphQL response (`fieldValueByName` requested in the same round-trip — no
extra read-back call). Log every attempt append-only, so the run is resumable:
`grep -q "$row_id" "$LOG" || { run it; log it; }`.

### Step 5 — final verification

One more full `item-list`, diffed against the plan. Report any residual mismatch — should be
zero, since every row already verified itself from its own mutation response in Step 4.

---

## Sub-command: report

**Trigger:** "sprint report", "reporte del sprint", "velocity", "cuántos puntos hicimos", "qué está bloqueado"

Fetches the board state and reports **per lane**, not as one number. A single blended velocity
hides the thing that matters most: whether UX is the constraint, or idle, or drifting behind dev.

> **Key names.** `gh project item-list --format json` returns `status` (lowercase), `story Points`
> (lowercase `s`, space, no hyphen), `content.number`, `sprint.title` and `labels` as an array of
> strings. Reading `Stage` or `Story Points` returns nothing and silently sums 0 — that was the
> bug in this script through v1.2.

```bash
SPRINT_TITLE="Sprint 3"

gh project item-list "$PROJECT_NUM" --owner "$ORG" --format json --limit 500 \
| SPRINT="$SPRINT_TITLE" python3 - <<'EOF'
import sys, json, os, re
from collections import defaultdict

data   = json.load(sys.stdin)
sprint = os.environ["SPRINT"]

lanes  = defaultdict(lambda: defaultdict(lambda: {"n": 0, "sp": 0.0}))
blocked, reactive, upfront = [], 0, 0

for it in data.get("items", []):
    if (it.get("sprint") or {}).get("title") != sprint:
        continue
    labels = it.get("labels") or []
    lane   = "ux" if "track:ux" in labels else "dev"
    status = it.get("status") or "—"
    sp     = it.get("story Points") or 0
    num    = (it.get("content") or {}).get("number", "?")
    title  = it.get("title", "?")

    lanes[lane][status]["n"]  += 1
    lanes[lane][status]["sp"] += sp

    if status == "Blocked":
        blocked.append(f"#{num} {title}")
    if lane == "ux":
        # upfront = design written before the feature exists ("[UX] HU-07: ...")
        # reactive = adjustment born from a demo or review ("S3: UX - aplicar los cambios...")
        if re.match(r"\s*\[UX\]\s*HU-", title, re.I):
            upfront += 1
        else:
            reactive += 1

print(f"# Sprint Report — {sprint}\n")
for lane in ("dev", "ux"):
    if lane not in lanes: continue
    done  = lanes[lane]["Done"]["sp"]
    total = sum(v["sp"] for v in lanes[lane].values())
    print(f"## carril {lane} — {done:.0f} / {total:.0f} SP cerrados")
    for st, v in sorted(lanes[lane].items()):
        print(f"   {st:<14} {v['n']:>3} items  {v['sp']:>5.0f} SP")
    print()

if upfront or reactive:
    tot = upfront + reactive
    print(f"## carril ux — reactivo vs upfront\n"
          f"   upfront   {upfront:>3} ({upfront*100//tot}%)\n"
          f"   reactivo  {reactive:>3} ({reactive*100//tot}%)   "
          f"referencia de-wall: 56% reactivo\n")

if blocked:
    print("## Blockers")
    for b in blocked: print(f"  - {b}")
EOF
```

### Design lead time — the number that makes the dual-track visible

For every `track:dev` issue, measure the gap between its paired `track:ux` issue closing and its
own. The canon wants that gap to be about one sprint. Report the real distribution:

```bash
# Pairs come from the "Bloqueado por UX: #N" pointer in the dev issue body
gh issue list --repo "$REPO" --label "track:dev" --state closed --limit 200 \
  --json number,body,closedAt \
| jq -r '.[] | select(.body != null)
    | . as $d | ($d.body | capture("Bloqueado por UX:\\*\\* #(?<ux>[0-9]+)") // empty)
    | "\($d.number)\t\(.ux)\t\($d.closedAt)"' \
| while IFS=$'\t' read -r dev ux devclosed; do
    uxclosed=$(gh issue view "$ux" --repo "$REPO" --json closedAt --jq '.closedAt // empty')
    [ -n "$uxclosed" ] && python3 -c "
import sys,datetime as d
a=d.datetime.fromisoformat('$uxclosed'.replace('Z','+00:00'))
b=d.datetime.fromisoformat('$devclosed'.replace('Z','+00:00'))
print(f'#$dev  lead {(b-a).days:>4}d  (ux #$ux)')"
  done
```

A lead of 2-6 days means the design track is nominally ahead but functionally simultaneous —
that was exactly de-wall's pattern, and it cost a discarded design (`#94`, replaced by `#259`
after the client changed direction in the Sprint Review). See `references/sprint-canon.md` §4.

The report output is markdown — paste it into Slack, Notion or the standup.

---

## Sub-command: close

**Trigger:** "cerrar sprint", "close sprint", "retro", "retrospectiva", "cerrar el sprint N"

Closes a sprint properly: rollover, measurement, recalibration, and the retro artifact. Run it on
demo day, after the demo.

### Step 1 — rollover

List everything in the sprint that is not Done or Cancelled. For each, the canon requires a
written justification and a re-estimate before it moves to the next sprint — an item that rolls
over silently is how a backlog rots.

```bash
gh project item-list "$PROJECT_NUM" --owner "$ORG" --format json --limit 500 \
| jq -r --arg s "Sprint $N" '
    .items[] | select((.sprint.title // "") == $s)
    | select((.status // "") | IN("Done","Cancelled") | not)
    | "#\(.content.number)\t\(.status)\t\(."story Points" // 0)SP\t\(.title)"'
```

### Step 2 — measure and recalibrate

Ask for the hours actually worked in the sprint (the per-sprint DoD requires them to be
registered anyway), then write the measured values back so the next `plan` uses real numbers
instead of the canon defaults:

```bash
DONE_SP=<SP cerrados>          # from `report`
REAL_HOURS=<horas registradas> # from the team
GROSS=<personas × 80>

NEW_FOCUS=$(python3 -c "print(round($REAL_HOURS/$GROSS, 2))")
NEW_HPSP=$(python3 -c "print(round($REAL_HOURS/$DONE_SP, 1))")

jq --argjson f "$NEW_FOCUS" --argjson h "$NEW_HPSP" --arg s "Sprint $N" \
   '.capacity = {focus: $f, hours_per_sp: $h, measured_from: $s}' \
   .asome/config.json > .asome/config.json.tmp && mv .asome/config.json.tmp .asome/config.json
```

From sprint 3 on, use a rolling average of the last three sprints rather than the last one alone,
so a single spike does not reset the ceiling.

### Step 3 — the retro artifact

The per-sprint DoD requires a retrospective with **at least one improvement action, identified and
assigned**. In de-wall that criterion is mandated by both the DoD and the team charter and **not a
single retro artifact exists in the repository** — the process was documented and never executed.
A DoD criterion that produces no artifact cannot be verified, so this step writes the file.

Write `docs/product/retros/sprint-NN-retro.md`:

```markdown
# Retro — Sprint N

Fecha · participantes · velocity por carril (dev / ux) · focus y horas por SP medidos

## Qué funcionó
## Qué no
## Qué cambiamos            <- al menos UNA acción, con responsable y sprint objetivo
## Estado de las acciones del sprint anterior
```

The last section is what makes retros compound: an action nobody checks next sprint is a wish.

### Step 4 — verify the sprint DoD

Walk the Nivel 2 checklist below and report which criteria are unmet. Do not mark the sprint
closed while any of them is open — say which, and let the team decide.

---

## Definition of Done

`asome-sprint` owns the DoD. Before v2.0 there were three disconnected definitions that never
cited each other: the per-issue checklist in `asome-create-issue`, the B06b matrix in
`asome-kickoff/references/deck-canon.md`, and `de-wall/dewall-docs/team/definition-of-done.md`.

**The canonical three-level DoD lives in `references/sprint-canon.md` §5.** `/asome-kickoff` B06b
presents it to the client; `/asome-create-issue` embeds the Nivel 1 checklist in each issue body;
`close` verifies Nivel 2; the milestone review verifies Nivel 3.

Summary of what each level gates:

| Nivel | Gate | Verificado por |
|---|---|---|
| 1 · por historia | funcional · código · deploy · documentación | review del PR + `/asome-review` |
| 2 · por sprint | completitud · calidad técnica · **demo y validación** · **retro y horas** | `/asome-sprint close` |
| 3 · por hito | QA cross-device · accesos entregados · validación escrita · deploy a producción | revisión del milestone |

Two Nivel 2 criteria are the ones that actually slip, so check them explicitly:

- **Demo en vivo con entorno accesible.** Not a static deliverable, not a slide deck. If the
  sprint deployed nothing, this criterion cannot be met and the sprint is not Done.
- **Retro completada con una acción asignada**, and the sprint's hours registered.

A "declared" screen (`references/sprint-canon.md` §12) counts as designed for the Nivel 2 gate
**only if** its pattern is already built in code — otherwise it is a promise, not a design.

> Changes to the DoD require agreement in a retrospective and are versioned with date and owner.
