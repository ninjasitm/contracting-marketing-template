# Expanded Marketing Template Coverage

**Goal:** Copy and adapt useful NITM Marketing components without local equivalents. Template coverage, rather than minimum complexity or current sample content, governs selection. Preserve the local design system and existing implementations.

**Reference:** `ninjasitm/nitm-marketing`, inspected SHA `da649f7e374da848aac277d202a49942d708fc92`. Source inventory: `/tmp/opencode/marketing-reference/`; tree: `/tmp/opencode/marketing-tree.json`.

## Ordered work

1. Comprehensive reference audit — complete; 215 component/helper/type/license files inspected.
2. Component ports — in progress, with exclusive write scopes below.
3. Optional runnable `apps/server` Cloudflare Worker example — queued after component ports; health endpoint, test, local/deployment instructions. Existing Nuxt contact backend remains the default.
4. Upgrade/bootstrap `ninjasitm/ai-assisted-dev-toolkit` — queued last, against the final workspace structure; preserve existing project guidance and skills.

## Component work graph and ownership

- **Foundation designer:** add missing carousel, accordion, dialog, select, checkbox, radio-group, badge, popover and navigation-menu UI families; sole owner of dependency manifests/lockfile, shared safe-link helper and reference license notice. Existing primitive families remain intact. Supply stable carousel API before dependent lanes.
- **Cards/sections designer:** statistics, value and compact testimonial cards; featured/related project cards and grouped featured-work section; portfolio category chips; extend existing BenefitsSection with optional bullets. Existing local ProjectCard and other equivalents remain intact.
- **Static patterns designer:** configurable service-package comparison grid, rich partner cards, optional word scramble and configurable loader/brand transition patterns. No company data or global DOM cloning.
- **Effects/slideshow designer, after foundation:** dynamic BackgroundEffect including topology with its actual runtime; Slideshow hero/vertical modes, controls, autoplay/pause/progress, generic/CMS slides; dedicated resolver/types and scroll-freeze composable.
- **Pricing/hero/content designer, after foundation:** PricingCarousel, DetailHero, team-feature hero/member, generic ContentTabs and multi-facet FilterBar. Generic contracts instead of reference business/course schemas.
- **Contact designer, after foundation and other source writers:** reusable contact form/dialog composed with existing validation, payload and Nitro endpoint; preserve page behavior and do not introduce live external integrations.
- **Integration designer, after writer reconciliation:** component showcase, usage documentation and final browser validation. No overlapping edits to showcase, manifests or global types.

Parent orchestrator owns final validation and reconciles every writer before independent review. Every writer reads full reference source and local callers, adapts local tokens and APIs, and leaves focused runnable checks. No commits, push, deployment or external submissions are authorized.

## Compatibility and preservation gates

- Local Nuxt 4 / Content 2 uses `queryContent`, `_path` and local collections; adapt reference Content 3 resolution without creating course/collaboration routes or collections.
- Installed Reka UI compatibility must be checked; preserve existing Ui/App/Layout registration, Inter/Montserrat, styles, tokens, primitives and unrelated source.
- Preserve dynamic import cleanup, async-generation guards, reduced-motion and fallback behavior. Implement correct p5 support for topology rather than silently dropping it.
- Scroll interception cancels synchronously only when a slideshow consumes the event; retain opt-out and escape at boundaries. Validate rendered links and CTA destinations.
- Optional animations retain accessible stable content, keyboard controls and persistent pause where applicable. Repeated partner content is inert and scoped.
- Copy substantial MIT source with its copyright and permission notice. Remove NITM-specific branding, personas, integrations and fixed business data, not useful generic capabilities.

## Evidence path

Dirty baseline recorded in `/tmp/opencode/template-coverage-baseline/` (status, staged/unstaged patches, source/test hashes). Audit new deltas against it rather than claiming the checkout was clean.

Run focused component/helper checks per lane; only the foundation owner installs/regenerates packages. Reconcile all writers, then run frozen install, preparation, full tests, typecheck, lint, production build and generation. Restore/confirm the Cloudflare contact worker artifact after generation. Browser-check the opt-in showcase at desktop/mobile and light/dark sizes, including pointer/keyboard navigation, dialogs, filters, pricing, motion pause/reduced-motion, effect cleanup/fallback and contact validation without sending email.

Independent review gates spec coverage, code correctness, accessibility, safe destinations and preserved local design. Toolkit doctor is scaffold evidence only, not application runtime proof. Report remaining baseline warnings separately.
