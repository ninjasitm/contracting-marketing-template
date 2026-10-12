# Monorepo Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the user-authorized monorepo modeled after `git@github.com:ninjasitm/nitm-marketing.git`, preserve the existing site in `apps/web`, retain the local design system intact, adapt only relevant generic reference components, and safely merge/bootstrap the official AI development toolkit.

**Architecture:** Match the reference's `apps/*` and `packages/*` workspace globs using minimal pnpm workspaces. `apps/web` is a directly configured Nuxt 4 application with `srcDir: './'`, nested `app/pages` and `app/stores`, app-root components/assets/theme/config, and its existing contact Nitro API. Retain the local design system app-local, as the reference does; optional earlier extraction permission was not a mandate. No shared UI package, new alias abstraction, placeholder packages or speculative server split.

**Tech Stack:** Preserve locked Nuxt ^4.3.1, Vue ^3.5.14, TypeScript ~5.8.3, Tailwind ^3.4.17, Content ^2.13.4, Pinia, reka-ui/shadcn-vue, Vitest ^3.2.4 and pnpm 8.5.1. Baseline environment is Node 24. Toolkit: published `nitm-ai-dev-toolkit@4.0.0`, with artifact verification before execution.

---

## Authority, reference and current status

- Implementation is now authorized; the original planning-only scope is superseded. This document update itself changes no code and creates no commits. Parent orchestrator owns plan review, execution coordination and final validation sign-off.
- Correct structural/component reference: `git@github.com:ninjasitm/nitm-marketing.git`. `https://github.com/ninjasitm/contracting-marketing-template` remains the current project's identity, not the new structural reference. Preserve site/content and local visual identity; do not replace the site with the reference's business content or theme.
- Reference findings supplied by the orchestrator: `apps/web` is Nuxt 4 with direct config and app-local `components/ui`, assets and theme; there is no reference UI package. `apps/server` is a Worker; `packages/audio-updates` is its only active shared package; Turbo exists there. Reuse structural conventions, not its deployment/business package inventory. No local standalone server, audio package, Nx or Turbo until a real need is established.
- Baseline `pnpm install --frozen-lockfile` passed on Node 24/pnpm 8.5.1; **16/16 tests pass**. Build/typecheck exit **2** with existing diagnostics: `definePageMeta` routing, unknown contact `replyTo`, missing nodemailer types/dynamic import, partial RuntimeConfig test mocks, and possibly undefined utils values. Existing warnings include incompatible old `nuxt-icon` and duplicate component barrels. Make only necessary, smallest safe build fixes; do not disable typechecking or sweep unrelated code.
- Designer findings are authoritative: existing design system is `tailwind.config.ts`, `assets/scss/**`, `components/ui/**`, `components.json`, with documentation in `docs/TAILWIND_THEME.md` that is inaccurate in places. Preserve actual tokens, styles, fonts, primitives and plugin/CSS ordering; correct documentation against code. Do not fix unrelated token/variant defects.
- No deployment, push, repository rename, package publication, global harness edits or framework upgrades without confirmation. No new design skill is needed; existing skills suffice.

## Observed local starting point

- Root `nuxt.config.ts` is the current layer; `app/nuxt.config.ts` extends `../`. Root scripts invoke Nuxt with `./app`; workspace includes only `./`.
- Root config overrides `srcDir`, `@`/`~` to root, `@content`, component prefixes (`Ui`, `App`, `Layout`), store imports, Tailwind paths, modules, mail runtime config and Nitro `cloudflare-pages`. Relocate these to direct web configuration with app-local resolution; no shared design-system layer is needed.
- Existing routes/stores: `app/pages/**`, `app/stores/**`. Root owns `app.vue`, real company `app.config.ts`, components/layouts/content/assets/public/composables/server/types/utils. `app/app.config.ts` is an `extends: ['../']` stub, not the real company configuration.
- Root `tsconfig.json` extends `app/.nuxt/tsconfig.json`; `app/tsconfig.json` extends root. ESLint imports `./app/.nuxt/eslint.config.mjs` and uses `./app/tsconfig.json`. Vitest supplies root aliases and explicit Nuxt mocks.
- Existing tests: `test/components/services/ServiceFeature.test.ts`, `test/tailwind/tailwind.test.ts`, `test/server/contact/send-email.test.ts`, `test/utils/email/factory.test.ts`.
- `.pages.yml` owns `content/...` paths, media input `public/media`, output `/media`, and nested media selectors. `wrangler.toml` is Pages-oriented with `app/dist`; build workflow packs root `.output`, whereas generated app output exists under `app/.output`. Measure actual successful output before updating paths.
- `dev:starter` points at absent `examples/starter`; don't scaffold an example to preserve a broken convenience script.

## Target paths and ownership (proposed until migrated)

```text
package.json, pnpm-workspace.yaml, pnpm-lock.yaml  # private coordinator, one lock
apps/web/
  package.json, nuxt.config.ts, tsconfig.json, app.config.ts, app.vue
  app/pages/, app/stores/                        # existing route/store hierarchy
  components/app/{Button,Card,CTA,Hero}.vue       # site-facing wrappers stay here
  components/, layouts/, composables/, types/, utils/
  content/, public/, server/                     # contact Nitro remains in web
  assets/scss/, components/ui/, lib/utils.ts     # local design system retained
  components.json, tailwind.config.ts
  components/app/ClientLogoScroll.vue            # selected reference adaptation
test/, vitest.config.ts, eslint.config.mjs, tsconfig.json
.pages.yml, wrangler.toml, .env.example, .github/workflows/
AGENTS.md, .agents/, .cursor/, .github/, docs/ai/, docs/TAILWIND_THEME.md, templates/
```

One web app; no speculative standalone server or reference business packages. Workspace globs `apps/*`, `packages/*` do not require creating an empty package or placeholder directory. Keep all existing design-system assets/theme/primitives app-local permanently. Do not move generated `.nuxt`, `.output`, caches or `node_modules`, or copy secrets. Tests/docs stay at root to minimize churn.

## Work graph and exclusive write ownership

`designer browser baseline capture → mechanical migration fixer → stable-path handoff → designer local preservation/ClientLogoScroll adaptation → reconciliation → independent review + parent validation/sign-off`

- **Mechanical fixer:** waits for designer's baseline browser capture to finish before any moves. Then exclusively owns app moves, workspace manifests/lockfile, direct Nuxt/config wiring, necessary bounded build fixes, CMS/deployment/test paths and workflows. Move the existing design system permanently under web intact, without redesign. Freeze integration/config files before handoff.
- **Designer:** baseline capture is still running; after migration stabilizes, exclusively owns app-local visual preservation and `apps/web/components/app/ClientLogoScroll.vue` adaptation/usage. Agree any style/config handoff sequentially with fixer; no overlapping writes. After designer completion return remaining mechanical reconciliation to fixer.
- **AI/docs writer:** independent root AI/docs merge lane is already running against the final app-local target. It may continue in parallel within its exclusive instruction/docs scope; reconcile actual paths and bootstrap after runtime paths stabilize. Designer supplies theme facts for `docs/TAILWIND_THEME.md`. No new design skill; source/config requests return to parent.
- Read-only research may run in parallel. Review/validation follows reconciliation of runtime and AI/docs lanes, not a partial tree.

### Task 1: Finish baseline and reference selection gates

**Files:** Current package/config/workflow/test files; read-only reference `apps/web`, `apps/server`, `packages/audio-updates` and workspace config.

1. Record `git status --short`, `git ls-files`, environment versions, content/public inventory and route slugs; preserve pre-existing user changes. Reuse successful frozen-install evidence rather than claiming it must still be run for baseline.
2. Retain parent baseline evidence: `pnpm test` passes 16/16; `pnpm build` and typecheck exit 2 with the diagnostics recorded above. If required, current preparation is `pnpm exec nuxt prepare ./app`. Log warnings separately; don't upgrade old icon dependencies or clean up barrels as part of migration.
3. Record non-mutating lint using `pnpm exec eslint --ext ".ts,.js,.vue" .`. Existing `pnpm lint` runs `--fix` and typecheck, so is not a read-only baseline.
4. Designer finishes desktop/mobile baseline capture via `pnpm dev`: `/`, `/about`, `/services`, `/process`, `/work`, `/posts`, `/contact`, actual dynamic work/post slugs and existing `/_dev/*` routes. Record navigation/theme/CTA/hero behavior, downloads and console/network failures. Mechanical moves wait for capture completion.
5. Selected generic reference component is `apps/web/components/app/ClientLogoScroll.vue`: local `content/clients.json` already has four logo assets and Tailwind already has `loop-scroll`. Inspect its real props/dependencies and local usage before adapting. Reference testimonial renderer remains optional: do not add without concrete existing usage. No FAQ/partner/background dependencies or reference business data/packages.

**Gate:** Parent baseline evidence recorded, designer browser capture complete and ClientLogoScroll input/usage traced before moves/adaptation.

### Task 2: Mechanical relocation into `apps/web`

**Files:** Root `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`; proposed `apps/web/package.json`, `apps/web/nuxt.config.ts`, `apps/web/tsconfig.json`; existing app/root source files.

1. Make root private, retain repository metadata/version/license, remove stale root layer `main`/`files` publication entries, set workspace globs `apps/*`, `packages/*`. Proposed app name is **`@nitm/web`**. Keep one lockfile and explicit package dependency ownership, not accidental root hoisting.
2. Move `app/pages/** → apps/web/app/pages/**` and `app/stores/** → apps/web/app/stores/**`. Move root site components/layouts/content/public/server/composables/types/utils/app shell/company config to app-root equivalents. Reconcile root stores separately after tracing callers; don't overwrite app stores or assume automatic scanning.
3. Permanently move root `assets/**`, `tailwind.config.ts`, `components/ui/**`, `components.json`, `lib/utils.ts` intact into web. Keep existing app-local `@`/`~` imports resolving correctly; no shared package or new UI alias. Keep `components/app/Button.vue`, `Card.vue`, `CTA.vue`, `Hero.vue`, `LayoutPageSection` and company layouts in web.
4. Replace root-extension arrangement with direct web Nuxt config carrying original behavior/modules/mail/Nitro settings and explicit **`srcDir: './'`**. Explicitly configure pages discovery to `app/pages` and store imports/Pinia scanning to `app/stores` (plus audited relocated root stores); verify generated routes/imports rather than relying on Nuxt 4 defaults with overridden srcDir. Keep `@`/`~` and `@content` app-local. Do not flatten routes into `apps/web/pages`.
5. Use real root company `app.config.ts` as `apps/web/app.config.ts`, keeping local content/type imports correct; retire the old app-config stub/root inheritance after reconciliation. Preserve relevant root/app `.nuxtrc` settings and effective root env loading without moving credentials.
6. Proposed web scripts: `build: nuxt build`, `dev: nuxt dev`, `generate: nuxt generate`, `preview: nuxt preview --port 3000`, `prepare: nuxt prepare`. Root forwards using `pnpm --filter @nitm/web <script>`; root preview still builds first, postinstall becomes `pnpm --filter @nitm/web prepare`. Retire absent `dev:starter`; keep tests/tooling at root and release intent, without executing release.
7. App tsconfig extends its own `./.nuxt/tsconfig.json`; root references relocated generated config without root/app circular inheritance. Repoint ESLint generated import/parser project to web; add proposed root `typecheck: vue-tsc --noEmit` and non-mutating lint with fixes separately available if needed. Regenerate lockfile with pnpm 8.5.1 and review only required importer changes; verify frozen installation.

**Gate:** Web resolves original routes, app-root shell/config/assets, stores and contact Nitro with direct configuration. No root application layer dependency; hand off frozen paths/config ownership to designer.

### Task 3: Designer preserves the LOCAL app design system and adapts ClientLogoScroll

**Files:** App-local `apps/web/{tailwind.config.ts,assets/scss/**,components/ui/**,components.json,lib/utils.ts}`, `apps/web/components/app/ClientLogoScroll.vue`, its concrete page/section consumer, `apps/web/content/clients.json`; agreed web style/config handoffs only.

1. Verify relocated primitive imports and theme/font/plugin/CSS registration against captured baseline. Preserve the complete local design system app-local, with existing installed primitive dependencies and no package extraction or import abstraction.
2. Preserve `Ui`, `App`, `Layout` names/global behavior and app-local aliases. Keep **Inter/Montserrat**, font weights, CSS import order, SCSS variables, transitions/animations, Tailwind plugins, semantic tokens and variants. Verify computed styles; don't adopt reference fonts/colors or fix unrelated token/variant defects.
3. Ensure app-local Tailwind scanning covers `app/pages`, components/layouts/composables independent of invocation cwd. `components.json` retains local theme/CSS/aliases and `shadcn.componentDir` resolves local `components/ui`. Keep Button/Card/CTA/Hero, types and company config contracts unchanged except necessary migration wiring.
4. Adapt reference `apps/web/components/app/ClientLogoScroll.vue` with the four existing local logo assets from `content/clients.json` and existing `loop-scroll` utility. Inspect actual content shape and selected existing client section/page, preserve links/alt text and local styling, and avoid introducing a parallel client data source. Confirm small datasets loop correctly, reduced-motion behavior and keyboard/link accessibility; no new dependency for scrolling.
5. Add one small check using existing Vitest tooling for the adapted logo renderer's actual props/data contract; proposed `test/components/app/ClientLogoScroll.test.ts`. Prove its real page integration and animation/style behavior in the browser, not only with a mount. No testimonial renderer unless a concrete existing consumer needs it; no FAQ/partner/background dependency tree. Existing design skills suffice.

**Gate:** Local visual identity and wrapper behavior preserved; ClientLogoScroll uses existing assets/animation in a real client section without new business data or dependencies.

### Task 4: Reconcile CMS, production paths and tests

**Files:** `.pages.yml`, `wrangler.toml`, `.github/workflows/{build,test,release,version}.yml`, `vitest.config.ts`, root `test/**`, `.gitignore`, `.env.example`; sequential ownership returns to mechanical fixer.

1. Keep `.pages.yml` at root, change content repository paths to `apps/web/content/...` and media input to `apps/web/public/media`, retain output `/media` and site URLs. Inspect nested media selectors relative to CMS media root; validate config/page/team/work/post samples, not blanket string replacement. Existing CMS admin URL names a different starter repo: no remote integration repointing without confirmation.
2. Preserve Wrangler project name/compatibility/bindings and existing Pages preset; measure successful output then update `pages_build_output_dir` and workflow artifact tar paths. `apps/web/dist` and `apps/web/.output/public` are candidates, not asserted outputs. Verify server artifact includes `/api/contact/send-email`; do not copy reference Worker config or introduce `apps/server`.
3. Reconcile all workflows/docs referencing old app/artifact paths. Keep root scripts and locked installs. Baseline Node 24 success doesn't validate existing Node 18 CI; record engine/runtime discrepancies as explicit blockers rather than silently upgrading frameworks or deployment configuration.
4. Keep test mocks at root. Repoint service test to `apps/web/components/services/ServiceFeature.vue`, Tailwind test to `apps/web/tailwind.config.ts`, Vitest `@`/`~` to web. Keep server/email assertions and relocated Nitro imports; no shared-layer fixture or test is needed. Prove nested routes/stores, local primitive auto-imports and aliases through generated output and dev/build/browser checks.
5. Fix only necessary existing build/typecheck blockers after tracing all callers: generated routing/`definePageMeta` typing, contact `replyTo` contract, nodemailer dynamic-import/types, partial RuntimeConfig test mocks and utils undefined handling. Use correct existing contracts, narrow guards or declarations as appropriate, preserve validation/mail behavior and retain regression checks. Do not silence diagnostics with broad casts, blanket ambient stubs, disabling typecheck or sweeping cleanup. Return unsafe/invasive fixes to parent for a bounded decision.

**Gate:** CMS paths and production artifacts have evidence; original tests retain behavior, actual nested routes/app-local primitives resolve, and necessary build fixes are small, reviewed and typechecked.

### Task 5: Reconcile the independent AI/docs merge lane and bootstrap stable paths

**Files:** Preserve/merge `AGENTS.md`, `.github/prompts/bootstrap.prompt.md`, `.cursor/commands/bootstrap.md`, `.agents/skills/**`, `.cursor/rules/**`, `.github/instructions/**`, `docs/ai/**`, templates, `docs/TAILWIND_THEME.md`; proposed `.nitm/BOOTSTRAP.md`, `apps/web/AGENTS.md`. Independent root AI/docs merge already runs; no package guidance for nonexistent packages.

1. Official README and CLI at registry gitHead `36f76da2f01d31ee57809c69447ea57a43b42167` were inspected: install/patch/doctor, `--monorepo`, collision refusal and bootstrap handoff supported. Registry latest reported **4.0.0** on planning date, contradicting README main's stale unpublished statement. Verify `npm view nitm-ai-dev-toolkit@4.0.0 version engines dist.integrity gitHead` and inspect published artifact before execution; pin reviewed version, not floating latest.
2. In fresh `/tmp/opencode` staging directory, run `npx --yes nitm-ai-dev-toolkit@4.0.0 install --monorepo`, inspect generated tree/handoff and diff against existing instructions. No install/`--force` against the populated checkout: collisions abort and force overwrites. `patch --monorepo` adds missing files only, not merged updates. Toolkit scaffolds AI configuration; it does not migrate app files.
3. Merge intentionally, retaining local facts, skills, prompts, rules and docs/ai. Default supported harness scaffold can remain; scaffold directories don't prove active harnesses. No unapproved plugins/hooks/MCP/security/provider/global edits or OpenCode compatibility assumptions; confirm actual runtime/version before optional harness-specific activation.
4. Update web's app-local ownership, nested routes/stores, commands, port 3000, local design-system facts, CMS/Nitro/Pages paths, tests and issue conventions. Workspace globs do not imply packages exist. Reconcile inaccurate `docs/TAILWIND_THEME.md` with designer's findings without redesigning tokens or adding a design skill.
5. Ask active supported agent to read/follow merged `.nitm/BOOTSTRAP.md` with AI/docs-only write scope once paths stabilize. Set build system to pnpm; no invented server/database/audio/docs app or Turbo/Nx variables. Review changes; return any source/config requests to parent for exclusive owner handoff.
6. Run `npx --yes nitm-ai-dev-toolkit@4.0.0 doctor --monorepo`, resolve relevant placeholders/missing intended files and document intentional exclusions. Doctor checks scaffolds/placeholders, **not** application runtime, active harness support or security. Manually verify references and nested guidance too.

**Gate:** Existing knowledge survives, bootstrap respects scope, version provenance recorded, relevant placeholders resolved and instructions match finalized paths.

### Task 6: Final reconciliation and validation

**Files:** Entire reconciled migration, root README/usage docs and AI instructions; read-only reviewer/parent validation.

1. Review exact move map, exclusive handoffs, reference selection evidence, local design-system preservation, dependencies, stale paths, CMS and artifact changes. Fix newly introduced issues with the relevant owner, not competing edits.
2. Run `pnpm install --frozen-lockfile`, `pnpm --filter @nitm/web prepare`, `pnpm test`, proposed `pnpm typecheck`, non-mutating `pnpm lint` after script changes, `pnpm build`, `pnpm generate`; explicitly run proposed `pnpm exec vitest run test/components/app/ClientLogoScroll.test.ts` and existing contact/email tests. Record exit/output against baseline 16/16 tests and build/typecheck exit 2; necessary fixes must not turn typechecking off. Parent validates final results; do not count known failures as passes.
3. Inspect generated route/store/component resolution, then browser-check dev and built preview: all baseline routes/slugs and `/_dev/*`, header/footer/nav, hero/CTA/wrappers, primitive variants, theme switching, ClientLogoScroll's four existing assets/loop/reduced-motion/links, downloads/media, desktop/mobile and keyboard accessibility. Compare Inter/Montserrat computed fonts, tokens and CSS/plugin order against designer baseline; no visual redesign is authorized.
4. Validate `POST /api/contact/send-email` input/error behavior with existing mocks or local fake adapter, confirm production route artifact and preserved env names/loading. Inspect handler schema before asserting invalid payload behavior. No real mail, credentials or external submissions without approval.
5. Compare content/public inventory via move mapping, verify CMS/media paths, rerun AI doctor after final instructions reconciliation and report all findings to parent. Do not claim doctor, a mount or frozen install proves runtime correctness.

**Final gate:** Parent validates reference-aligned `apps/web` structure, preserved site/API/CMS, app-local design system, integrated ClientLogoScroll, reproducible lock/build/typecheck with bounded fixes, safe AI bootstrap and documented remaining baseline defects. No placeholder packages or shared UI extraction. Newly failing routes/tests/builds, visual identity changes or unintended harness/source modifications block completion.

## Open gates and rollback

- Designer baseline browser capture is still running; mechanical writer waits for completion. ClientLogoScroll is selected; inspect its real dependency/data/consumer contract before adaptation. Testimonial renderer stays excluded absent concrete usage.
- Baseline tests pass 16/16; build/typecheck exit 2 with listed existing diagnostics. Small necessary safe fixes and actual Pages artifact validation remain gates; Node 24 install success does not imply Node 18 CI/deployment compatibility. No deployment until confirmed.
- Verify published toolkit artifact and any requested active harness/version; no need to add OpenCode-specific tooling or a new design skill.
- Private workspace conversion retires publicly configured root-layer entry; preserving an external published API requires explicit confirmation, not a speculative compatibility package.
- Keep tracked-file move inventory and merge backups. On failed validation undo only migration-owned changes/moves, restore original manifests/lock/config/CMS/AI backups and remove only new migration-created files; regenerate original app preparation and rerun baseline checks. No destructive blanket reset/clean or overwriting pre-existing user work, commits or remote rollback/deployment.
