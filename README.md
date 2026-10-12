# Contracting Marketing Template

A private pnpm-workspace repository for a contracting-company marketing website template. The website is a Nuxt 4 app in `apps/web`; clone and customize this repository for a new project rather than installing it as a publishable Nuxt layer or shared component package.

## Requirements

- Node.js (use a current LTS release)
- pnpm 8.5.1 (the version pinned by the root `package.json`)

## Get started

```sh
git clone https://github.com/ninjasitm/contracting-marketing-template.git
cd contracting-marketing-template
pnpm install
pnpm dev
```

The website development and preview servers use port 3002 by default. Nuxt can fall back to another available port if 3002 is occupied; check the startup output for the URL. Root `pnpm build`, `pnpm generate`, and `pnpm preview` still target `@nitm/web`; `pnpm lint` and `pnpm test` run from the workspace root, while `pnpm typecheck` checks the app and root test typing. These commands remain non-Turbo, and `pnpm lint` checks without modifying files.

### Development commands

```sh
# Native Turbo TUI: website only (3002)
pnpm dev

# Opt in to all workspace dev tasks: website + independent Worker (8787)
pnpm dev:all

# Streaming logs instead of the TUI, including non-TTY environments
pnpm dev --ui=stream

# Direct app commands without Turbo; website-only port override
pnpm --filter @nitm/web dev --port 3010
pnpm --filter @nitm/server dev
```

In the TUI, use ↑/↓ to select task logs, `m` for key help, and `i` to interact with a task. Ctrl+Z returns to task selection; Ctrl+C from there stops the started tasks. Arguments after `--` are forwarded to every selected task, so use the direct website command above rather than a shared port override on `dev:all`.

Dev tasks are persistent and uncached, with the existing shell environment passed through. Remote caching is disabled. The optional Worker remains independent of website requests and builds; no build, test, lint, typecheck, prepare, postinstall or deployment command is routed through Turbo.

## AI guidance for template users

The repository keeps shared project context in [`AGENTS.md`](AGENTS.md). Claude Code imports it from [`CLAUDE.md`](CLAUDE.md); Cursor and Copilot retain their native rules/prompts, and OpenCode uses native commands under `.opencode/commands/`. Shared `/plan`, `/implement-feature`, and `/review` workflows live in `.claude/prompt-snippets/` and are read by native entrypoints. Use `/bootstrap` when adapting a clone, then customize the derived repository's `AGENTS.md` and existing harness guidance from verified site/client facts. Confirm unknown integrations, deployment decisions, and active harnesses from that checkout or ask; do not inherit this template's sample content or machine-specific settings. See [the bootstrap handoff](.nitm/BOOTSTRAP.md).

## Workspace layout

```text
apps/web/                 Nuxt 4 website, routes, CMS content, public assets, and Nitro contact endpoint
  app/pages/              File-based routes
  content/                PagesCMS-managed JSON and Markdown content
  public/                 App-local public assets
  server/                 Website Nitro server code
  assets/, components/    Website styles and UI, including the local design system
apps/server/              Optional, independent Cloudflare Worker example
.pages.yml                PagesCMS collection and field configuration
```

The Nuxt website remains app-local in `apps/web`; the optional standalone Worker in `apps/server` is not part of the website runtime. There is no extracted shared UI package. Keep the existing design system and its app-local components in `apps/web`.

## Content and CMS

Content lives in `apps/web/content/` and is edited as JSON or Markdown. The root `.pages.yml` describes the PagesCMS editor; connect the customized repository to your PagesCMS project and review that configuration before publishing. Common collections include page configuration (`_pages/`), portfolio work (`_work/`), team members (`_about/`), posts (`_posts/`), and testimonials (`_testimonials/`).

Start by updating the site settings and page content, then replace the app-local assets in `apps/web/public/`. See [Template Usage](docs/TEMPLATE_USAGE.md) for the customization workflow and [Tailwind Theme](docs/TAILWIND_THEME.md) for the existing design tokens.

## Documentation

- [Template Usage](docs/TEMPLATE_USAGE.md)
- [Tailwind Theme](docs/TAILWIND_THEME.md)
- [Component Catalog](docs/COMPONENTS.md) — opt-in sections, controlled examples, effects/slideshows, and contact integration notes (runtime checks tracked separately)
- [Lead Forms](docs/LEAD_FORMS.md) — reusable forms, sales scheduling and optional HubSpot adapter; local-only demo at `/examples/lead-forms`
- [Optional Worker example](docs/TEMPLATE_USAGE.md#optional-worker-example) — standalone health endpoint and local/deploy commands
- [AI setup handoff](.nitm/BOOTSTRAP.md) — verified toolkit provenance and project-specific bootstrap scope

## License

MIT. See [LICENSE](LICENSE).
