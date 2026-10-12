/**
 * Optional, disabled-by-default HubSpot lead-form adapter (server only).
 *
 * Supported subset of HubSpot v3 form metadata: visible single_line_text, email, phone,
 * mobile_phone, number, multi_line_text, dropdown and radio fields, hidden fields of those types
 * whose fixed defaults never leave this module, and legal consent type NONE. Anything else rejects
 * the whole form with UNSUPPORTED_FORM; fields are never dropped and no mapping is invented.
 *
 * Trust boundary: the browser only ever holds the public definition. Every POST re-reads and
 * re-normalizes the current metadata, compares `schemaRevision`, re-validates the answers with the
 * shared validator, optionally verifies Turnstile and submits to the configured target. There is
 * no cache or transaction, so metadata can still change between that read and the HubSpot
 * submission. The functions take an injected `fetch` and plain config so Vitest never needs Nitro.
 */
import type {
  HubspotDefinition,
  HubspotLeadFormErrorBody,
  HubspotLeadFormErrorCode,
} from '~/types/hubspot-lead-form';
import type { LeadAnswers, LeadField, LeadFieldType } from '~/types/lead-form';
import { validateLeadAnswers, validateLeadFields } from '~/utils/lead-form';
import {
  BodyTooLargeError,
  DEFAULT_REQUEST_TIMEOUT_MS,
  discardBody,
  isRecord,
  parseTurnstilePolicy,
  readBoundedText,
  verifyTurnstileToken,
  withRequestTimeout,
} from './turnstile';
import type { LeadFormFetch, TurnstilePolicy } from './turnstile';

export const MAX_SUBMIT_BODY_BYTES = 64 * 1024;

const MAX_METADATA_BYTES = 1024 * 1024;
const MAX_FIELDS = 100;
const MAX_OPTIONS = 100;
const HUBSPOT_API_ORIGIN = 'https://api.hubapi.com';
const HUBSPOT_SUBMIT_ORIGIN = 'https://api.hsforms.com';
/** Bump when serialization semantics change so stale browsers get FORM_CHANGED. */
const SERIALIZATION_RULES =
  'hubspot-forms-v3/fields-only/consent-none/number-decimal/empty-omitted/hidden-injected/1';

const ALIAS_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;
const PORTAL_ID_PATTERN = /^[0-9]{1,15}$/;
const FORM_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ACCESS_TOKEN_PATTERN = /^[\x21-\x7e]{1,512}$/;
const NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_.-]{0,99}$/;
const RESERVED_NAMES = new Set(['__proto__', 'constructor', 'prototype']);
const OBJECT_TYPE_ID_PATTERN = /^[0-9]{1,10}-[0-9]{1,10}$/;
const DECIMAL_PATTERN = /^-?[0-9]{1,15}(?:\.[0-9]{1,15})?$/;
const REVISION_PATTERN = /^[0-9a-f]{64}$/;
const SUBMIT_KEYS = new Set([
  'schemaRevision',
  'answers',
  'consent',
  'turnstileToken',
]);

/** HubSpot `fieldType` values the adapter maps; everything else is unsupported. */
const FIELD_TYPES = new Map<string, LeadFieldType>([
  ['single_line_text', 'text'],
  ['email', 'email'],
  ['phone', 'phone'],
  ['mobile_phone', 'phone'],
  ['number', 'number'],
  ['multi_line_text', 'textarea'],
  ['dropdown', 'dropdown'],
  ['radio', 'radio'],
]);

export class LeadFormError extends Error {
  constructor(
    readonly code: HubspotLeadFormErrorCode,
    readonly status: number,
    /** Operator-facing diagnostic with fixed wording: never submitted values or secrets. */
    readonly reason: string,
  ) {
    super(code);
    this.name = 'LeadFormError';
  }
}

const invalid = (status: 400 | 413 | 415, reason: string) =>
  new LeadFormError('INVALID_SUBMISSION', status, reason);

function unsupported(reason: string): never {
  throw new LeadFormError('UNSUPPORTED_FORM', 422, reason);
}

/** The template's default, explicitly disabled state: expected, so it is not worth a log line. */
const DISABLED_REASON = 'lead forms are disabled';

/** Maps any failure to the only thing a browser may see: a status and a stable `{ code }`. */
export function toLeadFormResponse(error: unknown): {
  status: number;
  body: HubspotLeadFormErrorBody;
} {
  if (error instanceof LeadFormError) {
    // Unknown aliases (404) and the disabled default are routine; everything else needs an operator.
    if (error.status !== 404 && error.reason !== DISABLED_REASON) {
      console.warn(
        '[LeadForms] [hubspot]: Request failed | code:',
        error.code,
        '| status:',
        error.status,
        '| reason:',
        error.reason,
      );
    }
    return { status: error.status, body: { code: error.code } };
  }

  // Never log the message: parser errors can quote submitted values.
  console.error(
    '[LeadForms] [hubspot]: Unexpected failure | type:',
    error instanceof Error ? error.name : typeof error,
  );
  return { status: 500, body: { code: 'UPSTREAM_UNAVAILABLE' } };
}

// --- Configuration ---------------------------------------------------------

export interface HubspotFormTarget {
  portalId: string;
  formId: string;
}

export interface ResolvedLeadFormsConfig {
  accessToken: string;
  forms: ReadonlyMap<string, HubspotFormTarget>;
  turnstile: TurnstilePolicy;
}

const notConfigured = (status: 404 | 503, reason: string) =>
  new LeadFormError('NOT_CONFIGURED', status, reason);

function idText(value: unknown): string {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value >= 0 ? String(value) : '';
  }
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Validates the whole private `leadForms` runtime config before anything is fetched. Disabled,
 * missing or inconsistent config is always a 503 NOT_CONFIGURED; a 404 is reserved for an unknown
 * alias under valid config. Reasons name the offending setting, never its value.
 */
export function resolveLeadFormsConfig(raw: unknown): ResolvedLeadFormsConfig {
  if (!isRecord(raw)) {
    throw notConfigured(503, 'leadForms runtime config is missing');
  }
  if (raw.enabled === false || raw.enabled === 'false') {
    throw notConfigured(503, DISABLED_REASON);
  }
  if (raw.enabled !== true && raw.enabled !== 'true') {
    throw notConfigured(503, 'leadForms.enabled must be true or false');
  }

  const hubspot = raw.hubspot;
  if (!isRecord(hubspot)) {
    throw notConfigured(503, 'leadForms.hubspot is missing');
  }
  const accessToken =
    typeof hubspot.accessToken === 'string' ? hubspot.accessToken.trim() : '';
  if (!ACCESS_TOKEN_PATTERN.test(accessToken)) {
    throw notConfigured(
      503,
      'leadForms.hubspot.accessToken is missing or malformed',
    );
  }

  const entries = isRecord(hubspot.forms) ? Object.entries(hubspot.forms) : [];
  if (entries.length === 0) {
    throw notConfigured(503, 'leadForms.hubspot.forms has no configured form');
  }
  const forms = new Map<string, HubspotFormTarget>();
  for (const [alias, target] of entries) {
    if (!ALIAS_PATTERN.test(alias)) {
      throw notConfigured(503, 'leadForms.hubspot.forms has a malformed alias');
    }
    const portalId = idText(isRecord(target) ? target.portalId : undefined);
    const formId = idText(isRecord(target) ? target.formId : undefined);
    if (!PORTAL_ID_PATTERN.test(portalId) || !FORM_ID_PATTERN.test(formId)) {
      throw notConfigured(
        503,
        `leadForms.hubspot.forms.${alias} needs a numeric portalId and a form GUID`,
      );
    }
    forms.set(alias, { portalId, formId });
  }

  const turnstile = parseTurnstilePolicy(raw.turnstile);
  if (!turnstile.ok) throw notConfigured(503, turnstile.reason);

  return { accessToken, forms, turnstile: turnstile.policy };
}

function resolveTarget(config: unknown, formKey: unknown) {
  const resolved = resolveLeadFormsConfig(config);
  if (typeof formKey !== 'string') {
    throw notConfigured(404, 'unknown form alias');
  }
  const target = resolved.forms.get(formKey);
  if (!target) throw notConfigured(404, 'unknown form alias');
  return { resolved, formKey, target };
}

// --- Metadata normalization ------------------------------------------------

/** One submitted HubSpot field. Private: `hiddenValue` and `objectTypeId` never reach a browser. */
export interface HubspotFieldBinding {
  objectTypeId: string;
  name: string;
  hubspotType: string;
  /** Present for visible fields: the public definition entry. */
  field?: LeadField;
  /** Present for hidden fields: the fixed server-held value, exactly as HubSpot stores it. */
  hiddenValue?: string;
}

export interface NormalizedHubspotForm {
  formKey: string;
  portalId: string;
  formId: string;
  /** Visible fields in HubSpot order: the public definition. */
  fields: LeadField[];
  /** Every submitted field, visible and hidden, in HubSpot order. */
  bindings: HubspotFieldBinding[];
}

const isWord = (value: unknown, word: string) =>
  typeof value === 'string' && value.toLowerCase() === word;

const describeType = (value: unknown) =>
  typeof value === 'string' && /^[a-z_]{1,40}$/.test(value)
    ? value
    : 'unrecognized';

function parseDecimal(text: string): number | undefined {
  return DECIMAL_PATTERN.test(text) ? Number(text) : undefined;
}

function flag(value: unknown, name: string, key: string): boolean {
  if (value === undefined) return false;
  if (typeof value !== 'boolean') {
    unsupported(`field "${name}" has a non-boolean ${key} flag`);
  }
  return value;
}

function optionalText(
  value: unknown,
  name: string,
  key: string,
): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') {
    unsupported(`field "${name}" has a non-text ${key}`);
  }
  return value;
}

/** Any validation rule would be silently ignored by the generic form, so only empty ones pass. */
function assertInertValidation(validation: unknown, name: string): void {
  if (validation === undefined || validation === null) return;
  if (!isRecord(validation)) {
    unsupported(
      `field "${name}" has a validation shape the adapter cannot represent`,
    );
  }
  const inert = (value: unknown) =>
    value === undefined ||
    value === null ||
    value === false ||
    value === '' ||
    (Array.isArray(value) && value.length === 0);
  if (!Object.values(validation).every(inert)) {
    unsupported(
      `field "${name}" uses a validation rule the adapter cannot represent`,
    );
  }
}

function readOptions(
  raw: unknown,
  name: string,
  type: LeadFieldType,
): { label: string; value: string }[] | undefined {
  if (type !== 'dropdown' && type !== 'radio') {
    if (raw === undefined || raw === null) return undefined;
    if (Array.isArray(raw) && raw.length === 0) return undefined;
    unsupported(`field "${name}" has options but is not a choice field`);
  }
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_OPTIONS) {
    unsupported(
      `choice field "${name}" needs between 1 and ${MAX_OPTIONS} options`,
    );
  }

  const seen = new Set<string>();
  return (raw as unknown[]).map((option) => {
    if (!isRecord(option))
      unsupported(`choice field "${name}" has a malformed option`);
    const { label, value, hidden } = option;
    if (
      typeof label !== 'string' ||
      label.trim() === '' ||
      typeof value !== 'string' ||
      value === ''
    ) {
      unsupported(
        `choice field "${name}" has an option without a label or value`,
      );
    }
    if (hidden !== undefined && hidden !== false) {
      unsupported(`choice field "${name}" has a hidden option`);
    }
    if (seen.has(value)) {
      unsupported(`choice field "${name}" repeats an option value`);
    }
    seen.add(value);
    return { label, value };
  });
}

/** A hidden default must be acceptable to the generic validator, or the form cannot be served. */
function assertHiddenDefault(
  name: string,
  type: LeadFieldType,
  options: { label: string; value: string }[] | undefined,
  value: string | number,
): void {
  const probe: LeadField = {
    name,
    type,
    label: name,
    required: true,
    ...(options ? { options } : {}),
  };
  try {
    const { errors } = validateLeadAnswers([probe], { [name]: value });
    if (Object.keys(errors).length === 0) return;
  } catch {
    // An unusable probe definition (for example oversized options) is just as unsupported.
  }
  unsupported(
    `hidden field "${name}" has a default its field type does not accept`,
  );
}

function bindField(raw: unknown, names: Set<string>): HubspotFieldBinding {
  if (!isRecord(raw)) unsupported('a field is not an object');

  const { name, objectTypeId, fieldType } = raw;
  if (
    typeof name !== 'string' ||
    !NAME_PATTERN.test(name) ||
    RESERVED_NAMES.has(name)
  ) {
    unsupported('a field has a missing or unsafe name');
  }
  if (names.has(name)) {
    unsupported(`field "${name}" appears more than once`);
  }
  names.add(name);

  if (
    typeof objectTypeId !== 'string' ||
    !OBJECT_TYPE_ID_PATTERN.test(objectTypeId)
  ) {
    unsupported(`field "${name}" has a missing or malformed objectTypeId`);
  }
  const type =
    typeof fieldType === 'string' ? FIELD_TYPES.get(fieldType) : undefined;
  if (!type || typeof fieldType !== 'string') {
    unsupported(
      `field "${name}" has an unsupported type (${describeType(fieldType)})`,
    );
  }

  const required = flag(raw.required, name, 'required');
  const hidden = flag(raw.hidden, name, 'hidden');
  const dependents = raw.dependentFieldFilters;
  if (
    dependents !== undefined &&
    dependents !== null &&
    !(Array.isArray(dependents) && dependents.length === 0)
  ) {
    unsupported(`field "${name}" is conditional, which is not supported`);
  }
  assertInertValidation(raw.validation, name);

  const options = readOptions(raw.options, name, type);
  const rawDefault = raw.defaultValue;
  if (
    rawDefault !== undefined &&
    rawDefault !== null &&
    typeof rawDefault !== 'string'
  ) {
    unsupported(`field "${name}" has a non-text default`);
  }
  const defaultText =
    typeof rawDefault === 'string' && rawDefault !== ''
      ? rawDefault
      : undefined;
  const typedDefault =
    defaultText !== undefined && type === 'number'
      ? parseDecimal(defaultText)
      : defaultText;
  if (defaultText !== undefined && typedDefault === undefined) {
    unsupported(`field "${name}" has a non-numeric default`);
  }

  if (hidden) {
    if (defaultText === undefined || typedDefault === undefined) {
      unsupported(`hidden field "${name}" needs a fixed default value`);
    }
    assertHiddenDefault(name, type, options, typedDefault);
    return {
      objectTypeId,
      name,
      hubspotType: fieldType,
      hiddenValue: defaultText,
    };
  }

  const { label } = raw;
  if (typeof label !== 'string' || label.trim() === '') {
    unsupported(`field "${name}" has an empty label`);
  }
  const field: LeadField = { name, type, label, required };
  const placeholder = optionalText(raw.placeholder, name, 'placeholder');
  const description = optionalText(raw.description, name, 'description');
  if (placeholder !== undefined) field.placeholder = placeholder;
  if (description !== undefined) field.description = description;
  if (options) field.options = options;
  if (typedDefault !== undefined) field.defaultValue = typedDefault;
  return { objectTypeId, name, hubspotType: fieldType, field };
}

/**
 * Pure mapper from HubSpot v3 form metadata to the public fields plus private bindings. Throws
 * UNSUPPORTED_FORM for anything outside the supported subset instead of returning a partial form.
 * shortcut: option order follows the API array order and `displayOrder` is ignored; revisit if
 * HubSpot ever returns options out of display order.
 */
export function normalizeHubspotForm(
  formKey: string,
  target: HubspotFormTarget,
  metadata: unknown,
): NormalizedHubspotForm {
  if (!isRecord(metadata)) unsupported('the form definition is not an object');
  if (!isWord(metadata.formType, 'hubspot')) {
    unsupported('only standard HubSpot forms are supported');
  }
  if (metadata.archived !== undefined && metadata.archived !== false) {
    unsupported('archived forms are not supported');
  }
  const consent = metadata.legalConsentOptions;
  if (!isRecord(consent) || !isWord(consent.type, 'none')) {
    unsupported('only legal consent type NONE is supported');
  }

  const groups = metadata.fieldGroups;
  if (!Array.isArray(groups) || groups.length === 0) {
    unsupported('the form has no field groups');
  }

  const names = new Set<string>();
  const bindings: HubspotFieldBinding[] = [];
  for (const group of groups as unknown[]) {
    if (!isRecord(group)) unsupported('a field group is not an object');
    if (!isWord(group.groupType, 'default_group')) {
      unsupported(
        'only default field groups are supported (no progressive or dependent groups)',
      );
    }
    if (
      group.richText !== undefined &&
      group.richText !== null &&
      group.richText !== ''
    ) {
      unsupported('rich text in a field group is not supported');
    }
    if (!Array.isArray(group.fields)) {
      unsupported('a field group has no fields');
    }
    for (const raw of group.fields as unknown[]) {
      if (bindings.length >= MAX_FIELDS) {
        unsupported(`the form has more than ${MAX_FIELDS} fields`);
      }
      bindings.push(bindField(raw, names));
    }
  }

  const fields = bindings.flatMap((binding) =>
    binding.field ? [binding.field] : [],
  );
  if (fields.length === 0) unsupported('the form has no visible fields');
  try {
    validateLeadFields(fields);
  } catch (error) {
    unsupported(
      error instanceof Error ? error.message : 'invalid field definition',
    );
  }

  return {
    formKey,
    portalId: target.portalId,
    formId: target.formId,
    fields,
    bindings,
  };
}

/**
 * SHA-256 over a fixed-order serialization of everything that changes what a submission means:
 * identity, bindings, hidden defaults, field semantics, serialization rules, consent mode and the
 * protection policy. Secrets and cosmetic metadata are excluded; the preimage is never exposed.
 */
export async function computeHubspotSchemaRevision(
  form: NormalizedHubspotForm,
  turnstile: TurnstilePolicy,
): Promise<string> {
  const preimage = JSON.stringify([
    SERIALIZATION_RULES,
    form.formKey,
    form.portalId,
    form.formId.toLowerCase(),
    form.bindings.map(
      ({ objectTypeId, name, hubspotType, field, hiddenValue }) => [
        objectTypeId,
        name,
        hubspotType,
        field
          ? [
              field.type,
              field.label,
              field.required === true,
              field.placeholder ?? null,
              field.description ?? null,
              field.defaultValue ?? null,
              field.options?.map((option) => [option.label, option.value]) ??
                null,
            ]
          : null,
        hiddenValue ?? null,
      ],
    ),
    'consent:none',
    turnstile.enabled
      ? [
          'turnstile',
          turnstile.siteKey,
          turnstile.action,
          turnstile.expectedHostname,
        ]
      : ['turnstile', null],
  ]);
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(preimage),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

// --- Serialization ---------------------------------------------------------

export interface HubspotSubmittedField {
  objectTypeId: string;
  name: string;
  value: string;
}

function valueText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') {
    const text = String(value);
    // Exponent and non-finite forms have no faithful plain-decimal text.
    if (Number.isFinite(value) && /^-?[0-9]+(?:\.[0-9]+)?$/.test(text)) {
      return text;
    }
  }
  throw invalid(400, 'an answer has no HubSpot representation');
}

/**
 * Builds the HubSpot payload from validated answers: every visible answer that is present and not
 * empty, plus each hidden field's fixed value, in HubSpot order. Values are never trimmed.
 */
export function serializeHubspotSubmission(
  form: NormalizedHubspotForm,
  answers: Readonly<Record<string, unknown>>,
): { fields: HubspotSubmittedField[] } {
  const fields: HubspotSubmittedField[] = [];
  for (const { objectTypeId, name, hiddenValue } of form.bindings) {
    if (hiddenValue !== undefined) {
      fields.push({ objectTypeId, name, value: hiddenValue });
      continue;
    }
    const value = Object.hasOwn(answers, name) ? answers[name] : undefined;
    if (value === undefined || value === '') continue;
    fields.push({ objectTypeId, name, value: valueText(value) });
  }
  return { fields };
}

// --- Upstream calls --------------------------------------------------------

async function fetchHubspotMetadata(
  send: LeadFormFetch,
  accessToken: string,
  target: HubspotFormTarget,
  timeoutMs: number,
): Promise<unknown> {
  try {
    return await withRequestTimeout(timeoutMs, async (signal) => {
      const response = await send(
        `${HUBSPOT_API_ORIGIN}/marketing/v3/forms/${target.formId}`,
        {
          method: 'GET',
          redirect: 'manual',
          signal,
          headers: {
            authorization: `Bearer ${accessToken}`,
            accept: 'application/json',
          },
        },
      );
      if (!response.ok) {
        discardBody(response);
        throw new LeadFormError(
          'UPSTREAM_UNAVAILABLE',
          502,
          `HubSpot answered the metadata request with HTTP ${response.status}`,
        );
      }
      const metadata: unknown = JSON.parse(
        await readBoundedText(response.body, MAX_METADATA_BYTES),
      );
      if (
        !isRecord(metadata) ||
        typeof metadata.id !== 'string' ||
        metadata.id.toLowerCase() !== target.formId.toLowerCase()
      ) {
        throw new LeadFormError(
          'UPSTREAM_UNAVAILABLE',
          502,
          'HubSpot returned metadata for another form or in an unexpected shape',
        );
      }
      return metadata;
    });
  } catch (error) {
    throw error instanceof LeadFormError
      ? error
      : new LeadFormError(
          'UPSTREAM_UNAVAILABLE',
          502,
          'the HubSpot metadata request failed, timed out or was unreadable',
        );
  }
}

async function loadCurrentForm(
  resolved: ResolvedLeadFormsConfig,
  formKey: string,
  target: HubspotFormTarget,
  send: LeadFormFetch,
  timeoutMs: number,
) {
  const metadata = await fetchHubspotMetadata(
    send,
    resolved.accessToken,
    target,
    timeoutMs,
  );
  const form = normalizeHubspotForm(formKey, target, metadata);
  return {
    form,
    schemaRevision: await computeHubspotSchemaRevision(
      form,
      resolved.turnstile,
    ),
  };
}

async function postSubmission(
  send: LeadFormFetch,
  target: HubspotFormTarget,
  payload: { fields: HubspotSubmittedField[] },
  timeoutMs: number,
): Promise<void> {
  let status: number;
  try {
    status = await withRequestTimeout(timeoutMs, async (signal) => {
      const response = await send(
        `${HUBSPOT_SUBMIT_ORIGIN}/submissions/v3/integration/submit/${target.portalId}/${target.formId}`,
        {
          method: 'POST',
          redirect: 'manual',
          signal,
          headers: {
            'content-type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );
      discardBody(response);
      return response.status;
    });
  } catch {
    // The request may have reached HubSpot, so this is never reported as "not delivered".
    throw new LeadFormError(
      'DELIVERY_UNKNOWN',
      504,
      'the HubSpot submission failed or timed out and may have been delivered',
    );
  }

  if (status >= 200 && status < 300) return;
  if (status === 400) {
    throw invalid(400, 'HubSpot rejected the submission (HTTP 400)');
  }
  if (status >= 500) {
    throw new LeadFormError(
      'DELIVERY_UNKNOWN',
      504,
      `HubSpot answered the submission with HTTP ${status}`,
    );
  }
  throw new LeadFormError(
    'UPSTREAM_UNAVAILABLE',
    502,
    `HubSpot answered the submission with HTTP ${status}`,
  );
}

// --- Public entry points ---------------------------------------------------

export interface HubspotDefinitionOptions {
  formKey: unknown;
  config: unknown;
  fetch: LeadFormFetch;
  timeoutMs?: number;
}

/** GET: fetches the current metadata and returns only the public definition. */
export async function getHubspotLeadFormDefinition(
  options: HubspotDefinitionOptions,
): Promise<HubspotDefinition> {
  const { resolved, formKey, target } = resolveTarget(
    options.config,
    options.formKey,
  );
  const { form, schemaRevision } = await loadCurrentForm(
    resolved,
    formKey,
    target,
    options.fetch,
    options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS,
  );
  const { turnstile } = resolved;
  return {
    formKey,
    schemaRevision,
    fields: form.fields,
    protection: turnstile.enabled
      ? { enabled: true, siteKey: turnstile.siteKey, action: turnstile.action }
      : { enabled: false },
  };
}

export interface HubspotSubmitRequest {
  contentType?: string | undefined;
  contentLength?: string | undefined;
  /** Read lazily, and only after config, alias, content type and declared length are accepted. */
  body?: ReadableStream<Uint8Array> | null | undefined;
}

export interface HubspotSubmitOptions extends HubspotDefinitionOptions {
  request: HubspotSubmitRequest;
}

interface SubmitBody {
  schemaRevision: string;
  answers: Record<string, unknown>;
  hasConsent: boolean;
  turnstileToken: string | undefined;
}

async function readSubmitBody(
  request: HubspotSubmitRequest,
): Promise<SubmitBody> {
  const mediaType = (request.contentType ?? '')
    .split(';', 1)[0]
    ?.trim()
    .toLowerCase();
  if (mediaType !== 'application/json') {
    throw invalid(415, 'content type must be application/json');
  }

  if (request.contentLength !== undefined) {
    const declared = request.contentLength.trim();
    if (!/^[0-9]{1,15}$/.test(declared)) {
      throw invalid(400, 'content length is not a number');
    }
    if (Number(declared) > MAX_SUBMIT_BODY_BYTES) {
      throw invalid(413, 'request body is too large');
    }
  }

  // The declared length can lie, so the stream is bounded as well.
  let text: string;
  try {
    text = await readBoundedText(request.body, MAX_SUBMIT_BODY_BYTES);
  } catch (error) {
    throw error instanceof BodyTooLargeError
      ? invalid(413, 'request body is too large')
      : invalid(400, 'request body could not be read as UTF-8');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw invalid(400, 'request body is not valid JSON');
  }
  if (!isRecord(parsed)) {
    throw invalid(400, 'request body must be a JSON object');
  }
  if (Object.keys(parsed).some((key) => !SUBMIT_KEYS.has(key))) {
    throw invalid(400, 'request body has an unknown key');
  }

  const { schemaRevision, answers, turnstileToken } = parsed;
  if (
    typeof schemaRevision !== 'string' ||
    !REVISION_PATTERN.test(schemaRevision)
  ) {
    throw invalid(400, 'schemaRevision is missing or malformed');
  }
  if (!isRecord(answers)) throw invalid(400, 'answers must be an object');
  if (turnstileToken !== undefined && typeof turnstileToken !== 'string') {
    throw invalid(400, 'turnstileToken must be a string');
  }
  return {
    schemaRevision,
    answers,
    hasConsent: Object.hasOwn(parsed, 'consent'),
    turnstileToken,
  };
}

/**
 * POST: strictly parses the bounded body, then in this order re-reads the current metadata,
 * rejects a stale `schemaRevision` (409), validates the answers against the trusted definition,
 * verifies Turnstile when configured and submits once. Nothing is retried: a failed or timed-out
 * submission is DELIVERY_UNKNOWN.
 */
export async function submitHubspotLeadForm(
  options: HubspotSubmitOptions,
): Promise<{ success: true }> {
  const { fetch: send, request } = options;
  const timeoutMs = options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
  const { resolved, formKey, target } = resolveTarget(
    options.config,
    options.formKey,
  );
  const body = await readSubmitBody(request);

  const { form, schemaRevision } = await loadCurrentForm(
    resolved,
    formKey,
    target,
    send,
    timeoutMs,
  );
  if (schemaRevision !== body.schemaRevision) {
    throw new LeadFormError(
      'FORM_CHANGED',
      409,
      'the submitted schemaRevision is not the current one',
    );
  }

  // The supported subset has no consent, and a token only makes sense when protection is on.
  if (body.hasConsent) {
    throw invalid(400, 'consent was submitted but this form collects none');
  }
  const { turnstile } = resolved;
  if (!turnstile.enabled && body.turnstileToken !== undefined) {
    throw invalid(400, 'a Turnstile token was submitted but protection is off');
  }

  // The shared validator tolerates unknown value kinds at runtime and reports them as errors.
  const checked = validateLeadAnswers(form.fields, body.answers as LeadAnswers);
  if (Object.keys(checked.errors).length > 0) {
    throw invalid(400, 'answers do not match the current form definition');
  }
  // Serialize before verifying so a value HubSpot cannot represent never burns a single-use token.
  const payload = serializeHubspotSubmission(form, checked.answers);

  if (turnstile.enabled) {
    const verdict = await verifyTurnstileToken({
      token: body.turnstileToken,
      settings: turnstile,
      fetch: send,
      timeoutMs,
    });
    if (!verdict.ok) {
      throw verdict.reason === 'rejected'
        ? new LeadFormError(
            'VERIFICATION_FAILED',
            403,
            `Turnstile rejected the token${verdict.codes.length ? ` (${verdict.codes.join(',')})` : ''}`,
          )
        : new LeadFormError(
            'UPSTREAM_UNAVAILABLE',
            502,
            'Turnstile verification was unavailable',
          );
    }
  }

  await postSubmission(send, target, payload, timeoutMs);
  return { success: true };
}
