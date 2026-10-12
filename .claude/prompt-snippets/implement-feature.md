# Implement Feature

Implement the user's explicitly requested feature. A bootstrap or documentation-only request does not authorize website source changes; stay within the active request's scope.

## Process

1. Read `AGENTS.md`, the relevant `docs/ai/` guidance, and any supplied specification or plan. Confirm expected behavior and resolve blocking ambiguity before implementation.
2. Trace the affected flow and inspect existing implementations and callers. Reuse existing composables, components, utilities, validation, and tests rather than adding duplicate abstractions.
3. Make the smallest scoped change that meets the acceptance criteria:
   - Keep website functionality in `apps/web/`; the optional `apps/server/` Worker is independent.
   - Preserve Nuxt 4, Vue Composition API, and the current Nuxt Content 2 conventions. Explicitly import components outside the configured Layout/Ui/App auto-import folders.
   - Reuse the app-local UI system and preserve the existing fonts and design tokens; do not redesign unrelated UI.
   - Keep server-only code out of client bundles and validate untrusted inputs at trust boundaries.
   - Do not add a package, backend, database, integration, or task orchestrator without a concrete requirement.
4. For behavioral changes, write or update the smallest meaningful test. Prefer a failing test first when practical, then implement and verify it; do not add test scaffolding unrelated to the feature.
5. Run relevant checks from the repository root (`pnpm test`, `pnpm typecheck`, `pnpm lint`, and/or `pnpm build`) based on changed areas and time. Report exactly which checks ran and their results; never imply an unrun check passed.
6. Do not commit, push, create a branch/PR, deploy, change global harness settings, or alter credentials unless the user explicitly asks.
7. Summarize the behavior implemented, changed files, validation performed, and any remaining questions or limitations.
