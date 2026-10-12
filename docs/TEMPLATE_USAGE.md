# Template Usage

Use this repository as a clone-and-customize website template. It is a private pnpm workspace, not a published Nuxt layer/API: the site and its local design system live together in `apps/web`.

## Start a client site

```sh
git clone https://github.com/ninjasitm/contracting-marketing-template.git client-site
cd client-site
pnpm install
pnpm dev
```

Use the pinned pnpm version (8.5.1). Root `pnpm dev` uses Turbo TUI for **web only**; `pnpm dev:all` optionally runs web and the independent health Worker together. Without a TTY/TUI, use `pnpm --filter @nitm/web dev` and, if wanted, `pnpm --filter @nitm/server dev` separately. Root `pnpm build`, `pnpm generate`, and `pnpm preview` target `@nitm/web`; build/tests/typecheck/lint remain non-Turbo. `pnpm lint` and `pnpm test` run at the workspace root, while `pnpm typecheck` checks the app plus root test typing. `pnpm lint` does not modify files. The web dev and preview servers default to port 3002. Nuxt selects another available port if 3002 is occupied; use the URL printed at startup. Nuxt CLI port overrides remain available.

## Purpose and route audit before launch

This checkout is the reusable **template**: keep its optional examples here. A **derived site** should go through purpose/features → route audit → approved cleanup → verification before being marked launch-ready. The shared [bootstrap prompt](../.claude/prompt-snippets/bootstrap.md) serves all four native harness wrappers; [bootstrap scope](../.nitm/BOOTSTRAP.md#bootstrap-scope) separates documentation-only AI setup from approved site adaptation.

1. **Confirm purpose and features.** Read the derived repository and confirmed requirements. Record audience, primary conversion, and required services/blog/portfolio/team/contact/lead/scheduling/integration features. Ask only about missing decisions; seed company names, proof, machine settings and template-owner metadata are not client facts. Mark unknowns unresolved.
2. **Inventory actual routes.** Inspect `apps/web/app/pages/`, configured page extensions/modules and route rules, plus references/content dependencies. Use a table like this, filling every actual public path rather than inferring access from folder prefixes:

   | Public path | Source file / feature | Decision | File impact and dependencies |
   | --- | --- | --- | --- |
   | `/examples/lead-forms` | `apps/web/app/pages/examples/lead-forms.vue` / local demo | Recommend remove in derived site | Audit links; keep needed form components/integrations |
   | `/_dev/docs/components` | `apps/web/app/pages/_dev/docs/components.vue` / catalog | Recommend remove in derived site | Audit links; preserve shared UI and assets |
   | Other inventoried routes | Actual file / selected feature | Keep, remove or undecided | List references, content and required behavior |

   Both listed examples are public, not protected by their directory names. Inspect other demo/dev-doc/theme/test/error-preview routes individually; do not delete the whole `_dev` folder by assumption. `/posts`, `/work`, `/process`, `/about` and other business routes are optional **only according to selected features**. Preserve needed legal/error/system routes, APIs, middleware, auth and CMS. Unknown routes stay kept and flagged.
3. **Approve the file scope before deletion.** Show the full keep/remove/undecided table and file impact, then ask for approval. Check callers/shared asset ownership first. Remove only approved routes/references; retain reusable components, styles and UI unless separate cleanup is approved. Removing a demo does not authorize rewriting mail/backend code or dropping an integration needed by the real site. Replace/unpublish identified seed posts, people, client proof and case studies only within approved scope; never delete real user content as “sample”.
4. **Reconcile dependent references.** Update navbar/footer/mobile navigation, CTAs, `apps/web/app.config.ts`, CMS/site navigation/configuration and relevant `.pages.yml` collections, sitemap/SEO, fixtures and documentation to the approved route set. Do not leave dead links or orphaned configuration; preserve collections required by retained features.
5. **Verify and record launch blockers.** Check retained direct URLs and actual navigation/CTAs, plus removed-route router absence/not-found UI using fresh generated routing/build output. With SPA rendering, HTTP 200 alone is not proof of a rendered page or a removed route's HTTP 404. Run appropriate `pnpm test`, `pnpm typecheck`, `pnpm lint` and `pnpm build`; record skipped/blocked checks. Do not run generation over build artifacts unless you restore the intended output. Keep a launch checklist for unresolved purpose/features, remaining seed content, live integration/credential checks and deployment verification. Documentation/toolkit doctor alone does not prove production readiness.

## Customize content and assets

Make changes in the web app, not at the old root-level Nuxt paths:

- `apps/web/content/config.json` — site-wide company and contact settings
- `apps/web/content/_pages/` — home, about, services, process, work, contact, and other page content
- `apps/web/content/_work/` — portfolio case studies
- `apps/web/content/_about/` — team member content
- `apps/web/content/_posts/` and `apps/web/content/_testimonials/` — editorial content
- `apps/web/content/clients.json` — client data
- `apps/web/public/` — app-local images, logos, and other public files

Start with `apps/web/content/config.json` and the relevant files under `_pages/`, then replace the referenced files in `apps/web/public/` (including company logos and any placeholder or empty service images). Preserve existing JSON/Markdown schemas; check neighboring entries and the page component before adding fields. Replace sample people, client names, testimonials, copy, and assets with accurate project-specific content before launch.

The sample post at `apps/web/content/_posts/data/template-example.md` is intentionally published so the posts page has an example. Replace or unpublish it before launch. Its sample author/tag currently match example entries in the team and post-category collections; when editing in PagesCMS, use its actual team/category references rather than treating display names as arbitrary text.

## Reuse the included sections

App-level components are auto-imported; about, work, service and post components must be explicitly imported because Nuxt's component scanner only scans `Layout`, `Ui`, and `App` folders. The opt-in examples page at `/_dev/docs/components` includes controls, portfolio/proof cards, team headers, packages, partner cards, optional brand motion, content filters and contact patterns alongside the original FAQ, benefits and article examples. All new business copy is fictional. See the [Component Catalog](COMPONENTS.md) for imports, contracts and examples. It is a regular public app route, not access-protected or development-only; in a derived site, include `apps/web/app/pages/_dev/docs/components.vue` in the approved removal scope before production if unwanted. These sections are not automatically added to your homepage.

Useful component contracts (check the source before extending them):

- `<AppFaq :items="[{ question, answer }]" />` accepts an optional `title` and uses native expandable `<details>` elements.
- `<AppBenefitsSection title="..." :items="[{ title, description, icon? }]" />` accepts an optional description; `icon` is an icon name such as `lucide:file-text`.
- `<AppTestimonialSection :testimonial="testimonial" />` expects `quote`, `author`, and `position`, with an optional `avatar`; the homepage chooses an existing testimonial from content.
- `BlogPostCard` takes a `post` with `title`, `slug`, and optional `summary`, `date`, `heroImage`, `author`, and `tags`. `FilterSection` takes `options` (`label`/`value`) and `modelValue`, and emits `update:modelValue`. It does not add an “All” option for you; the caller supplies one, conventionally with an empty-string value.

The `/posts` listing reads published entries from `apps/web/content/_posts/data/`, filters by tags, and links to `/posts/:slug`, where Markdown is rendered. `useContentQueries.usePosts()` and `useContentQueries.usePost(slug)` also require `published: true`. PagesCMS is configured in root `.pages.yml`; its post author and tag fields are references to `teamMembers` and `postCategories`, respectively. The site rendering accepts the post's `author` and `tags` values, but PagesCMS references must point to real records in those collections.

## PagesCMS

The PagesCMS configuration remains at repository root in `.pages.yml`, while the content it edits is under `apps/web/content/`. Connect the cloned repository to PagesCMS and keep collection paths aligned with those app-local directories. Review repository access and publishing settings for each client project.

## Code and styling

- File-based page routes are in `apps/web/app/pages/`.
- The website's Nitro server code (including the contact endpoint) is in `apps/web/server/`.
- Shared site components, UI primitives, composables, and styling remain app-local under `apps/web/`; there is no shared `packages/ui` package.
- The site uses local Inter and Montserrat font assets and app-local design tokens. Preserve or intentionally replace them when customizing; see [Tailwind Theme](TAILWIND_THEME.md).

## Build and deploy

Run the root `pnpm build` or `pnpm generate` script for the corresponding Nuxt production build or static generation. Deployment output and hosting configuration depend on the chosen deployment target; review the app's Nuxt and deployment configuration rather than assuming a generic `.output/public` deployment.

The optional HubSpot contact-form integration and any required environment variables should be reviewed in the app configuration before enabling it for a client. Do not place secrets in public runtime configuration. The reusable contact patterns use the existing Nitro endpoint; catalog form submissions are live unless intercepted. The catalog also offers contained effect renderers and two slideshow layouts with a real published template-post reference. See [Component Catalog](COMPONENTS.md) for Content 2 mappings, motion controls, persistent form state and pending final runtime checks.

## Optional Worker example

`apps/server/` is a separate, health-only Cloudflare Worker example; it is not the website backend. Root `pnpm dev` stays web-only; opt-in `pnpm dev:all` includes the Worker, while website `build`, `generate` and `preview` do not. The website contact endpoint remains in `apps/web/server/`. The example needs no account settings, secrets, or external services.

```sh
pnpm --filter @nitm/server typecheck
pnpm test -- test/server-example/worker.test.ts
pnpm --filter @nitm/server dev
curl -i http://127.0.0.1:8787/health
curl -i http://127.0.0.1:8787/unknown
curl -i -X POST http://127.0.0.1:8787/health
```

Only `GET /health` returns `{"status":"ok"}`; unknown GET paths return 404, and all other methods return 405 with `Allow: GET`. To deploy this separate Worker manually, authenticate Wrangler with your Cloudflare account (`pnpm --filter @nitm/server exec wrangler login`), review your plan and resource use, then run `pnpm --filter @nitm/server deploy`. Deployment was not run as part of this example; it requires your account and may consume account resources.
