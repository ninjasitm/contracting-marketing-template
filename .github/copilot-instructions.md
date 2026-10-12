# Copilot Instructions — contracting-marketing-template

## Project overview

- **Framework:** Nuxt 4.3 (Vue 3.5)
- **Language:** TypeScript 5.8
- **Styling:** TailwindCSS 3.4 + shadcn-vue
- **Workspace:** private root `@nitm/contracting-marketing-template`; website app `@nitm/web`
- Website package: `@nitm/web` in `apps/web/` (Nuxt config: `apps/web/nuxt.config.ts`, site config: `apps/web/app.config.ts`)

## Architecture

- **pnpm workspace** with a leading Nuxt 4 website app and an optional independent Cloudflare Worker example
- Private root package scripts forward to `@nitm/web`; workspaces are `apps/*` and `packages/*`
- Pages, components, local UI design system, content, public assets, and Nitro API belong to `apps/web/`
- `apps/server/` is an optional health-only `@nitm/server` Worker, not the website backend or a dependency of root website scripts
- Content is file-managed through PagesCMS and `@nuxt/content` 2.13 (Content 2 APIs); the contact API is a Nitro route in the web app
- PagesCMS provides admin interface for content editing

## Data flow

- Pages in `apps/web/app/pages/` load content via `queryContent()` / `useAsyncData()` composables
- Pinia stores handle client-side state (identity, counters)
- `apps/web/app.config.ts` provides site-wide configuration (company info, navigation, social links)
- `apps/web/server/api/` hosts the Nitro contact route (email via worker-mailer); keep it separate from the optional `apps/server/` Worker example

## Key directories

Nuxt globally scans only `apps/web/components/layouts/` (`Layout` prefix), `apps/web/components/ui/` (`Ui` prefix), and `apps/web/components/app/` (`App` prefix). Explicitly import components from other feature folders.

| Directory         | Purpose                                 |
| ----------------- | --------------------------------------- |
| `apps/web/app/pages/`      | Page routes (file-based routing)        |
| `apps/web/components/`     | Vue components; only configured folders are auto-imported |
| `apps/web/components/ui/`  | Existing local UI design system         |
| `apps/web/components/app/` | App-level reusable components           |
| `apps/web/composables/`    | Vue composables (auto-imported)         |
| `apps/web/content/`        | Flat-file CMS content (JSON + Markdown) |
| `apps/web/app/stores/` and `apps/web/stores/` | Existing Pinia stores                  |
| `apps/web/server/api/`     | Nitro API endpoints                     |
| `apps/web/types/`          | TypeScript type definitions             |
| `apps/web/lib/`            | Utility library (`cn()` helper)          |
| `packages/*`               | Real shared packages only, when needed  |

## Workflows (package.json)

- Use root scripts as the workspace entry points; website tasks such as dev/build/generate/preview forward to `@nitm/web`.
- **Dev:** `pnpm dev` (port 3000)
- **Build:** `pnpm build`
- **Test:** `pnpm test`
- **Lint:** `pnpm lint` (ESLint)
- **Type check:** `pnpm typecheck`
- **Preview:** `pnpm preview` (build + preview)
- **Optional Worker:** `pnpm --filter @nitm/server dev` or `pnpm --filter @nitm/server typecheck`; Worker tests: `pnpm test -- test/server-example/worker.test.ts`

## Environment variables

| Variable        | Purpose                                 |
| --------------- | --------------------------------------- |
| `NUXT_PUBLIC_*` | Public runtime config exposed to client |
| `NUXT_*`        | Private runtime config (server only)    |

## Other instruction sources

- [AGENTS.md](../AGENTS.md) - AI agent context
- [`.nitm/BOOTSTRAP.md`](../.nitm/BOOTSTRAP.md) - Toolkit bootstrap handoff and scope
- [README.md](../README.md) - Project documentation
- [.cursor/rules/](../.cursor/rules/) - Cursor IDE rules

## Skills References

For detailed standards on specific topics, refer to these skills:

| Topic             | Skill Location                                    | Description                                                  |
| ----------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| **Logging**       | `.agents/skills/logging/SKILL.md`                 | Structured logging standards, log levels, message formatting |
| **Documentation** | `.agents/skills/project-documentation/SKILL.md`   | README standards, code comments, ADRs, changelogs            |
| **Writing Plans** | `.agents/skills/writing-plans/SKILL.md`           | Feature planning and specification                           |
| **Code Review**   | `.agents/skills/requesting-code-review/SKILL.md`  | Code review process and checklists                           |
| **Debugging**     | `.agents/skills/systematic-debugging/SKILL.md`    | Systematic debugging workflows                               |
| **TDD**           | `.agents/skills/test-driven-development/SKILL.md` | Test-driven development practices                            |
