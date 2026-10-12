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

The development server uses port 3000 by default. Root scripts forward the common app tasks to the workspace, so use `pnpm build`, `pnpm generate`, `pnpm preview`, `pnpm test`, `pnpm typecheck`, and `pnpm lint` from the repository root. `pnpm lint` checks without modifying files.

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
- [Optional Worker example](docs/TEMPLATE_USAGE.md#optional-worker-example) — standalone health endpoint and local/deploy commands
- [AI setup handoff](.nitm/BOOTSTRAP.md) — verified toolkit provenance and project-specific bootstrap scope

## License

MIT. See [LICENSE](LICENSE).
