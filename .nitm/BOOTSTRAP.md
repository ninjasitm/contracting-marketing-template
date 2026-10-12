# AI Setup Bootstrap Handoff

This is the selective project handoff for `nitm-ai-dev-toolkit@4.0.0` from `ninjasitm/ai-assisted-dev-toolkit` at commit `36f76da2f01d31ee57809c69447ea57a43b42167`.

## Toolkit provenance (verified 2026-10-11)

- npm `nitm-ai-dev-toolkit@latest` is still **4.0.0**. The registry tarball is `https://registry.npmjs.org/nitm-ai-dev-toolkit/-/nitm-ai-dev-toolkit-4.0.0.tgz`, integrity `sha512-frpYIsFDgy6hq5xvQ5hUAaQ7zNxsiHbYiKOiA0J7vIM+zcBCqOsxYHSk1JSb1iCVa9E06LGVGzXyNTLgg77dRw==`.
- The registry `gitHead`, downloaded tarball integrity, and GitHub `main` HEAD match the commit above. No release upgrade occurred; this is a verified bootstrap/context refresh.
- The package and CLI were staged at `/tmp/opencode/toolkit-final-upgrade`. `install --monorepo` ran only in a new empty temporary project and copied 376 files; staged `doctor --monorepo` found all 376 scaffold files and reported 103 placeholder-bearing files.
- The published `install` command aborts on existing files unless forced; `patch` only adds missing files but re-emits the handoff. Neither was run in this checkout. Never run `install --force` here.

## Verified project facts (2026-10-11)

- The private `@nitm/contracting-marketing-template` pnpm 8.5.1 workspace includes `apps/*` and `packages/*`. Root website commands (`dev`, `build`, `generate`, `preview`) forward to the leading website app, `@nitm/web` in `apps/web/`.
- `apps/web` uses Nuxt 4.3, Vue 3.5, TypeScript 5.8, and `@nuxt/content` 2.13 (Content 2 APIs such as `queryContent()`). Nuxt `srcDir` is `./`, routes are in `apps/web/app/pages/`, PagesCMS content is in `apps/web/content/`, and the existing local design system is `apps/web/components/ui/`.
- The website contact endpoint remains `apps/web/server/api/contact/send-email.post.ts` (`POST /api/contact/send-email`); it uses `worker-mailer`. Do not move it into the optional Worker.
- Preserve the existing Inter/Montserrat font setup and local design tokens. The sample post `apps/web/content/_posts/data/template-example.md` is published so the posts page has an example; replace or unpublish it before launch. `/_dev/docs/components` is a public, opt-in catalog route, not access-protected; remove its page before production if it should not ship.
- `apps/server` is the optional, independent `@nitm/server` Cloudflare Worker example. It provides `GET /health`; unknown GET paths return 404 and other methods return 405 with `Allow: GET`. It is not the website backend and is not used by root website scripts.
- Optional Worker commands: `pnpm --filter @nitm/server dev`, `pnpm --filter @nitm/server typecheck`, and `pnpm test -- test/server-example/worker.test.ts`. Deployment is manual and requires the user's Cloudflare account; never deploy during bootstrap.
- The root `pnpm test` run on 2026-10-11 passed **101 tests across 34 test files**. This is a dated snapshot, not a guarantee for later changes. CI uses Node 22.x; the toolkit checks here used Node 24.18.1.

## Bootstrap scope

Preserve existing project guidance and `.agents/skills/` byte-for-byte. Keep the existing Copilot and Cursor bootstrap wrappers as thin links to this file; directory presence alone does not establish an active harness. The active session reported OpenCode CLI `2.0.23`; do not change harness configuration, permissions, trust, credentials, plugins, MCP servers, hooks, or activation as part of this refresh. Do not add `.toolkit-version`.

Limit repository edits to existing AI guidance and documentation, plus minimal README/template-usage references when useful. Do not modify source, tests, manifests, lockfiles, build, CI, workflows, or deployment. Resolve project-specific facts, while retaining intentional placeholders in reusable prompts and examples. The toolkit doctor is scaffold-only: it does not verify application behavior or harness activation, and its expected-file/placeholder results do not establish runtime failure or readiness.

## Project structure

- The private `@nitm/contracting-marketing-template` pnpm workspace root owns scripts that forward website tasks to `@nitm/web`.
- `pnpm-workspace.yaml` covers `apps/*` and `packages/*`.
- `apps/web` (`@nitm/web`) is the leading Nuxt 4 website: routes in `apps/web/app/pages/`, the existing local design system in `apps/web/components/ui/`, Nitro contact API in `apps/web/server/api/`, and PagesCMS content/media in `apps/web/content/` and `apps/web/public/`.
- `apps/server` (`@nitm/server`) is an optional, independent health-only Cloudflare Worker example; it is not a second website or a replacement for the website's Nitro contact endpoint.
- Existing Pinia stores remain in both `apps/web/app/stores/` and `apps/web/stores/`; do not relocate them without verifying Nuxt auto-import behavior.
- The website app also owns its Nuxt config, site config, assets, composables, layouts, types, and utilities.
- Add a package under `packages/` only for a concrete shared-code need. Keep the design system app-local; do not add another backend or task orchestrator speculatively.
- Read [`AGENTS.md`](../AGENTS.md), [`docs/ai/codebase-structure.md`](../docs/ai/codebase-structure.md), and [`docs/ai/architecture.md`](../docs/ai/architecture.md) for the maintained project context.

## Bootstrap rules

1. Identify active harnesses only from runtime/session evidence or by asking. Scaffold directories alone do not establish which tools are installed or used.
2. Preserve existing `AGENTS.md`, `.agents/skills/`, `.github/`, `.cursor/`, and `docs/` content. Merge project-specific guidance rather than replacing it with toolkit defaults. Existing skills remain intact; no new skills are needed.
3. Keep documentation aligned with actual workspace paths, package names, and manifest scripts. The optional Worker is specifically `@nitm/server`; do not invent further apps, packages, services, or commands.
4. Limit setup to repository AI guidance and documentation. Do not change global settings, permissions, trust, credentials, hooks, or harness activation. Do not modify package/workspace manifests, app source, tests, build, CI, or deployment files as part of this bootstrap.
5. Keep Cursor/Copilot bootstrap entries as thin links to this handoff. Add other harness-specific wrappers only when explicitly requested; do not infer harness use.
6. Report only checks actually run. Do not treat scaffold presence or documentation as runtime validation.

## Toolkit verification limits

The toolkit's `doctor` checks only its scaffold's expected files and uppercase double-braced template tokens. The full-scaffold run was against a temporary project, not this checkout. A repository doctor run may report intentionally omitted toolkit files or retained reusable-template placeholders; that is not an application validation failure. Do not claim doctor success means the app or an AI harness works.
