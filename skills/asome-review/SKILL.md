---
name: asome-review
description: >
  Code review checklist for any ASOME project against ASOME conventions.
  Trigger: "review PR", "revisar PR", "revisar código", "code review", "check conventions",
  "está bien el código", "validar PR", or when a PR/diff needs review before merge.
license: Apache-2.0
metadata:
  author: asome
  version: "1.1"
---

# ASOME — Code Review

Reviews a PR or diff against ASOME conventions.
Reports **CRITICAL** (blocks merge) / **WARNING** (should fix) / **SUGGESTION** (optional).

---

## How to run

```bash
# Option A: review a PR by number
REPO=$(jq -r '.repo' .asome/config.json 2>/dev/null || gh repo view --json nameWithOwner -q .nameWithOwner)
gh pr diff <PR_NUMBER> --repo "$REPO"

# Option B: review staged/unstaged changes
git diff HEAD

# Option C: review a specific file
cat <path/to/file>
```

Then apply the checklist below to the diff/code.

---

## SDD compliance (for Feature / Improvement / Setup PRs)

### CRITICAL — blocks merge
- [ ] PR description references the SDD change name (`> SDD change: \`<name>\``).
- [ ] `/sdd-verify` was run and passed (no CRITICAL findings in verify report).

---

## Backend checklist (`api/` or equivalent)

These conventions apply to NestJS-based backends. Adapt if the project uses a different framework.

### CRITICAL — blocks merge
- [ ] No `process.env` accessed outside config modules. Every env var goes through the config service.
- [ ] No new route skips auth without an explicit `@Public()` (or equivalent) decorator.
- [ ] `@ApiProperty()` / `@ApiPropertyOptional()` on ALL DTO fields (Swagger compliance).
- [ ] No raw ORM client instantiated inline — use the injected service via DI.
- [ ] New module registered in the app module imports array.
- [ ] No hardcoded secrets, tokens, or credentials anywhere.

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

### CRITICAL — blocks merge
- [ ] No direct `axios` or `fetch` calls inside React components — all server state via React Query hooks.
- [ ] No state management store used for server state — store is for client-only state (auth, UI).
- [ ] UI primitives from the shared component library only — no copy-pasted primitives into feature dirs.
- [ ] No hardcoded API URLs — all API calls go through the centralized API client module.
- [ ] No secrets in `.env` committed — `.env` files must be in `.gitignore`.

### WARNING — should fix
- [ ] New routes registered in the router's file-based structure, not manually in a router config.
- [ ] `cn()` (or equivalent) used for className merging — not raw string concatenation.
- [ ] Icons from the project's approved icon library — not inline SVGs or mixed libraries.
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
### CRITICAL
1. [file:line] <finding>

### WARNING
1. [file:line] <finding>

### SUGGESTION
1. [file:line] <finding>

### PASSED ✅
All critical and warning checks passed.
```

If everything is clean: output `### PASSED ✅` with a one-line summary.
