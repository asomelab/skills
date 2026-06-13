---
name: asome-review
description: >
  Code review checklist for asomelab/asome-portal against CLAUDE.md conventions.
  Trigger: "review PR", "revisar PR", "revisar código", "code review", "check conventions",
  "está bien el código", "validar PR", or when a PR/diff needs review before merge.
license: Apache-2.0
metadata:
  author: asome
  version: "1.0"
  project: asomelab/asome-portal
---

# ASOME — Code Review

Reviews a PR or diff against the conventions in `CLAUDE.md` of `asome-portal`.
Reports **CRITICAL** (blocks merge) / **WARNING** (should fix) / **SUGGESTION** (optional).

---

## How to run

```bash
# Option A: review a PR by number
gh pr diff <PR_NUMBER> --repo asomelab/asome-portal

# Option B: review staged/unstaged changes
git diff HEAD

# Option C: review a specific file
cat api/src/<module>/<file>.ts
```

Then apply the checklist below to whatever diff/code is provided.

---

## Backend checklist (`api/`)

### CRITICAL — blocks merge
- [ ] No `process.env` accessed outside `src/config/` files. Every env var goes through `registerAs` config modules.
- [ ] No new route skips auth without explicit `@Public()` decorator.
- [ ] `@ApiProperty()` / `@ApiPropertyOptional()` on ALL DTO fields (Swagger compliance).
- [ ] No raw Prisma import — must use `PrismaService` injected via NestJS DI, not `new PrismaClient()`.
- [ ] New module added to `AppModule` imports array (otherwise NestJS silently ignores it).
- [ ] No hardcoded secrets, tokens, or credentials anywhere.

### WARNING — should fix
- [ ] Every controller method has `@ApiOperation()` + at least one `@ApiResponse()`.
- [ ] New DTOs use `class-validator` decorators (`@IsString()`, `@IsEmail()`, etc.) with `@Transform()` where needed.
- [ ] New service methods have a corresponding `*.spec.ts` test (co-located with the service file).
- [ ] Pagination endpoints use `PaginatedQueryDto` from `src/common/dto/` — not custom `page`/`limit` params.
- [ ] Exception filters not re-caught manually — let `PrismaExceptionFilter` + `HttpExceptionFilter` handle errors.
- [ ] New Prisma model field changes have a migration file in `prisma/migrations/`.

### SUGGESTION — optional
- [ ] `@CurrentUser()` used instead of manually decoding JWT in controllers.
- [ ] Audit-sensitive actions (create/update/delete) go through `AuditLoggingInterceptor` via decorator.
- [ ] Complex service logic split into sub-services, not monolithic service files > 200 lines.

---

## Frontend checklist (`web/`)

### CRITICAL — blocks merge
- [ ] No direct `axios` or `fetch` calls inside React components — all server state goes through React Query hooks.
- [ ] No Zustand store used for server state — Zustand is for client-only state (auth token, UI state).
- [ ] shadcn/ui primitives live in `src/components/ui/` only — no shadcn components copy-pasted into feature dirs.
- [ ] No hardcoded API URLs — all API calls go through the centralized `api-client.ts` (which reads `VITE_API_URL`).
- [ ] No secrets in `.env` committed — `.env` files must be in `.gitignore`.

### WARNING — should fix
- [ ] New routes registered in TanStack Router file-based structure (`src/routes/`), not manually in a router config.
- [ ] `cn()` used for className merging — not raw string concatenation.
- [ ] Icons from `lucide-react` — not inline SVGs or other icon libraries.
- [ ] Toasts via `sonner` (`toast.success()`, `toast.error()`) — not `alert()` or custom toast.
- [ ] New `queryKeys` added to `src/lib/query-keys.ts` — not defined inline in the hook.
- [ ] Forms use zod schema + TanStack Form — not uncontrolled inputs.

### SUGGESTION — optional
- [ ] `useCallback`/`useMemo` only where profiling shows an issue — avoid premature memoization.
- [ ] Loading states handled with shadcn `Skeleton` component, not a spinner div.
- [ ] Error boundaries wrap new route segments.

---

## Output format

Report findings as:

```
### CRITICAL
1. [file:line] No @ApiProperty on `CreateClientDto.email` — required for Swagger and ValidationPipe

### WARNING
1. [file:line] Missing test for `ClientsService.findAll()` — add `clients.service.spec.ts`

### SUGGESTION
1. [file:line] Consider splitting `ClientsService` (280 lines) into `ClientsService` + `ProposalsService`

### PASSED ✅
All critical and warning checks passed.
```

If everything is clean: output `### PASSED ✅` with a one-line summary.
