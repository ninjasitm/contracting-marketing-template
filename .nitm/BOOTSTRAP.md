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

This handoff serves two distinct contexts: maintainers working in this reusable template and users adapting a clone into a client website. In the template checkout, the project facts below describe this repository. In a derived site, verify all project and client facts against that checkout or ask; do not carry over this repository's seed content, owner details, environment, active-session versions, or machine configuration as downstream defaults.

The repository follows the pinned toolkit's native entrypoint pattern: root `CLAUDE.md` imports `AGENTS.md`; shared task bodies are in `.claude/prompt-snippets/`; Claude Code rules wrap `.claude/rules-snippets/`; and the Claude, Cursor, Copilot, and OpenCode `/bootstrap`, `/plan`, `/implement-feature`, and `/review` entrypoints explicitly read the corresponding shared body. OpenCode V2 uses the root `AGENTS.md` as project context; its commands explicitly read task files because `@path` references are ordinary text, not includes. These files configure repository entrypoints, not runtime activation. Existing Cursor and Copilot guidance remains in place and must be merged, not replaced wholesale.

`.agents/skills/` remains the canonical reusable skill tree and must be preserved byte-for-byte. `.claude/skills/README.md` documents policy only: there are no copied skill files or symlinks, and this repository does not claim Claude Code automatically discovers `.agents/skills/`. Do not add a synchronization script or infer harness use from directory presence.

**AI-guidance bootstrap is documentation-only:** merge guidance/native repository entrypoints and minimal documentation references. It does not authorize app source, content, tests, manifests, lockfiles, build, CI, workflow or deployment edits, nor global harness configuration, permissions, trust, credentials, hooks, plugins or MCP changes. Preserve reusable examples/placeholders in this template. The toolkit doctor is scaffold-only: its expected-file/placeholder results do not verify application behavior, harness activation or launch readiness.

**Derived-site adaptation is a separate approval gate:** follow the shared [bootstrap body](../.claude/prompt-snippets/bootstrap.md) and [purpose/route audit](../docs/TEMPLATE_USAGE.md#purpose-and-route-audit-before-launch). Establish purpose, audience, conversion and features; inventory actual routes/dependencies; show keep/remove/undecided and file impact; obtain approval before pruning; then verify the agreed changes before launch readiness. Approved scope may include route/content/reference/configuration/fixture changes in the derived repository only. It never authorizes global settings, forced scaffold replacement, skill synchronization or deployment. Unresolved routes stay kept and flagged; real content and shared assets require ownership/reference checks. Template-maintainer mode retains the reusable examples.

## Project structure

- The private `@nitm/contracting-marketing-template` pnpm workspace root targets `@nitm/web` for website tasks. The approved dev workflow uses Turbo TUI: `pnpm dev` runs web only; opt-in `pnpm dev:all` also runs the independent Worker. Build/test/typecheck/lint remain non-Turbo. Raw `pnpm --filter @nitm/web dev` / `pnpm --filter @nitm/server dev` are available without TUI/TTY; web stays on port 3002 by default. This current workflow is separate from the dated verification snapshot above.
- `pnpm-workspace.yaml` covers `apps/*` and `packages/*`.
- `apps/web` (`@nitm/web`) is the leading Nuxt 4 website: routes in `apps/web/app/pages/`, the existing local design system in `apps/web/components/ui/`, Nitro contact API in `apps/web/server/api/`, and PagesCMS content/media in `apps/web/content/` and `apps/web/public/`.
- `apps/server` (`@nitm/server`) is an optional, independent health-only Cloudflare Worker example; it is not a second website or a replacement for the website's Nitro contact endpoint.
- Existing Pinia stores remain in both `apps/web/app/stores/` and `apps/web/stores/`; do not relocate them without verifying Nuxt auto-import behavior.
- The website app also owns its Nuxt config, site config, assets, composables, layouts, types, and utilities.
- Add a package under `packages/` only for a concrete shared-code need. Keep the design system app-local; do not add another backend or task orchestrator speculatively.
- Read [`AGENTS.md`](../AGENTS.md), [`docs/ai/codebase-structure.md`](../docs/ai/codebase-structure.md), and [`docs/ai/architecture.md`](../docs/ai/architecture.md) for the maintained project context.

## Bootstrap rules

1. Identify active harnesses from session/runtime evidence or ask; repository scaffolding alone proves neither tool installation nor use.
2. Preserve existing `AGENTS.md`, `.agents/skills/`, `.github/`, `.cursor/`, and `docs/` content. Merge guidance and keep skills byte-for-byte unchanged.
3. Keep project facts aligned with the actual workspace and manifests. The optional Worker is `@nitm/server`; it is not the website backend.
4. In a derived site, customize its context and harness-specific entrypoints using verified project facts. Ask about unknown business, integration, and deployment decisions instead of inheriting sample or machine-specific values.
5. Do not change user/global settings, permissions, trust, credentials, hooks, plugins, MCP settings, or harness activation. Documentation-only bootstrap cannot modify source/tests/manifests/build/CI/deployment; derived-site adaptation may change only the separately approved route/file scope, never deploy automatically.
6. Retain intentional placeholders in reusable template examples/prompts; approved derived-site pruning may remove sample routes and replace/unpublish identified seed content. Report only checks actually run; file presence is not runtime validation.

## Toolkit verification limits

The toolkit's `doctor` checks only its scaffold's expected files and uppercase double-braced template tokens. The full-scaffold run was against a temporary project, not this checkout. A repository doctor run may report intentionally omitted toolkit files or retained reusable-template placeholders; that is not an application validation failure. Do not claim doctor success means the app or an AI harness works.
