# PR template — ASOME Portal

```markdown
Closes #<N>

## Summary
- <what this PR does — bullet 1>
- <bullet 2>
- <bullet 3 max>

## Changes

| File | Change |
|---|---|
| `api/src/<module>/<file>` | <what changed> |
| `web/src/<path>/<file>` | <what changed> |

## Test plan

### Automated
- [ ] `cd api && npm test` — Jest passes
- [ ] `cd web && npm test` — Vitest passes
- [ ] `npm run lint` passes in api/ and web/
- [ ] `tsc --noEmit` passes in api/ and web/

### Manual
- [ ] <specific manual check 1>
- [ ] <specific manual check 2>

### API smoke test (backend changes)
```bash
# Replace with actual endpoint
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/<endpoint>
```

## Checklist
- [ ] Issue linked with `Closes #N`
- [ ] Conventional commit format (`type(scope): desc`)
- [ ] Tests written (Jest / Vitest)
- [ ] Lint + typecheck clean
- [ ] `@ApiProperty` on all new/modified DTOs
- [ ] No `process.env` outside `src/config/` (api)
- [ ] `TransformInterceptor` envelope respected (no raw returns)
- [ ] Auth: new routes use `@Public()` if unauthenticated, else `@Roles()` if restricted
- [ ] shadcn components in `src/components/ui/` only (web)
- [ ] Data via React Query hooks — no direct axios in components (web)
- [ ] `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>` in commit
```
