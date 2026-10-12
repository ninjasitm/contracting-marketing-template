# Bootstrap project guidance and derived-site scope

Use this prompt when a repository is created from the contracting marketing template. This repository is the reusable template; the derived repository is the client's website project.

## First establish which repository this is

- In the template repository, maintain the template's actual Nuxt/workspace context and reusable instructions. Do not replace its company/site seed content with invented client facts.
- In a derived repository, inspect the actual checkout, manifests, routes, CMS content, deployment files, and existing AI guidance before editing. Distinguish seeded examples from confirmed client facts.

## Phase 1: AI-guidance bootstrap (documentation only)

1. Read `AGENTS.md`, `README.md`, `docs/TEMPLATE_USAGE.md`, and the relevant `docs/ai/` references. Preserve local instructions and skills; merge project facts rather than replacing guidance wholesale.
2. Keep the template architecture unless the derived project demonstrably changed it: the website is `apps/web`; the optional health-only Worker in `apps/server` is independent and is not the website API. Preserve the local UI system, fonts, and design tokens unless the user asks for a redesign.
3. Establish site purpose, audience, primary conversion and required features (for example services, blog, portfolio, team, contact/lead capture, scheduling and integrations) from confirmed input and repository evidence. Ask only for missing decisions, not a generic questionnaire. Resolve identity, content ownership and deployment target without inheriting sample/client facts or this checkout's environment; mark unknowns unresolved.
4. Identify active AI harnesses from the session/runtime or ask. Follow each harness's native repository conventions and the existing wrappers. Do not infer use from directory presence, install tools, activate integrations, or copy/synchronize skill trees automatically.
5. Do not change global settings, permissions, trust, credentials, hooks, plugins, MCP servers, or deployment as part of documentation bootstrap. Keep credentials and machine-specific configuration out of the repository.
6. Keep reusable prompt examples and intentional template placeholders intact in this template. AI-guidance bootstrap merges documentation only; it does not authorize source, content, test, manifest or deployment changes. Derived-site adaptation is a separate approval-gated phase below.
7. Report exactly what was inspected and changed. Separate repository configuration from harness runtime validation; do not claim a harness or skill is active merely because files exist.

## Phase 2: Derived-site adaptation (approved file scope only)

In template-maintainer mode, retain the reusable examples and report proposed downstream cleanup; do not prune this checkout. In derived-site mode:

1. Inventory actual routes from `apps/web/app/pages/` plus configured page extensions, modules and route rules. Record public path, source file, feature, references and dependencies; classify **keep / remove / undecided** against the selected site features. Directory names (including `_dev`) are not access controls.
2. Recommend removing public examples/dev catalogs before launch, including `/examples/lead-forms` and `/_dev/docs/components`. Inspect other demo/theme/test/error-preview pages individually; do not assume every `_dev` file is disposable. Optional business pages are removal candidates only when their feature is not required. Preserve needed legal, error, system, API, middleware, auth and CMS behavior. Unknowns stay kept and flagged.
3. Present the route table and affected files/content/references; **ask for approval before deleting**. Approval authorizes only the listed adaptation changes, not a forced scaffold install, global settings or unrelated cleanup. Never delete real user content or shared components/assets based only on a sample page's removal.
4. Apply approved pruning and update navbar/footer/mobile/CTA links, app/CMS configuration, relevant collections, sitemap/SEO, fixtures and docs after checking references/shared ownership. Replace or unpublish identified seed content only within approved scope. Removing an example does not remove its reusable UI, contact backend or needed integration.
5. Verify retained direct routes and navigation/CTAs, and removed-route absence/not-found UI against fresh routing/build output; SPA HTTP 200 alone proves neither page presence nor a 404. Run appropriate tests, typecheck, lint and build; do not overwrite build artifacts with generation unless restored. Record unresolved purpose/content decisions, sample material and blocked live integrations before calling the site launch-ready; do not claim deployment or production readiness from file edits alone.

Use [Template Usage](../../docs/TEMPLATE_USAGE.md#purpose-and-route-audit-before-launch) for the route table, concrete file paths and launch checklist. Report both phases separately and only checks actually run.
