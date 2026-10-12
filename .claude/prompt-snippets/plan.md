# Plan Feature Implementation

Create a practical implementation plan for the user's requested feature or requirement. The plan itself does not authorize implementation.

## Process

1. Read `AGENTS.md` and the relevant `docs/ai/` material. Inspect the specific app routes, components, composables, server handlers, content schemas, tests, and package scripts affected by the request. Reuse actual project patterns; do not assume files or conventions that are not present.
2. Restate the goal, scope, and acceptance criteria. Call out ambiguities, dependencies, risks, and security or accessibility considerations. Ask only for decisions that block a sound plan.
3. Design the smallest approach consistent with the current architecture:
   - The website is the Nuxt 4 app in `apps/web/`; the optional `apps/server/` Worker is independent and does not handle website requests.
   - Use Nuxt Content 2 APIs and existing app structure. Reuse the local UI system in `apps/web/components/ui/`; only configured Layout/Ui/App component folders are auto-imported, so feature-folder components need explicit imports.
   - Preserve the existing fonts, design tokens, and app-local workspace boundaries unless the request explicitly changes them.
   - Do not add a backend, dependency, shared package, database, or integration without a concrete requirement.
4. Provide an ordered task list with expected file areas, behavior-level acceptance criteria, and the smallest useful tests/checks. Mark independent tasks only when they truly have no shared files or sequencing dependencies.
5. Present the plan in the response by default. Create a plan file only when the user asks or an established project workflow requires it; use an existing documentation location rather than inventing a new convention.

## Plan format

```markdown
# Plan: <feature>

## Goal and acceptance criteria
...

## Approach and boundaries
...

## Tasks
1. [ ] ...

## Tests and validation
...

## Open questions and risks
...
```

Retain intentional placeholders in reusable examples. Do not make source changes, run deployment, or claim checks as part of planning.
