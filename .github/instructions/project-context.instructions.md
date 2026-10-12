---
applyTo: '**/*'
description: 'Contracting marketing template workspace architecture and data flow.'
---

# Project Architecture

- **Workspace:** private pnpm root with `apps/*` and `packages/*` workspaces.
- **Website:** leading app `apps/web` (`@nitm/web`), Nuxt 4, Vue 3, TypeScript, TailwindCSS.
- **Optional Worker:** independent health-only Cloudflare Worker at `apps/server` (`@nitm/server`); it is not the website backend.
- **Root commands:** use workspace scripts; they forward website tasks to `@nitm/web`.
- **Shared packages:** add only when code is genuinely shared. The existing UI system stays in `apps/web/components/ui/`.
- Keep the existing website contact API in Nuxt at `apps/web/server/api/`. Do not add another backend or task orchestrator without an explicit requirement.

## Directory Structure

- `apps/web/app/pages/` - Website routes.
- `apps/web/app/stores/` and `apps/web/stores/` - Existing Pinia stores; preserve their locations unless Nuxt scanning is verified.
- `apps/web/components/ui/` - Existing local design system.
- `apps/web/components/` - Website and feature components.
- `apps/web/server/api/` - Nitro API routes, including contact submission.
- `apps/server/` - Optional independent Worker example; explicit commands use `pnpm --filter @nitm/server ...`.
- `apps/web/content/` - PagesCMS-managed JSON and Markdown.
- `apps/web/public/` - Static files and CMS media.
- `apps/web/nuxt.config.ts` and `apps/web/app.config.ts` - Website configuration.
- `packages/*` - Real shared packages only, if needed.

## Data Flow

- Pages use Nuxt Content queries to render files from `apps/web/content/`.
- PagesCMS edits content/media through the root `.pages.yml` configuration; changes are committed through Git.
- Contact submissions use Nitro within `apps/web`. The optional `apps/server` health example is independent and is not used for website requests.

## Context Sources

- [`AGENTS.md`](../../AGENTS.md) - Project conventions and workflows.
- [`docs/ai/codebase-structure.md`](../../docs/ai/codebase-structure.md) - Current workspace structure.
- [`docs/ai/architecture.md`](../../docs/ai/architecture.md) - Data flow and system architecture.
