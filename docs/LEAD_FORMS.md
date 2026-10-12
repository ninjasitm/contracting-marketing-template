# Lead Forms

Reusable lead-capture forms for the Nuxt app in `apps/web/`. A typed field list and a `submit` callback drive two layouts (regular and one-question-at-a-time). An optional, disabled-by-default HubSpot adapter loads a form definition from HubSpot and submits to it through Nitro.

The existing contact form (`ContactForm.vue`, `useContactForm`, `/api/contact/send-email`) is separate and unchanged.

> Nothing here has been tested against live HubSpot, Cloudflare Turnstile or HubSpot Meetings. Adapter behavior is covered by mocked Vitest tests only. Verify with your own portal before launch.

The [implementation plan](plans/2026-10-12-reusable-lead-forms.md) records pinned reference `nitmMarketing` commit `da649f7e374da848aac277d202a49942d708fc92` and the accepted LIB3 subset decision. Reference business routing, persona defaults and credentials are not part of this template.

## Files

| Path (under `apps/web/`) | Role |
| --- | --- |
| `types/lead-form.ts` | Generic types |
| `utils/lead-form.ts` | `validateLeadFields`, `validateLeadAnswers` (also used server-side) |
| `composables/useLeadForm.ts` | Per-instance controller, `LeadSubmitError` |
| `components/app/LeadForm.vue`, `ConversationalForm.vue`, `LeadFormField.vue` | Generic UI (`App` auto-import prefix) |
| `components/app/HubspotLeadForm.vue`, `HubspotSalesLeadForm.vue`, `LeadFormTurnstile.vue` | HubSpot adapter UI |
| `types/hubspot-lead-form.ts` | Public adapter contract |
| `server/utils/lead-forms/{hubspot,turnstile}.ts`, `server/api/lead-forms/hubspot/[formKey].{get,post}.ts` | Adapter server side |

## Field definitions

`LeadField` has `name`, `type`, `label`, and optional `description`, `placeholder`, `required`, `options` (`{ label, value }[]`), `defaultValue` and `validation` (`min`, `max`, `minLength`, `maxLength`).

The nine field types and their answer values:

| `type` | Value | Notes |
| --- | --- | --- |
| `text`, `textarea`, `phone` | `string` | `minLength`/`maxLength` count characters |
| `email` | `string` | Validated with Zod; empty is allowed unless `required` |
| `number` | `number` or `''` | Empty stays empty (never `0`); `min`/`max` only; `0` is valid |
| `dropdown`, `radio` | `string` | Requires `options` |
| `checkbox-group` | `string[]` | Requires `options`; `minLength`/`maxLength` mean number of selections |
| `checkbox` | `boolean` | `required` means it must be `true` |

`validateLeadFields` throws on an invalid definition: 1–100 fields, names matching `[A-Za-z][A-Za-z0-9_.-]{0,99}` (not `__proto__`, `constructor`, `prototype`), no duplicates, options only on choice types (1–100, unique non-empty values), constraints that fit the type, and defaults that pass validation. `validateLeadAnswers` rejects unknown keys and wrong types, and caps text at 4,000 characters. The components and the server both use these functions; there is one validator.

```ts
import type { LeadField, LeadSubmit } from '~/types/lead-form';

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

## Using the forms

```vue
<AppLeadForm :fields="fields" :submit="submit" submit-label="Request a quote" @success="onSuccess" />
<AppConversationalForm :fields="fields" :submit="submit" />
```

Both components take the same props and emit the same event.

**Props:** `fields`, `submit` (required); `submitLabel` (default `Submit`); `successMessage`; `state` (an existing `useLeadForm()` controller).

**Emits:** `success(result)`, once per confirmed success.

**Slots:** `before-submit` (`{ state, pending }`); `success` (`{ result, reset }`) replaces the default confirmation. In the conversational form, `before-submit` renders only on the last question.

**Exposed:** `state` (the controller) and `replaceFieldsPreservingCompatibleAnswers(nextFields)`.

**Behavior**
- Regular form: all fields at once; on a failed submit, focuses the first invalid field.
- Conversational form: one field at a time with Back/Next, a `<progress>` indicator and focus management. Enter advances or submits; Shift+Enter inserts a newline in a textarea. IME composition and Enter on selects, radios, checkboxes and buttons keep native behavior. Next validates the current field only; the final submit validates everything and jumps back to the first invalid question.
- After success the form is replaced by a status message and a "Start again" button. The default button and slot `reset()` start a new draft and focus its first control; the component's reset callback does nothing after unmount.
- Each instance has its own state. There is no persistence, autosave or URL state.
- **`state` is captured at setup and must stay mount-stable.** Any unkeyed binding change (including adding an external controller to an initially owned form) permanently hides the form, shows an alert, and blocks component submission, success events and migration until a `:key` remount. It does not mutate or dispose a parent's controller.
- With an **owned** controller, changed field semantics or callback identity reset the draft and invalidate pending results. With **external** `state`, its owner's `useLeadForm({ fields: () => ..., submit: () => ... })` getters govern schema/callback changes, not the component's `fields`/`submit` props.
- For explicit compatible migration, call the exposed `replaceFieldsPreservingCompatibleAnswers(nextFields)` on the mounted, valid form **before** updating parent field props/getters to those same definitions. Keep callback context stable. Values survive only when names/types match and new constraints/options accept them; other fields use defaults. Migration clears errors/results and invalidates pending completions. Ordinary schema changes reset instead.

### Submit callback contract

`submit(answers)` receives a detached, validated snapshot and must resolve to `{ success: true, message? }`. Anything else counts as failure, so throw (or reject) when persistence fails. `undefined`, `false`, `{ success: false }` and malformed results are all treated as failures.

On failure the form keeps every answer and shows an error. Exceptions show a generic message by default. To show your own user-safe text, throw `LeadSubmitError`:

```ts
import { LeadSubmitError } from '~/composables/useLeadForm';

const submit: LeadSubmit = async (answers) => {
  const res = await $fetch<{ success: boolean }>('/api/my-endpoint', {
    method: 'POST', body: answers,
  });
  if (res.success !== true) throw new LeadSubmitError('Please review your information and try again.');
  return { success: true };
};
```

The draft returns to defaults only after a verified success. Submission is locked while pending. Unknown exceptions use generic feedback; `LeadSubmitError.message` and success `message` are intentionally caller-controlled display text: never put raw exceptions, personal answers or secrets there. The controller does not log, persist or echo answers; `success` carries only the result, not the answer snapshot.

### Demo page

`/examples/lead-forms` (`apps/web/app/pages/examples/lead-forms.vue`) demonstrates all nine generic field types in regular/conversational forms and the actual generic sales wrapper with a scheduling-slot placeholder. Its local stub resolves `{ success: true }`: no lead or scheduling requests, storage or personal-value echo. The HubSpot example is code only, not mounted. Remove this public demo before launch if unwanted. This describes source behavior, not completed browser/native-keyboard QA.

## Optional HubSpot adapter

Disabled by default. The browser names a configured alias only; portal IDs, form GUIDs, access tokens and mappings stay on the server. Use `<AppHubspotLeadForm form-key="lead" />` after configuration. These routes use the website's Nitro backend, not the optional `apps/server` health Worker.

### Configuration

`leadForms` in `apps/web/nuxt.config.ts` (private `runtimeConfig`) holds the defaults. Set values at runtime with `NUXT_LEAD_FORMS_*` variables, so secrets stay out of the build output:

| Variable | Meaning |
| --- | --- |
| `NUXT_LEAD_FORMS_ENABLED` | `true` to enable (default `false`) |
| `NUXT_LEAD_FORMS_HUBSPOT_ACCESS_TOKEN` | Private app token with the `forms` scope |
| `NUXT_LEAD_FORMS_HUBSPOT_FORMS_LEAD_PORTAL_ID` | Numeric portal ID for alias `lead` |
| `NUXT_LEAD_FORMS_HUBSPOT_FORMS_LEAD_FORM_ID` | Form GUID for alias `lead` |
| `NUXT_LEAD_FORMS_TURNSTILE_ENABLED` | Exactly `true` or `false` |
| `NUXT_LEAD_FORMS_TURNSTILE_SECRET` | Private Siteverify secret; required when enabled |
| `NUXT_LEAD_FORMS_TURNSTILE_SITE_KEY` | Widget site key; required when enabled |
| `NUXT_LEAD_FORMS_TURNSTILE_EXPECTED_HOSTNAME` | Bare hostname to verify; required when enabled |
| `NUXT_LEAD_FORMS_TURNSTILE_ACTION` | Required action; default `lead-form` |

Aliases are an object, not a JSON string. `nuxt.config.ts` ships one alias, `lead`. For more forms, add an entry under `hubspot.forms` (alias pattern `[A-Za-z][A-Za-z0-9_-]{0,63}`), then set `NUXT_LEAD_FORMS_HUBSPOT_FORMS_<ALIAS>_PORTAL_ID` and `_FORM_ID`. Nuxt only applies environment overrides to keys that already exist in `runtimeConfig`, so declare the alias in the config first.

```ts
// Inside runtimeConfig.leadForms.hubspot in apps/web/nuxt.config.ts:
forms: { lead: { portalId: '', formId: '' } }, // Supply actual IDs via runtime env vars.
```

The whole config is validated before any upstream request. Disabled, missing or inconsistent config answers `503 NOT_CONFIGURED` with zero outbound requests.

### Routes

- `GET /api/lead-forms/hubspot/:formKey` returns the public definition `{ formKey, schemaRevision, fields, protection }`. It never includes object type IDs, hidden defaults, portal/form IDs or the raw HubSpot response. `protection` is `{ enabled: false }` or `{ enabled: true, siteKey, action }`; the widget reads only this.
- `POST /api/lead-forms/hubspot/:formKey` accepts only `{ schemaRevision, answers, turnstileToken? }` as `application/json`, at most 64 KiB. Any other key is rejected. A submitted `consent` key is rejected as `INVALID_SUBMISSION` because this version supports no consent. Success is `{ success: true }`.

Error bodies are exactly `{ code }`. Responses use `Cache-Control: no-store`.

| Status | `code` | Cause |
| --- | --- | --- |
| 503 | `NOT_CONFIGURED` | Disabled, or missing or inconsistent config |
| 404 | `NOT_CONFIGURED` | Unknown alias (checked after config validation) |
| 422 | `UNSUPPORTED_FORM` | The HubSpot form is outside the supported subset |
| 400 / 413 / 415 | `INVALID_SUBMISSION` | Bad JSON, unknown key, answers fail validation, body too large, wrong content type, HubSpot 400 |
| 409 | `FORM_CHANGED` | `schemaRevision` is stale |
| 403 | `VERIFICATION_FAILED` | Turnstile token missing, rejected, or wrong hostname/action |
| 502 | `UPSTREAM_UNAVAILABLE` | Metadata or Siteverify call failed (an unexpected server error answers 500 with this code) |
| 504 | `DELIVERY_UNKNOWN` | The HubSpot submission timed out, failed, or returned 5xx |

Requests to HubSpot and Cloudflare use fixed hosts, `redirect: 'manual'` and a 10-second timeout. Failure details are logged with fixed wording only; submitted values and secrets are never logged.

### Supported HubSpot subset

Supported (HubSpot v3 form metadata): visible `single_line_text`, `email`, `phone`, `mobile_phone`, `number`, `multi_line_text`, `dropdown` and `radio` fields, plus hidden fields of those types. Hidden fields need a fixed default; it is injected server-side and never sent to the browser. The form must be a standard HubSpot form, not archived, in default field groups, with legal consent type `NONE`.

Anything else rejects the **whole** form with `UNSUPPORTED_FORM`; fields are never dropped. This includes `single_checkbox`, `multiple_checkboxes`, any explicit, implicit or legitimate-interest consent, conditional fields, non-default or rich-text groups, other field types, and validation rules the generic form cannot enforce (email blocklists, phone digit bounds, number limits).

**Why:** only the v2/FormsNext multipart encodings for checkboxes and consent were verified, not their v3 JSON equivalents. Add checkbox or consent support only after verifying the v3 contract against authoritative HubSpot examples. The `HubspotConsent*` types and the optional `consent` body key are reserved in `types/hubspot-lead-form.ts`; the adapter never returns a definition `consent` and rejects a submitted one.

### Request order and cost

Every accepted GET and well-formed POST fetches current HubSpot metadata (no cache); disabled/misconfigured/unknown-alias requests and malformed POST bodies stop first. A POST does, in order: validate config and alias, parse the bounded body, fetch and normalize metadata, compare `schemaRevision`, reject unsupported consent/validate answers, serialize, verify Turnstile (when enabled), then submit once. Serialization runs before verification so unrepresentable numeric values do not consume a token. A stale revision answers 409 before Siteverify or submission. Consider rate limiting these routes downstream; the template does not implement it.

`schemaRevision` is a SHA-256 fingerprint covering identity, field bindings, hidden defaults, field/option metadata, serialization rules, consent mode and protection policy. Access tokens and the Turnstile secret are excluded. **A fingerprint is not encryption or confidentiality:** never put credentials or sensitive personal data in hidden defaults or assume guessable values are concealed by hashing. Metadata can still change between retrieval and submission; there is no transaction.

### Turnstile

Turnstile fails closed. `enabled` must be exactly `true` or `false` (the strings `"true"`/`"false"` that env vars produce are accepted); anything else answers `503 NOT_CONFIGURED`. When enabled, the secret, site key, expected hostname and action are all required. Siteverify must report success with the configured hostname and action, and any network, status or parse failure fails closed. Tokens are single-use, so the widget resets after every attempt. The script loads only when a protected form mounts. A token sent while protection is off is rejected.

### Client behavior

- `FORM_CHANGED`: the component reloads the definition in place and keeps answers whose field name and type still match and still pass the new constraints. It shows a notice, and the user must submit again. There is no automatic retry.
- `DELIVERY_UNKNOWN`: the answers are kept, the user is told to check before resubmitting, and the request is never retried automatically.
- Other failures keep the draft and show a stable message per code. Load failures show a separate error with a retry button.
- The loader requires exactly the four public envelope keys, validated fields and a coherent explicit protection policy (enabled needs site key/action). Extra metadata, malformed fields/protection or reserved consent fail with a stable load error before mounting the form/widget.
- Alias/view changes and unmount invalidate async generations, so stale loads, submissions, revision notices and widget callbacks cannot affect the new context. Protection rotation remounts the widget and clears tokens; expiry, SDK failures, reset and disposal invalidate old tokens. A protected submission needs a fresh token.
- `HubspotLeadForm` props: `formKey`, `variant` (`'form'` or `'conversational'`, default conversational). It emits `success` and forwards the `success` slot.

### Sales flow (lead, then scheduling)

Despite its name, `AppHubspotSalesLeadForm` supports both generic and HubSpot sources. Required prop `source` uses exported `LeadSalesSource` from `~/types/lead-form`:

```ts
import type { LeadSalesSource } from '~/types/lead-form';
// Reuse fields and submit from the short demo fixture above; production must persist first.
const genericSource: LeadSalesSource = { kind: 'generic', fields, submit };
const hubspotSource: LeadSalesSource = { kind: 'hubspot', formKey: 'lead' };
```

```vue
<AppHubspotSalesLeadForm :source="genericSource" variant="form">
  <template #scheduling="{ result }">
    <p v-if="result.success">Scheduling placeholder; nothing is booked.</p>
  </template>
</AppHubspotSalesLeadForm>
<!-- Optional: mount only after configuring the alias and your own meeting path. -->
<AppHubspotSalesLeadForm :source="hubspotSource"
  meetings-url="https://meetings.hubspot.com/your-path" />
```

Optional props: `variant` (`'form' | 'conversational'`, default conversational), `meetingsUrl`. Event: `lead-success(result)`, never `booked`. The generic source requires no HubSpot configuration and does not use the existing mail/contact route.

- Scheduling is offered only after confirmed lead success. A "Choose a meeting time" button must be clicked before the scheduling slot or iframe mounts. The built-in Meetings flow loads no scheduling iframe/script before both gates; slot authors must keep provider loading inside that slot too. Turnstile, if configured, runs separately during lead capture.
- Without a `scheduling` slot, it renders an iframe of `meetingsUrl`, appending `?embed=true`. The URL must be `https://meetings.hubspot.com/<path>` with a non-empty path and no custom port, credentials, query or fragment (so visitor details cannot be pre-filled). Invalid URLs are ignored; without a slot no button is offered. There is no default meeting slug. The iframe has an accessible title, no-referrer policy and sandbox attributes.
- A `scheduling` slot (`{ result }`) replaces the iframe, works with any provider, and enables the button without a `meetingsUrl`.
- The component never reports or infers that a meeting was booked, and it has no booking postMessage handling.
- Changes to source kind/target, field semantics, callback identity, variant or meeting target reset the flow/opt-in and invalidate stale child results. A newly allocated source object with unchanged semantics does not unnecessarily reset the flow.

## Limits

No autosave, analytics or routing, persona presets, arbitrary HubSpot metadata rendering, booking confirmation, or browser-side submission to HubSpot. Rich-text consent is unsupported. Replace the aliases, copy and meeting links above with your own.
