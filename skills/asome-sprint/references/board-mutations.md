# Board mutation mechanics

> Shared machinery for `plan`, `move` and `resequence` (`../SKILL.md`). Read this once; every
> sub-command that touches the board cites it instead of re-deriving the same payload shapes,
> the same item-map call, or the same pacing rules three different ways.

---

## Field payload table

Verified against a live board during design — this is what `updateProjectV2ItemFieldValue` (and
`updateProjectV2Field` for the Sprint iteration set) actually accepts, not guesswork.

| Field | Payload |
|---|---|
| Status / Priority / Kind / Area | `value:{singleSelectOptionId:"<8-hex>"}` |
| Sprint | `value:{iterationId:"<8-hex>"}` |
| Story Points | `value:{number: 5}` — inline, unquoted. Passing it via `-f` sends it as a String and the mutation 422s |
| Start / Target | `value:{date:"YYYY-MM-DD"}` |
| Title / text fields | `value:{text:"…"}` |
| Milestone / Assignees / Labels | **NOT project fields.** They appear in `item-list` output but are issue-level: `gh issue edit N --repo <repo> --milestone "…" --add-label "…"`. `updateProjectV2ItemFieldValue` against them fails |
| Sprint **iteration set** | **NEVER** call `updateProjectV2Field` with `iterationConfiguration` on a live board — it rewrites the whole set, mints new ids, and silently orphans every existing iteration. See the guard in `SKILL.md` bootstrap Step 3 |

---

## One-call item map

`gh project item-list <num> --owner <org> --format json --limit 500` returns every item with
`content.number`, `id` (the `PVTI_` item id), `sprint.iterationId`, `status`, `"story Points"` and
`milestone.title` in **one call**. Build the `{issue → item}` map from this — never the two-call
per-issue resolution (`gh api repos/.../issues/N --jq .node_id`, then a `projectItems` GraphQL
query), which costs ~2× the API calls for no benefit.

```bash
gh project item-list "$PROJECT_NUM" --owner "$ORG" --format json --limit 500 \
| jq -r '.items[] | [
    .content.number,
    .id,
    (.sprint.iterationId // ""),
    (.status // ""),
    (."story Points" // 0),
    (.milestone.title // "")
  ] | @tsv' > /tmp/item-map.tsv
```

Look up a single issue's item id from the map instead of re-querying per issue:

```bash
ITEM_ID=$(gh project item-list "$PROJECT_NUM" --owner "$ORG" --format json --limit 500 \
  | jq -r --arg n "$ISSUE_NUM" '.items[] | select((.content.number|tostring) == $n) | .id')
```

### jq gotchas

- Read `."story Points"` (lowercase `s`, space, no hyphen) — not `"Story Points"`.
- Read `.status` — not `.Status`.
- **Filter sprints on `.sprint.iterationId`, never `.sprint.title`.** A sprint's display title can
  carry extra text (a hito name) beyond just "Sprint N" — an exact-string title match can
  silently match nothing, and nothing will tell you it matched nothing.

---

## Drift-check query

`resequence` Gate 1 runs this before writing anything, and diffs the response against
`.asome/config.json` — field ids, option ids, iteration ids (including `completedIterations`, so
a closed sprint doesn't look like a live mismatch). Any difference halts the run; there is no
auto-fix.

```graphql
query($project: ID!) {
  node(id: $project) {
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
              completedIterations { id title startDate duration }
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
}
```

```bash
gh api graphql -f query="$(cat drift-check.graphql)" -f project="$PROJECT_ID"
```

---

## Dry-run / apply / verify protocol

### Plan-file row shape

One row per **field change**, not per issue — an issue moving both Sprint and Status is two rows:

| Column | Meaning |
|---|---|
| `row_id` | `sha1(issue + field + destino)[:8]` — stable across runs, makes resume possible |
| `issue` | issue number |
| `item_id` | `PVTI_...`, from the one-call map above |
| `field` | `Sprint` / `Status` / `Story Points` / `Milestone` / … |
| `payload_kind` | which row of the field payload table this mutation uses |
| `from` | current value |
| `to` | target value |
| `milestone_impact` | `earlier` / `same` / `out-of-milestone` — Gate 2 of `resequence`, §11.3 of the canon |
| `reason` | one line: why this row exists |

Rows where `from == to` are dropped before the plan file is written — nothing to do, nothing to
log, nothing to confirm.

### Mutation-response-as-read-back

Verification costs zero extra calls: ask for `fieldValueByName` in the **same** mutation response
instead of issuing a separate read after writing.

```bash
gh api graphql -f query='
mutation($project:ID!, $item:ID!, $field:ID!, $val:Float!) {
  updateProjectV2ItemFieldValue(input:{
    projectId:$project, itemId:$item, fieldId:$field, value:{number:$val}
  }) {
    projectV2Item {
      id
      fieldValueByName(name: "Story Points") {
        ... on ProjectV2ItemFieldNumberValue { number }
      }
    }
  }
}' -f project="$PROJECT_ID" -f item="$ITEM_ID" -f field="$F_SP" -F val="$TARGET_SP"
```

If the value the response echoes back doesn't match `to`, the row is a failure — log it as such.
A `200` is not proof the mutation wrote anything; the echoed field value is.

### Append-only log and resume

```
ts|row_id|issue|field|to|http|verified
2026-09-11T14:03:02Z|a1b2c3d4|66|Sprint|Sprint 3|200|true
```

```bash
grep -q "|$row_id|" "$LOG" && continue   # already done on a previous run — skip
# ...run the mutation, verify from its own response...
printf '%s|%s|%s|%s|%s|%s|%s\n' \
  "$(date -u +%FT%TZ)" "$row_id" "$issue" "$field" "$to" "$http" "$verified" >> "$LOG"
```

A run interrupted by a crash, a rate limit, or a laptop going to sleep resumes from exactly where
it stopped — the log, not the operator's memory of where it stopped, is the source of truth.

---

## Pacing rules

- **~0.7s serial delay** between mutations (~85/min). Never parallel — a burst is what trips the
  secondary rate limit, not the primary 5000/5000 quota.
- Check `x-ratelimit-remaining` periodically. It is rarely the actual constraint here, but it is
  cheap to watch and free to report.
- On a **secondary rate-limit 403**, exponential backoff: 2s, 8s, 32s, max 3 retries, then **stop
  cleanly** and tell the user to resume later. The resumable log (above) is what makes stopping
  safe instead of risky — there is no partial-state cleanup required before resuming.

---

## Rollback

ProjectV2 has no native undo. Rollback = generate the **inverse plan** — swap `from`/`to` on every
row of the original plan, sourced from the snapshot `resequence` Step 1 took before the run — and
execute it through this same engine: same gates, same pacing, same log format.
