# PR template — ASOME

```markdown
> SDD change: `<change-name>`    ← include for Feature/Improvement/Setup; omit for Bug/Chore/Docs

Closes #<N>

## Summary
- <what this PR does — bullet 1>
- <bullet 2>
- <bullet 3 max>

## Changes

| File | Change |
|---|---|
| `<area>/src/<module>/<file>` | <what changed> |
| `<area>/src/<path>/<file>` | <what changed> |

## Test plan

### Automated
- [ ] Tests pass
- [ ] Lint clean
- [ ] Type-check clean

### Manual
- [ ] <specific manual check 1>
- [ ] <specific manual check 2>

### API smoke test (backend changes)
```bash
# Replace with actual endpoint + auth header
curl -H "Authorization: Bearer <token>" \
     http://localhost:<port>/api/<endpoint>
```

## Checklist
- [ ] Issue linked with `Closes #N`
- [ ] Conventional commit format (`type(scope): desc`)
- [ ] Tests written and passing
- [ ] Lint + typecheck clean
- [ ] SDD verify passed (Feature / Improvement / Setup)
- [ ] No `process.env` outside config module (backend)
- [ ] No direct HTTP calls in components — always data-fetching hooks (frontend)
- [ ] UI primitives from shared component library only (frontend)
- [ ] `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>` in commit
```
