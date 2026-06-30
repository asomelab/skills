---
name: asome-review
description: >
  Code review for any ASOME project that merges SDD spec/contract verification with
  convention and antipattern review. Checks the diff against the SDD spec/design/tasks
  (when the PR references a change), flags code antipatterns, and checks design-system
  compliance — reuse of shared components and design tokens instead of one-off/duplicated
  UI or raw hex/spacing values.
  Trigger: "review PR", "revisar PR", "revisar código", "code review", "check conventions",
  "está bien el código", "validar PR", "check design system", "check shared components",
  or when a PR/diff needs review before merge.
license: Apache-2.0
metadata:
  author: asome
  version: "2.0"
---

# ASOME — Code Review

Reviews a PR or diff against the SDD contract (when one exists), ASOME conventions,
general code antipatterns, and design-system/shared-component compliance.
Reports **CRITICAL** (blocks merge) / **WARNING** (should fix) / **SUGGESTION** (optional).

This skill is a merge of `/sdd-verify` (does the code satisfy the spec?) and a
traditional code review (is the code itself good, and does it reuse what already exists?).
It does **not** replace `/sdd-verify` as the gating step in the SDD workflow
(see `/asome-sdd` Phase 4) — run this at PR-review time as the second pass, especially
useful when reviewing a PR you didn't write or that may have skipped SDD discipline.

---

## How to run

```bash
# Option A: review a PR by number
REPO=$(jq -r '.repo' .asome/config.json 2>/dev/null || gh repo view --json nameWithOwner -q .nameWithOwner)
gh pr diff <PR_NUMBER> --repo "$REPO"
PR_BODY=$(gh pr view <PR_NUMBER> --repo "$REPO" --json body --jq '.body')

# Option B: review staged/unstaged changes
git diff HEAD

# Option C: review a specific file
cat <path/to/file>
```

Then apply the checks below, in order, to the diff/code.

---

## Step 1 — SDD spec/contract compliance (merged `/sdd-verify` pass)

Look for `> SDD change: \`<name>\`` in `$PR_BODY` (or ask the user for the change name).

- **No SDD change referenced** and the PR clearly implements product logic (Feature/Improvement/Setup-shaped) →
  flag as **CRITICAL**: "No SDD change referenced — spec compliance can't be verified."
- **SDD change referenced** → pull the artifacts and check the diff against them:

```bash
# engram (preferred)
mem_search(query: "sdd/<change-name>/spec", project: "<project>")
mem_search(query: "sdd/<change-name>/design", project: "<project>")
mem_search(query: "sdd/<change-name>/tasks", project: "<project>")
# then mem_get_observation(id) for full content on each hit

# openspec fallback
cat openspec/changes/<change-name>/specs/*/spec.md
cat openspec/changes/<change-name>/design.md
cat openspec/changes/<change-name>/tasks.md
```

### CRITICAL — blocks merge
- [ ] Every requirement/scenario in the spec has corresponding code in the diff — no silently dropped requirements.
- [ ] No code in the diff contradicts an explicit design decision (e.g. design says "use X library", diff uses Y).
- [ ] Every task marked `[x]` in the task list actually has matching code in the diff — no checked-off tasks with no diff.
- [ ] `/sdd-verify` was run and passed (no CRITICAL findings in the verify report) — check `sdd/<change-name>/verify-report`.

### WARNING — should fix
- [ ] Acceptance criteria from the spec are covered by tests in the diff, not just implemented.
- [ ] Scope creep: diff includes changes with no corresponding task — confirm intentional, not drift.

---

## Step 2 — code antipatterns (language-agnostic)

### CRITICAL — blocks merge
- [ ] No swallowed errors (`catch {}` / `catch (e) {}` with no rethrow, log, or handling).
- [ ] No hardcoded secrets, tokens, or credentials anywhere in the diff.
- [ ] No commented-out blocks of dead code left in (vs. a real, justified inline comment).
- [ ] No obvious N+1 query pattern introduced (loop issuing a DB/API call per iteration where a batch call exists).

### WARNING — should fix
- [ ] No god functions/files doing unrelated things — single responsibility per function/module.
- [ ] No magic numbers/strings repeated 3+ times — extract to a named constant.
- [ ] No deep nesting (4+ levels) where an early return/guard clause would flatten it.
- [ ] No duplicated logic that already exists elsewhere in the codebase (grep before judging — see Step 3 for UI-specific duplication).
- [ ] Naming matches existing module/file conventions in the surrounding directory.

### SUGGESTION — optional
- [ ] Function/variable names communicate intent without needing a comment.
- [ ] Complex conditionals could be a named boolean/helper for readability.

---

## Step 3 — shared component & design-system compliance

This is the part most reviews skip. Check whether the diff reinvents something that
already exists, and whether it follows the project's design system instead of one-off values.

```bash
# Locate the shared UI library / component dir
find . -type d \( -iname "ui" -o -iname "components/ui" -o -iname "shared/components" \) -not -path "*/node_modules/*"

# List components the diff introduces
git diff HEAD --name-only | grep -E '\.(tsx|jsx|vue)$'

# Check for a project design-system skill (tokens, component rules) to diff against
ls skills/ 2>/dev/null | grep -E '^design-system-'
```

### CRITICAL — blocks merge
- [ ] No new component duplicates an existing shared primitive (button, input, modal, card, etc.) — grep the shared UI dir by rough shape/purpose before approving a new one.
- [ ] No raw hex colors, arbitrary px spacing, or one-off font sizes where a design token exists for it (check against the project's `design-system-<project>` skill if present — see `skills/design-system-asome-lab/SKILL.md` for the token list pattern).
- [ ] No copy-pasted JSX/markup block that's >80% identical to an existing component instead of reusing/extending it.

### WARNING — should fix
- [ ] New component is missing required states the design system mandates (default, hover, focus-visible, active, disabled, loading, error) when one applies.
- [ ] Accessibility basics present where the design system requires them (focus-visible, keyboard interaction, contrast) — flag if the design-system skill exists and the diff clearly violates one of its "Do/Don't" rules.
- [ ] New component placed in a feature directory when it's generic enough to belong in the shared library (signals it'll get duplicated again later).

### SUGGESTION — optional
- [ ] Spacing/typography values could be expressed via existing scale tokens instead of computed/arbitrary values that happen to match.

If no shared component dir or design-system skill exists for the project, skip Step 3's
design-token checks and note in the output: "No shared component library / design-system
skill detected — skipping design-system compliance check."

---

## Backend checklist (`api/` or equivalent)

These conventions apply to NestJS-based backends. Adapt if the project uses a different framework.

### CRITICAL — blocks merge
- [ ] No `process.env` accessed outside config modules. Every env var goes through the config service.
- [ ] No new route skips auth without an explicit `@Public()` (or equivalent) decorator.
- [ ] `@ApiProperty()` / `@ApiPropertyOptional()` on ALL DTO fields (Swagger compliance).
- [ ] No raw ORM client instantiated inline — use the injected service via DI.
- [ ] New module registered in the app module imports array.

### WARNING — should fix
- [ ] Every controller method has `@ApiOperation()` + at least one `@ApiResponse()`.
- [ ] New DTOs use validation decorators with transforms where needed.
- [ ] New service methods have a corresponding spec/test file co-located with the service.
- [ ] Pagination endpoints use the shared `PaginatedQueryDto` — not custom `page`/`limit` params.
- [ ] Exception filters not re-caught manually — let the global filter handle errors.
- [ ] New schema/model changes have a migration file.

### SUGGESTION — optional
- [ ] User identity accessed via decorator, not manual JWT decode in controllers.
- [ ] Audit-sensitive actions (create/update/delete) go through an audit interceptor.
- [ ] Complex service logic split into sub-services, not monolithic files > 200 lines.

---

## Frontend checklist (`web/` or equivalent)

These conventions apply to React + React Query frontends. Adapt if the project uses a different stack.
Component reuse and design-token compliance are covered in Step 3 above — this list is
data/state-layer specific.

### CRITICAL — blocks merge
- [ ] No direct `axios` or `fetch` calls inside React components — all server state via React Query hooks.
- [ ] No state management store used for server state — store is for client-only state (auth, UI).
- [ ] No hardcoded API URLs — all API calls go through the centralized API client module.
- [ ] No secrets in `.env` committed — `.env` files must be in `.gitignore`.

### WARNING — should fix
- [ ] New routes registered in the router's file-based structure, not manually in a router config.
- [ ] `cn()` (or equivalent) used for className merging — not raw string concatenation.
- [ ] Toast notifications via the project's approved toast library — not `alert()`.
- [ ] New query keys added to the shared `query-keys` file — not defined inline in hooks.
- [ ] Forms use the project's approved schema + form library — not uncontrolled inputs.

### SUGGESTION — optional
- [ ] `useCallback`/`useMemo` only where profiling shows an issue — avoid premature memoization.
- [ ] Loading states handled with skeleton components, not raw spinner divs.
- [ ] Error boundaries wrap new route segments.

---

## Output format

```
### SDD COMPLIANCE
1. [requirement/task] <finding>

### CRITICAL
1. [file:line] <finding>

### WARNING
1. [file:line] <finding>

### SUGGESTION
1. [file:line] <finding>

### PASSED ✅
All SDD, critical, and warning checks passed.
```

Omit the `SDD COMPLIANCE` section entirely if the PR has no associated SDD change (already
flagged as CRITICAL in Step 1 in that case — don't duplicate). If everything is clean,
output `### PASSED ✅` with a one-line summary.
