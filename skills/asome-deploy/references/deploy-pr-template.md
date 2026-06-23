```markdown
## Promotion

**Source**: `<source-branch>`
**Target**: `<target-branch>`

## Commits included

<!-- Paste output of: git log --oneline origin/<target>..<source> -->

## Verification

Before merging, verify in the **source** environment:

- [ ] Smoke test: critical user flows work end-to-end
- [ ] No CRITICAL findings from `/asome-infra-audit` (if infra changed)
- [ ] No CRITICAL findings from `/asome-review` (if code changed)
- [ ] Monitoring / alerts show no anomalies in `<source>` environment
- [ ] Feature flags (if any) are set correctly for `<target>` environment

## Rollback

If issues are found after merge:

- **Quick rollback**: revert this PR on GitHub (`gh pr revert <PR#>`)
- **Infra rollback**: `git revert <commit>` + `/asome-infra-plan apply`
- **Last resort**: restore from previous deploy tag, snapshot, or backup

## Checklist

- [ ] PR title follows format: `deploy: <source> → <target>`
- [ ] Source branch is ahead of target (no divergence)
- [ ] CI passes on source branch
- [ ] At least one reviewer approved (required for `main`)
```
