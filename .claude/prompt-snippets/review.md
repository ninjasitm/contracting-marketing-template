# Code Review

Review the requested code, feature, or change for correctness, regressions, security, and adherence to this repository's architecture. Do not modify files unless the user separately requests fixes.

## Process

1. Read `AGENTS.md` and relevant `docs/ai/` guidance. Determine the review scope from the supplied paths, request, and (when reviewing a change) the actual diff; do not infer changes from conversation summaries alone.
2. Inspect affected callers, related tests, and surrounding code. For a diff, identify its base/head scope when available and distinguish pre-existing issues from introduced findings.
3. Check the applicable concerns:
   - Functional behavior, edge cases, error handling, and regressions.
   - Input validation, sensitive data exposure, and server/client separation.
   - Nuxt 4 / Vue Composition API usage, Content 2 query conventions, and configured component auto-import boundaries.
   - Reuse of existing helpers and the local UI system; unintended changes to fonts, tokens, workspace boundaries, or optional Worker separation.
   - Tests for relevant behavior and documentation updates where needed.
4. Report only actionable findings, ordered by severity. Include file and line references and explain the concrete failure mode. If no findings are found, say so and mention material validation gaps; do not manufacture issues to fill a template.

## Report format

```markdown
## Findings
- [Critical/High/Medium/Low] `path:line` — issue and impact.

## Validation gaps
- Checks or context not available, if material.

## Summary
No findings / brief assessment.
```

Do not claim a runtime or test check was performed unless it was actually run.
