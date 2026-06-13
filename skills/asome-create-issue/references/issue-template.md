# Issue template — ASOME Portal

## Feature / Setup / Improvement

```markdown
<1-2 sentence description of what this issue is about>

**Requirements**
- requirement 1
- requirement 2
- requirement 3

**Ref:** `reviste/api/src/<path>` ← backend reference (omit if N/A)

**Definition of Done**
- [ ] Feature implemented and working locally
- [ ] Tests written (Jest for api / Vitest for web)
- [ ] Linting passes (`npm run lint`)
- [ ] Type-check passes (`tsc --noEmit`)
- [ ] PR opened, reviewed, merged to `main`
- [ ] Issue closed, Stage → Done on board
```

## Research / Spike

```markdown
<1-2 sentence description of the question being explored>

**Scope**
- [ ] deliverable / question 1
- [ ] deliverable / question 2

**Output**
Decision documented as comment on this issue (or in CLAUDE.md / ARCHITECTURE.md).
Chosen approach added to relevant package.json / config before closing.

**Time-box**: <N> hours max
```

## Bug Report

```markdown
**Steps to reproduce**
1. step 1
2. step 2
3. step 3

**Expected behavior**
<what should happen>

**Actual behavior**
<what happens instead>

**Relevant logs / errors**
\`\`\`
paste error here
\`\`\`

**Environment**
- Node: `node --version`
- Branch: `git branch --show-current`
- DB migrations: up to date? (yes/no)
```

## Docs

```markdown
<What needs to be documented and why>

**Deliverables**
- [ ] doc section 1
- [ ] doc section 2

**Files to update**
- `docs/ARCHITECTURE.md`
- `CLAUDE.md`
- `api/.env.example`
```
