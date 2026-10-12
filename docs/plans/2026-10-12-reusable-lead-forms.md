# Reusable Lead Forms Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Port both reference form families and the lead-then-scheduling flow into reusable, accessible template components with optional, disabled-by-default HubSpot and Meetings adapters.

**Architecture:** A shared typed definition, validator and instance-local controller power a conventional form and a one-question-at-a-time form. HubSpot is an optional server-validated adapter; scheduling is a separate post-confirmed-success step with a generic slot. Existing contact/email behavior remains untouched.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, installed Zod/Reka/local Ui components, Tailwind tokens, existing Vitest/Vue Test Utils; no new dependency.

---

## Scope, evidence and preservation

- Main baseline: `2344e81`. Pinned reference: `nitmMarketing` main `da649f7e374da848aac277d202a49942d708fc92`. Parent owns reference/external research and final validation; use that pinned source, not a moving branch. Record exact reference paths in implementation documentation when inspecting it.
- Port conventional `LeadForm`, conversational `HubspotLeadForm` behavior and `HubspotSalesLeadForm` flow, not reference business routing, `useActivity`, persona defaults, copy, credentials or business-specific analytics.
- Keep `apps/web/components/app/ContactForm.vue`, existing ContactModal, `apps/web/composables/useContactForm.ts`, and `apps/web/server/api/contact/send-email.post.ts` byte-for-byte unchanged. Do not reroute existing contact pages.
- Existing uncommitted port-3002 configuration and four-harness AI scaffolding are approved, unrelated work. Preserve all pre-existing changes, including README/template docs. Before implementation save status/diff and protected-file hashes under `/tmp/opencode`; never stash/reset them. Only the adapter owner may add runtime configuration, without changing existing values.
- Parent reports existing baseline 101 tests/34 files and port 3002 HTTP 200. Parent takes one fresh baseline after contract freeze, before code; writer lanes do not repeat baseline runs, HTTP checks or server starts. Distinguish inherited failures from regressions. No deployment, credential use, live lead submission, real booking, commits or dependency/global/AI edits. All writes to other AI/port paths are forbidden; only the named additive runtimeConfig change is allowed.
- This planning task creates only this document. Implementation below is a handoff, not permission for the planner to modify source.

## Frozen contracts (gate before parallel writers)

### Final implementation reconciliation (2026-10-12)

The generic forms, optional adapter and local gallery now exist; [LEAD_FORMS.md](../LEAD_FORMS.md) documents the actual caller API. Final application/build/browser verification remains the parent's responsibility; this documentation reconciliation is not an acceptance or live-service test report.

- Both wrappers use `variant?: 'form' | 'conversational'`, not the originally planned `mode`. Sales requires exported `LeadSalesSource` (`generic` fields/submit or `hubspot` formKey); the gallery uses its real generic scheduling slot with a local-only stub.
- Generic `state` is setup-captured. Any unkeyed binding change fails closed until keyed remount; external controller ownership stays with the parent and its getters govern schema/callback changes. Mounted migration calls the bridge before parent definitions change, with stable callback context. Default/slot reset focuses the first control and is inert after unmount.
- The final LIB3 subset below overrides **all** earlier consent rendering, keyed-choice mapping, provider checkbox serialization and consent-reconfirmation promises, including task/test wording. Only `NONE` consent and the eight listed provider field kinds are supported. Consent/checkbox acceptance tests are deferred until authoritative v3 JSON contracts are verified; current tests must assert whole-form rejection, reserved public-consent load rejection and submitted-consent rejection. Generic checkbox support is unaffected.
- Schema revision is a fingerprint, not confidentiality: hidden defaults must not contain credentials or sensitive personal data. No credentials, live leads, real bookings or live HubSpot/Cloudflare/Meetings validation are claimed.

Oracle P0 decisions below are authoritative and parent-accepted. Foundation owner publishes generic exports in `apps/web/types/lead-form.ts`; public adapter types are frozen here but publication is gated by LIB3 below. Any later change stops affected lanes for parent reconciliation. Private binding types belong only in the server utility or a server-specific type, never generic/client exports.

```ts
export type LeadFieldType =
  | 'text' | 'email' | 'phone' | 'number' | 'textarea'
  | 'dropdown' | 'radio' | 'checkbox-group' | 'checkbox';
export type LeadValue = string | number | boolean | string[];
export type LeadAnswers = Record<string, LeadValue>;
export interface LeadField {
  name: string;
  type: LeadFieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  defaultValue?: LeadValue;
  validation?: { min?: number; max?: number; minLength?: number; maxLength?: number };
}
export interface LeadSubmitResult { success: true; message?: string }
export type LeadSubmit = (answers: Readonly<LeadAnswers>) => Promise<LeadSubmitResult>;
export type LeadSalesSource =
  | { kind: 'generic'; fields: readonly LeadField[]; submit: LeadSubmit }
  | { kind: 'hubspot'; formKey: string };
export interface LeadFormProps {
  fields: readonly LeadField[];
  submit: LeadSubmit;
  submitLabel?: string;
  successMessage?: string;
}
// Reserved only: the current adapter rejects all non-NONE consent modes.
export interface HubspotConsentDefinition {
  required: boolean;
  consentToProcessText: string;
  communications: readonly {
    key: string; // Stable server-issued choice key, not a subscription ID.
    required: boolean;
    text: string;
  }[];
}
export interface HubspotConsentAnswers {
  consentToProcess: boolean;
  communications: Record<string, boolean>;
}
export interface HubspotDefinition {
  formKey: string;
  schemaRevision: string;
  fields: readonly LeadField[];
  consent?: HubspotConsentDefinition;
  protection: { enabled: false } | { enabled: true; siteKey: string; action?: string };
}
export interface HubspotSubmitBody {
  schemaRevision: string;
  answers: LeadAnswers;
  consent?: HubspotConsentAnswers;
  turnstileToken?: string;
}
```

### Definition/validation semantics

- `validateLeadFields(fields)` throws on invalid/empty definitions, unsupported types, duplicate names, `__proto__`, `constructor`, `prototype`, invalid defaults/options/constraints. Names: `[A-Za-z][A-Za-z0-9_.-]{0,99}`; no coercion or silent dropping. Reject options on non-choice fields, missing/duplicate/empty option values, nonfinite or inverted numeric bounds and invalid length bounds. Keep constraints meaningful per type; reject irrelevant constraints. For `checkbox-group`, `validation.minLength`/`maxLength` mean minimum/maximum selected options (integers 0–100); `minLength` cannot exceed the available options, and required groups still require at least one selection.
- `validateLeadAnswers(fields, answers, onlyName?)` returns a fresh normalized answer snapshot and per-field errors; reject unknown keys, wrong primitive/array types and unexpected option values. Use own-key iteration and prototype-safe error/answer dictionaries. Client number controls convert nonempty input to finite numbers; empty remains empty, never `0`/`NaN`. Server receives numbers, not numeric strings. Zero is valid; required checkbox means `true`; required checkbox-group means at least one permitted value, duplicates invalid. Optional empty text is allowed, nonempty email must be valid, required whitespace-only text fails. Use installed Zod for email, not a new regex library. Never silently convert unknown values or remove unknown fields.
- Limits: 100 fields, 100 options/field, 4,000 characters/text answer, 100 selected values; constraints may tighten these ceilings, not remove them. Server additionally limits raw request body to 64 KiB before parsing and validates answer types/metadata bounds. The originally proposed 32 KiB consent-copy bound is deferred with consent support; the current adapter rejects non-NONE modes rather than parsing/truncating legal copy.
- `useLeadForm({ fields, submit })` lives in `apps/web/composables/useLeadForm.ts`; expose `answers`, `errors`, `pending`, `result`, `submitError`, `currentIndex`, `progress`, `setAnswer`, `next`, `back`, `submitForm`, `reset`. Pass reactive getters; validation helper lives in `apps/web/utils/lead-form.ts`, reusable without Nuxt by server/tests.
- Each instance owns its state. Back preserves answers. Next validates the current field; final submission validates all fields and focuses the first invalid field. Progress is derived from active position/field count, never from truthiness of answers. Successful final step is distinct from progress through questions.
- Submit takes a detached snapshot (including cloned arrays), locks synchronously against duplicates, retains all personal data on failure, and clears draft only after runtime verification of `{ success: true }`. `undefined`, `false`, `{success:false}` and malformed results fail safely. Catch callback exceptions with generic user-facing feedback, no raw exception/PII logs. Keep result for success UI/scheduling; emit confirmed success once only.
- Replacing schema or submit context invalidates old requests, clears previous result and normally reinitializes the draft; an old promise must not clear/overwrite the new draft. Do not mutate a draft during pending work. Unmount invalidates completions and cleans widget/listeners. No persistence or PII in URLs.
- Explicit FORM_CHANGED bridge: add controller `replaceFieldsPreservingCompatibleAnswers(nextFields)` and expose it from both generic forms with `defineExpose`. It invalidates pending completions, validates the new definition, clears result/errors, and copies detached values only for unchanged names/types that still pass new per-field constraints/options; other fields use validated defaults. Update controller-owned fields and parent props atomically so the prop watcher does not immediately erase migrated answers. Generic prop replacement retains its normal reset behavior; the wrapper explicitly invokes this bridge on revision reload, without remounting the form. Test this exact path, including stale completion. No general store/cache or persistence API.

### Component contracts and composition

- `components/app/LeadForm.vue` and `ConversationalForm.vue`: `LeadFormProps`; emit `success(result: LeadSubmitResult)`. Share controller and `components/app/LeadFormField.vue` renderer, not a second validation implementation. Success replacement UI prevents accidental resubmission. An explicit reset action starts a new draft.
- Conventional form renders all fields. Conversational form renders one field, Back/Next, final submit and accessible progress. Enter advances/submits except textarea Shift+Enter inserts newline; ignore composing/IME events and Enter from an open select or interactive choice control where it performs a native action. Native submit is authoritative; prevent double firing. After next/back/error, focus the appropriate control after `nextTick`; labels/descriptions/errors have unique instance-safe IDs, `aria-invalid`/`aria-describedby`, and status/error announcements. Keep native radio/checkbox/selection keyboard behavior.
- `components/app/HubspotLeadForm.vue`: actual props `{ formKey: string; variant?: 'form' | 'conversational' }`, default conversational; emit the same success result. Validate the exact public envelope, fields and coherent protection before mounting the form/widget; unsupported consent or extra private metadata fails with a stable load error. Supply a `LeadSubmit` callback carrying required `schemaRevision` and optional Turnstile token. No HubSpot SDK/form embed or duplicate controller. Preserve draft on adapter failures. On 409 `FORM_CHANGED`, reload the captured endpoint, invoke the mounted compatible-answer bridge before updating definitions, clear tokens and require a new user submission. Consent UI/reconfirmation is deferred, not implemented. No automatic POST retry. Read widget site key/action only from per-definition `protection`; expiry/reset/protection rotation invalidates tokens. Alias/view/unmount generations ignore stale loads, results, notices and widget callbacks. Server owns IDs/mappings.
- `components/app/HubspotSalesLeadForm.vue`: required `source: LeadSalesSource`, optional `variant` (`'form' | 'conversational'`, default conversational), optional `meetingsUrl`. Reuse the selected form; after **confirmed lead success and explicit opt-in**, render the `scheduling` slot with `{ result }` or trusted Meetings iframe. The control reads “Choose a meeting time”. Generic source/slot requires no HubSpot configuration. Source semantics, callback, view or meeting target changes reset flow/opt-in and invalidate stale results; unchanged source semantics do not reset just for wrapper object identity. Emit `lead-success`, not `booked`; no booking promise, auto-load, or booking completion inference.
- Meetings URL accepts only HTTPS `meetings.hubspot.com`, no credentials/custom port; caller must configure a path, never a default slug. Reject PII-prefill/query parameters in this version. No third-party iframe/script until both lead success and explicit scheduling opt-in. Prefer an iframe with accessible title and restrictive compatible attributes; omit booking postMessage handling entirely. Keep lead-success copy separate from “choose a meeting time”.
- Global `App`/`Ui`/`Layout` scanning is already configured. Explicitly import any non-scanned feature components. Use Inter/Montserrat, existing tokens and local components; no copied reference theme or custom inline-style system.

## Optional adapter contract and trust boundary

Adapter owner alone edits `apps/web/nuxt.config.ts` runtimeConfig. Add disabled-by-default `leadForms` private config: enabled flag, access token, configured alias-to-fixed-portal/form-ID object mapping, Turnstile secret/site key/expected hostname/action. No JSON environment DSL or proxy configuration. Validate complete config before any fetch; disabled, missing or inconsistent configuration returns 503 with zero upstream requests. Secrets are server-only; widget public site key/action are returned only through coherent definition `protection`, not an independent global flag/site key. Client accepts a configured alias, never arbitrary IDs/URLs.

- `GET /api/lead-forms/hubspot/:formKey`: resolve configured key, fetch `https://api.hubapi.com/marketing/v3/forms/{formId}` using private token with `forms` scope. Return public `HubspotDefinition` only: no private binding/objectTypeIDs, subscription IDs, hidden defaults, target IDs, credentials or raw response. Unknown alias is 404 without fetch after configuration validation.
- Normalize into separate public and server-private representations. `schemaRevision` is a native Web Crypto SHA-256 fingerprint of fixed canonical serialization covering configured identity, names/types/object mappings, hidden deterministic defaults, field/option metadata, serialization rules, consent mode and protection policy. Exclude access tokens/Turnstile secrets; never expose its canonical preimage. A fingerprint is not encryption: never put credentials/sensitive personal data in hidden defaults or assume guessed values are concealed. Consent copy/ID/key mappings are deferred with non-NONE support.
- `POST /api/lead-forms/hubspot/:formKey`: strictly accept only `HubspotSubmitBody`, including REQUIRED `schemaRevision`. Reject client definitions, portal/target IDs, objectTypeIDs, legal text, subscription IDs, hidden overrides and unknown keys. After bounded JSON parsing, retrieve/normalize current trusted metadata, compare revision **before Siteverify or submission**, return 409 `{ code: 'FORM_CHANGED' }` on mismatch. Then reject any reserved `consent` key, validate answers and serialize before Siteverify (avoid spending a token on unrepresentable numbers), verify if enabled, then submit once. No caches/stores or transaction guarantee: metadata may change after retrieval.
- **Historical proposal, superseded by the final subset below:** flat fields including single/multiple checkboxes and representable validations. Checkbox mapping/serialization is deferred. Fixed validated hidden defaults stay server-side; dependent fields, unrepresentable groups/validations, date/file/payment and unknown kinds reject the whole definition, never produce a partial usable form.
- Preserve every submitted `objectTypeId`, `name`, and serialized `value` through server bindings. Centralize supported text/plain-decimal serialization with fixtures; provider boolean/multiple-checkbox serialization is deferred. Browser must never send an objectTypeId or override hidden values. Duplicate names across object types are unsupported, not silently conflated.
- **Historical proposal, deferred:** explicit-consent rendering and trusted ID/key reconstruction. Initial support is **NONE only**. Any explicit, implicit, legitimate-interest or rich-text consent rejects the whole form; no `v-html`, sanitizer, invented legal copy or subscription IDs. Future support requires authoritative v3 JSON examples and approved fixtures, not inference from the v2 renderer.
- **Supported-subset decision (final; supersedes the checkbox and explicit-consent wording in the two bullets above).** Only the v2/FormsNext multipart checkbox and consent contracts are verified, not their v3 JSON equivalents, so the initial v3 adapter supports exactly: visible `single_line_text`, `email`, `phone`, `mobile_phone`, `number`, `multi_line_text`, `dropdown` and `radio` fields; hidden fields of those types whose defaults are held only on the server; and legal consent type `NONE`. `single_checkbox`, `multiple_checkboxes` and any explicit, implicit or legitimate-interest consent reject the **whole** form with `UNSUPPORTED_FORM`; fields are never dropped and no mapping is invented. Field-level validation rules the generic form cannot enforce (email blocklists, phone digit bounds, number limits), conditional fields, non-default field groups and group rich text are rejected the same way. The reserved `HubspotConsent*` types and the optional `consent` body key remain in the public contract, but the adapter never returns a definition `consent` and rejects any submitted `consent` as `INVALID_SUBMISSION`. Add checkbox or consent support only after its v3 JSON contract is verified against authoritative HubSpot examples and fixtures.
- Hidden fields require validated deterministic defaults and server injection or whole-form rejection. Client hidden overrides are unknown fields and fail; never filter fields into a partial form.
- Turnstile: POST `https://challenges.cloudflare.com/turnstile/v0/siteverify` with secret and token; enforce `success`, configured hostname and action, fail closed on expiration/replay/upstream/network/config errors. Tokens are single-use and expire after five minutes. Public definition advertises the same configured action used by server verification. Widget script loads only when protection is used; clear token on expiry, cleanup on unmount, reset after failed submissions, no secret/token logging. Incomplete/inconsistent protection config is 503 before any fetch; disabled protection is explicit, not fallback after failure.
- Submit only to `https://api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formGuid}` using configured IDs as sole targets (public unauthenticated endpoint). No client bypass. All fixed-host requests disable redirects, including private authenticated metadata GET; bounded 10-second requests. Return sanitized stable codes (`NOT_CONFIGURED`, `FORM_CHANGED`, `UNSUPPORTED_FORM`, `INVALID_SUBMISSION`, `VERIFICATION_FAILED`, `UPSTREAM_UNAVAILABLE`, `DELIVERY_UNKNOWN`), never upstream bodies/PII/secrets. A submission timeout has unknown delivery: preserve draft, say confirmation is unavailable, never auto-retry or claim failure means no delivery. Confirm upstream success before `{success:true}`.
- Export pure mapper/serializer and injectable async adapter functions from `apps/web/server/utils/lead-forms/hubspot.ts` and `turnstile.ts` for existing Vitest mocks. Nitro routes remain thin; no new mocking dependency, backend or worker changes.

## Tasks and exclusive ownership

Dependency graph: `0 contract/baseline → [1 generic foundation || LIB3 research]`; then `1 → 2a generic UI`; `[1 + LIB3 accepted public schema] → [3 adapter || 2b adapter wrappers]`; then `[2a + 2b + 3] → 4 reconciliation/docs/gallery → 5 independent review → 6 parent acceptance`. Generic foundation/UI do not wait for external SDK research. Adapter mapper and runtime wrappers do.

### Task 0: Contract gate and one baseline — parent

1. Save `git status --short`, current diff, protected-file hashes and reference provenance under `/tmp/opencode`.
2. Freeze parent-accepted Oracle P0 contracts above; then take one fresh `pnpm test` baseline and record actual counts (reported prior 101/34). Preserve parent-confirmed port 3002 HTTP 200/default; no repeated HTTP/start loops while writers are active.
3. Launch LIB3 research in parallel with foundation: verify exact official HubSpot SDK/schema consent discriminants, legal payload structures and single/multiple-checkbox serialization against authoritative examples. Record evidence and fixtures in parent handoff; parent accepts supported subset and publishes public adapter types before mapper/wrapper writing. Until accepted, no adapter mapper guessing. No critical user question is required.

### Task 1: Shared foundation — fixer (exclusive)

**Create:** `apps/web/types/lead-form.ts`, `apps/web/utils/lead-form.ts`, `apps/web/composables/useLeadForm.ts`.
**Tests:** `test/utils/lead-form.test.ts`, `test/composables/useLeadForm.test.ts`.

1. RED: add definition/answer validation and controller tests using existing Vitest patterns. Fixture: email required, number default `0`/min `0`, checkbox-group options `repair`/`install`, required single checkbox. Assert unsafe/duplicate names, invalid definitions/types/options, optional versus required email, array isolation and unknown keys fail appropriately.
2. Run `pnpm test -- test/utils/lead-form.test.ts test/composables/useLeadForm.test.ts`; verify meaningful failures before implementation.
3. GREEN: implement generic contracts/controller plus explicit compatible-answer migration bridge; no persistence/global state. Cover pending deduplication, next/back preservation, strict success, retained draft on rejection, stale completion after schema replacement/unmount, migration under tightened options/constraints, and two independent instances.
4. Re-run the same command; all pass. Publish actual generic export signatures/test fixtures before generic UI. Publish adapter types only after parent accepts LIB3; do not put private metadata types in this file.

### Task 2: UI and wrappers — designer (exclusive, staged gates)

**Create:** `apps/web/components/app/{LeadFormField,LeadForm,ConversationalForm,HubspotLeadForm,HubspotSalesLeadForm,LeadFormTurnstile}.vue`.
**Tests:** `test/components/LeadForm.test.ts`, `ConversationalForm.test.ts`, `HubspotLeadForm.test.ts`, `HubspotSalesLeadForm.test.ts` under `test/components/`.

1. Task 2a starts after actual foundation exports: RED/GREEN generic controls, required messages, keyboard/Shift+Enter/IME, Back/progress/focus, instances and callback state. Task 2b waits for LIB3 and accepted public schema; may then run parallel with Task 3. Adapter fixtures use accepted shapes, not live traffic.
2. Run `pnpm test -- test/components/LeadForm.test.ts test/components/ConversationalForm.test.ts test/components/HubspotLeadForm.test.ts test/components/HubspotSalesLeadForm.test.ts`; confirm failures.
3. GREEN: render via local primitives/controller and explicit migration expose; strict success/scheduling gates. Test rejection of public consent/extra metadata/malformed fields or protection before form/widget mounting, coherent protection/action, token expiry and generation cleanup, adapter-load failure and FORM_CHANGED reload preserving compatible answers while clearing tokens and requiring review/new submission. Consent rendering/keyed-choice acceptance tests are deferred. Assert no automatic timeout/revision retry and no iframe before success **and** opt-in. Stub all third-party calls.
4. Re-run targeted tests. Do not edit types, utilities, controller, runtime config, gallery/docs, contact files or adapter files. Report any contract conflict to parent instead of changing shared exports.

### Task 3: Optional secure adapters — fixer (exclusive; after LIB3, parallel with Task 2b)

**Create:** `apps/web/server/utils/lead-forms/{hubspot,turnstile}.ts`, `apps/web/server/api/lead-forms/hubspot/[formKey].get.ts`, `apps/web/server/api/lead-forms/hubspot/[formKey].post.ts`.
**Modify only:** additive runtimeConfig in `apps/web/nuxt.config.ts` (preserve current dev port/config).
**Tests:** `test/server/lead-forms-hubspot.test.ts`, `test/server/lead-forms-turnstile.test.ts`.

1. RED after LIB3 acceptance: supported metadata fixtures and whole-form rejection fixtures for provider single/group checkboxes, every non-NONE consent mode, rich groups and unsupported rules/types. Reject submitted consent, private metadata exposure, hidden overrides and unknown fields/IDs; test deterministic hidden injection, raw 64 KiB bounds and missing/inconsistent config zero fetch. Consent key/copy and checkbox serialization acceptance tests are deferred. Test fingerprints changing for submission semantics but not secrets, stale revisions returning 409 before Siteverify/submission, no redirects and configured targets only.
2. Run `pnpm test -- test/server/lead-forms-hubspot.test.ts test/server/lead-forms-turnstile.test.ts`; confirm failures.
3. GREEN: implement evidence-backed mapping/serialization, server-private types, canonical Web Crypto revision, injectable adapters and thin routes. Mock metadata GET, Siteverify and submission POST; assert current normalization/revision comparison order, no POST after stale schema or bad consent/token/action/hostname, stable generic codes and DELIVERY_UNKNOWN without retry on submit timeout. No caches or atomic-transaction claims.
4. Re-run targeted tests; inspect generated/public config for secret leakage. Do not edit UI, shared contracts/controller or unrelated config. Return exact environment/config documentation to Task 4 owner.

### Task 4: Reconciliation, source integration, gallery and docs — integration owner

**Create:** `apps/web/app/pages/examples/lead-forms.vue`, `docs/LEAD_FORMS.md`.
**Modify:** only prior task files for necessary reconciliations with original owner approval; do not modify existing README/template documentation or contact pages.

1. Reconcile typecheck and shared fixtures; no contract drift or duplicate state/validator logic. Run all new targeted tests together.
2. Add `/examples/lead-forms` using page layout with explicitly labeled **demo/local-only** stub resolving `{success:true}`. Demonstrate conventional, conversational and generic sales scheduling slot; no external calls by default. Adapter examples require explicit enable/configuration, never implicit selection from environment. Do not expose personal data in demo output.
3. Document typed caller examples, generic/wrapper APIs, exact provenance and accepted LIB3 evidence, server alias-object configuration, supported subset/rich-consent rejection, revision-change migration/review and new submission (consent reconfirmation deferred), delivery-unknown/no-retry ceiling, per-definition protection and no booking-complete claim. Include a short fixture, not hundreds of scaffold lines:

   ```ts
   const fields: LeadField[] = [
     { name: 'email', type: 'email', label: 'Email', required: true },
     { name: 'quantity', type: 'number', label: 'Quantity', defaultValue: 0, validation: { min: 0 } },
     { name: 'interests', type: 'checkbox-group', label: 'Interests', options: [
       { label: 'Repair', value: 'repair' }, { label: 'Installation', value: 'install' },
     ] },
   ];
   // Demo only. Production callbacks must throw on unsuccessful persistence.
   const submit: LeadSubmit = async () => ({ success: true });
   ```

4. Verify SPA direct route HTTP/load behavior: `/examples/lead-forms` renders, not a falsely successful HTTP 200 carrying a missing-page screen. Existing routes remain unchanged.

### Task 5: Independent static/security review — reviewer, not a writer

1. Review actual diff against pinned source behavior and frozen contracts; verify both form families and sales flow, no persona/routing leakage, no contact/email changes.
2. Review trust boundaries: missing/inconsistent-config zero fetch, private/public separation, revision coverage/current comparison order, configured IDs/fixed hosts/no redirects, bounds/unknown fields, whole-form provider checkbox/non-NONE consent rejection, submitted-consent rejection, hidden injection/fingerprint confidentiality limits, Siteverify fail-closed protection consistency, unknown-delivery/no-auto-retry, no metadata/secret/PII leaks and iframe opt-in.
3. Report findings with paths and severity. Original exclusive owner fixes with a regression test; rerun affected tests. Parent clears all blocking findings before acceptance.

### Task 6: Final verification — parent only

1. Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`; record actual exit codes/counts. Build must preserve optional adapter behavior on configured Cloudflare Pages target. Do not label inherited failures as new, or report unrun checks as passing.
2. With the real browser and native pointer/keyboard actions, check desktop/mobile, light/dark, all controls, Back/focus/progress, Enter/Shift+Enter/IME, required/email/zero/multichoice errors, independent instances and repeated/pending/failed submits. Verify retained draft on failure and cleared draft only after confirmed success.
3. Install runtime request interception **before navigation** for ALL HubSpot, Turnstile and Meetings URLs. Use mocked metadata, Siteverify outcomes, submission failures/success, and Meetings response; do not send actual upstream requests, credentials, leads or bookings. Browser tool alone is insufficient unless interception is verified; use existing browser test infrastructure/runtime harness with native actions, not a new dependency. Assert missing config makes zero upstream requests.
4. Check malformed/cross-form/unsupported-consent rejection fixtures, revision-change reload preserving compatible draft and requiring review/new submission (consent UI/reconfirmation deferred), coherent widget expiry/reset, timeout delivery-unknown/no-auto-retry, no iframe before both gates, generic scheduling slot without HubSpot and no false booked message. Capture meaningful mobile/light/dark and gating screenshots.
5. Compare status/diff and protected hashes to baseline: pre-existing AI scaffolds and port 3002 changes preserved; contact flow unchanged; only agreed new files/config additions introduced. No commits/deployments. Parent reports actual check results and remaining limitations.

## Deliberate limits

No autosave, analytics/activity routing, persona presets, arbitrary HubSpot metadata rendering, live bookings, booking-completion messaging, direct browser submit bypass, PII-prefill URLs, new dependency or backend. Add unsupported field kinds only when a real schema requires them and safe mapping has tests. No critical architecture questions remain; unsupported upstream definitions must fail explicitly rather than prompt for invented defaults.
