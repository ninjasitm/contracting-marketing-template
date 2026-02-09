# Copilot Instructions — contracting-marketing-template

## Project overview

- **Framework:** Nuxt 4.3 (Vue 3.5)
- **Language:** TypeScript 5.8
- **Styling:** TailwindCSS 3.4 + shadcn-vue
- Entry point: `app.vue` (layer config: `nuxt.config.ts`, app config: `app/nuxt.config.ts`)

## Architecture

- **Nuxt Layer-based architecture** with flat-file CMS
- Root layer for shared components, composables, and configuration
- `app/` directory extends layer with page-specific implementation
- Content managed via `@nuxt/content` (no backend API needed)
- PagesCMS provides admin interface for content editing

## Data flow

- Pages load content via `queryContent()` / `useAsyncData()` composables
- Pinia stores handle client-side state (identity, counters)
- `app.config.ts` provides site-wide configuration (company info, navigation, social links)
- Server routes in `server/api/` handle backend operations (contact form via worker-mailer)

## Key directories

| Directory         | Purpose                                 |
| ----------------- | --------------------------------------- |
| `app/pages/`      | Page routes (file-based routing)        |
| `components/`     | Vue components (auto-imported)          |
| `components/ui/`  | shadcn-vue UI primitives                |
| `components/app/` | App-level reusable components           |
| `composables/`    | Vue composables (auto-imported)         |
| `content/`        | Flat-file CMS content (JSON + Markdown) |
| `stores/`         | Pinia state stores                      |
| `server/api/`     | Nitro API endpoints                     |
| `types/`          | TypeScript type definitions             |
| `lib/`            | Utility library (`cn()` helper)         |

## Workflows (package.json)

- **Dev:** `pnpm run dev` (starts on port 3000)
- **Build:** `pnpm run build`
- **Test:** `pnpm run test`
- **Lint:** `pnpm run lint` (includes `vue-tsc --noEmit`)
- **Preview:** `pnpm run preview` (build + preview)

## Environment variables

| Variable        | Purpose                                 |
| --------------- | --------------------------------------- |
| `NUXT_PUBLIC_*` | Public runtime config exposed to client |
| `NUXT_*`        | Private runtime config (server only)    |

## Other instruction sources

- [AGENTS.md](../AGENTS.md) - AI agent context
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
