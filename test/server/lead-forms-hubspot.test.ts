// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock, MockInstance } from 'vitest';
import {
  MAX_SUBMIT_BODY_BYTES,
  computeHubspotSchemaRevision,
  getHubspotLeadFormDefinition,
  normalizeHubspotForm,
  resolveLeadFormsConfig,
  serializeHubspotSubmission,
  submitHubspotLeadForm,
  toLeadFormResponse,
} from '~/server/utils/lead-forms/hubspot';
import type { HubspotSubmitRequest } from '~/server/utils/lead-forms/hubspot';
import type { LeadFormFetch } from '~/server/utils/lead-forms/turnstile';

type Json = Record<string, any>;
type Responder = (init: RequestInit) => Response | Promise<Response>;
type Kind = 'metadata' | 'siteverify' | 'submit';

const PORTAL_ID = '4815162';
const FORM_ID = '11111111-2222-4333-8444-555555555555';
const OTHER_FORM_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const TOKEN = 'pat-na1-test-access-token';
const TURNSTILE_SECRET = 'turnstile-secret-value';
const TURNSTILE_TOKEN = 'turnstile-token-from-the-browser';
const TARGET = { portalId: PORTAL_ID, formId: FORM_ID };
const METADATA_URL = `https://api.hubapi.com/marketing/v3/forms/${FORM_ID}`;
const SUBMIT_URL = `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`;
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const NO_TURNSTILE = { enabled: false } as const;

const turnstileOn = {
  enabled: true,
  secret: TURNSTILE_SECRET,
  siteKey: '0x4AAAAAAAsitekey',
  expectedHostname: 'www.example.com',
  action: 'lead-form',
};

const baseConfig = (): Json => ({
  enabled: true,
  hubspot: {
    accessToken: TOKEN,
    forms: { contact: { portalId: PORTAL_ID, formId: FORM_ID } },
  },
  turnstile: { enabled: false, secret: '', siteKey: '', expectedHostname: '', action: '' },
});

const configWith = (mutate: (config: Json) => void): Json => {
  const config = baseConfig();
  mutate(config);
  return config;
};

const protectedConfig = () =>
  configWith((config) => {
    config.turnstile = { ...turnstileOn };
  });

// --- HubSpot v3 form definition fixtures (documented shape; not live traffic) ---

const field = (overrides: Json): Json => ({
  objectTypeId: '0-1',
  required: false,
  hidden: false,
  ...overrides,
});

const baseFields = (): Json[] => [
  field({ name: 'firstname', label: 'First name', required: true, fieldType: 'single_line_text', placeholder: 'Jamie' }),
  field({
    name: 'email',
    label: 'Email',
    required: true,
    fieldType: 'email',
    validation: { blockedEmailDomains: [], useDefaultBlockList: false },
  }),
  field({ name: 'phone', label: 'Phone', fieldType: 'phone' }),
  field({ name: 'mobilephone', label: 'Mobile phone', fieldType: 'mobile_phone' }),
  field({ name: 'num_employees', label: 'Team size', fieldType: 'number', defaultValue: '0' }),
  field({ name: 'message', label: 'Message', fieldType: 'multi_line_text', description: 'Tell us more' }),
  field({
    name: 'service',
    label: 'Service',
    required: true,
    fieldType: 'dropdown',
    options: [
      { label: 'Repair', value: 'repair', displayOrder: 0 },
      { label: 'Install', value: 'install', displayOrder: 1 },
    ],
  }),
  field({
    name: 'contact_method',
    label: 'Contact method',
    fieldType: 'radio',
    options: [
      { label: 'Email', value: 'email', displayOrder: 0 },
      { label: 'Phone call', value: 'phone_call', displayOrder: 1 },
    ],
  }),
  field({ name: 'lead_source', label: 'Lead source', hidden: true, fieldType: 'single_line_text', defaultValue: 'website' }),
];

const metadata = (mutate?: (form: Json) => void, fields: Json[] = baseFields()): Json => {
  const form: Json = {
    id: FORM_ID,
    name: 'Contact us',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
    archived: false,
    formType: 'hubspot',
    legalConsentOptions: { type: 'none' },
    displayOptions: { submitButtonText: 'Send' },
    fieldGroups: [{ groupType: 'default_group', richTextType: 'text', fields }],
  };
  mutate?.(form);
  return form;
};

const withFields = (change: (fields: Json[]) => void): Json => {
  const fields = baseFields();
  change(fields);
  return metadata(undefined, fields);
};

const patched = (name: string, patch: Json, remove: string[] = []): Json =>
  withFields((fields) => {
    const target = fields.find((entry) => entry.name === name);
    if (!target) throw new Error(`fixture has no ${name} field`);
    Object.assign(target, patch);
    for (const key of remove) Reflect.deleteProperty(target, key);
  });

const publicFields = [
  { name: 'firstname', type: 'text', label: 'First name', required: true, placeholder: 'Jamie' },
  { name: 'email', type: 'email', label: 'Email', required: true },
  { name: 'phone', type: 'phone', label: 'Phone', required: false },
  { name: 'mobilephone', type: 'phone', label: 'Mobile phone', required: false },
  { name: 'num_employees', type: 'number', label: 'Team size', required: false, defaultValue: 0 },
  { name: 'message', type: 'textarea', label: 'Message', required: false, description: 'Tell us more' },
  {
    name: 'service',
    type: 'dropdown',
    label: 'Service',
    required: true,
    options: [
      { label: 'Repair', value: 'repair' },
      { label: 'Install', value: 'install' },
    ],
  },
  {
    name: 'contact_method',
    type: 'radio',
    label: 'Contact method',
    required: false,
    options: [
      { label: 'Email', value: 'email' },
      { label: 'Phone call', value: 'phone_call' },
    ],
  },
];

const validAnswers = (): Json => ({
  firstname: 'Jamie',
  email: 'jamie@example.com',
  phone: '',
  mobilephone: '555-0102',
  num_employees: 12,
  message: 'Need a quote',
  service: 'repair',
  contact_method: 'email',
});

const expectedSubmission = [
  { objectTypeId: '0-1', name: 'firstname', value: 'Jamie' },
  { objectTypeId: '0-1', name: 'email', value: 'jamie@example.com' },
  { objectTypeId: '0-1', name: 'mobilephone', value: '555-0102' },
  { objectTypeId: '0-1', name: 'num_employees', value: '12' },
  { objectTypeId: '0-1', name: 'message', value: 'Need a quote' },
  { objectTypeId: '0-1', name: 'service', value: 'repair' },
  { objectTypeId: '0-1', name: 'contact_method', value: 'email' },
  { objectTypeId: '0-1', name: 'lead_source', value: 'website' },
];

// --- Injected upstream (HubSpot metadata, Siteverify, HubSpot submission) ---

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });

const verified = {
  success: true,
  hostname: 'www.example.com',
  action: 'lead-form',
  'error-codes': [],
};

interface Upstream {
  fetch: Mock<LeadFormFetch>;
  calls: { kind: Kind; url: string; init: RequestInit }[];
  unexpected: string[];
}

const defaults: Record<Kind, Responder> = {
  metadata: () => json(metadata()),
  siteverify: () => json(verified),
  submit: () => json({ inlineMessage: 'Thanks for submitting the form.' }),
};

const kindOf = (url: string): Kind | undefined => {
  if (url.startsWith('https://api.hubapi.com/marketing/v3/forms/')) return 'metadata';
  if (url.startsWith(SITEVERIFY_URL)) return 'siteverify';
  if (url.startsWith('https://api.hsforms.com/submissions/v3/integration/submit/')) return 'submit';
  return undefined;
};

const created: Upstream[] = [];

const createUpstream = (responders: Partial<Record<Kind, Responder>> = {}): Upstream => {
  const upstream: Upstream = { calls: [], unexpected: [], fetch: vi.fn<LeadFormFetch>() };
  upstream.fetch.mockImplementation((url, init) => {
    const kind = kindOf(url);
    if (!kind) {
      upstream.unexpected.push(url);
      return Promise.reject(new Error('unexpected upstream URL'));
    }
    upstream.calls.push({ kind, url, init });
    return Promise.resolve().then(() => (responders[kind] ?? defaults[kind])(init));
  });
  created.push(upstream);
  return upstream;
};

const order = (upstream: Upstream) => upstream.calls.map((call) => call.kind);

const hang: Responder = (init) =>
  new Promise<Response>((_resolve, reject) => {
    init.signal?.addEventListener('abort', () =>
      reject(new DOMException('The operation was aborted.', 'AbortError')),
    );
  });

const failure = (error: unknown): Responder => () => {
  throw error;
};

// --- Request helpers ---

const streamOf = (text: string, chunkSize = 4096): ReadableStream<Uint8Array> => {
  const bytes = new TextEncoder().encode(text);
  let offset = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (offset >= bytes.length) {
        controller.close();
        return;
      }
      controller.enqueue(bytes.slice(offset, offset + chunkSize));
      offset += chunkSize;
    },
  });
};

const request = (
  body: unknown,
  overrides: Partial<HubspotSubmitRequest> = {},
): HubspotSubmitRequest => ({
  contentType: 'application/json',
  body: streamOf(typeof body === 'string' ? body : JSON.stringify(body)),
  ...overrides,
});

const untouchedRequest = (extra: Partial<HubspotSubmitRequest> = {}) => {
  const state = { reads: 0 };
  const req: HubspotSubmitRequest = {
    contentType: 'application/json',
    ...extra,
    // A getter: spreading `req` elsewhere would read it, so pass overrides in through `extra`.
    get body() {
      state.reads += 1;
      return streamOf('{}');
    },
  };
  return { req, state };
};

const caught = (promise: Promise<unknown>) =>
  promise.then(
    () => undefined,
    (error: unknown) => error,
  );

const thrown = (fn: () => unknown): unknown => {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error('Expected the function to throw');
};

// Rest arguments, not default parameters: an explicit `undefined` config or key must stay
// `undefined` instead of silently becoming the valid default.
const getDefinition = (
  upstream: Upstream,
  ...args: [config?: unknown, formKey?: unknown, timeoutMs?: number]
) => {
  const [config, formKey, timeoutMs] = args;
  return getHubspotLeadFormDefinition({
    formKey: args.length > 1 ? formKey : 'contact',
    config: args.length > 0 ? config : baseConfig(),
    fetch: upstream.fetch,
    ...(timeoutMs === undefined ? {} : { timeoutMs }),
  });
};

// Captured before any test installs fake timers.
const realSetTimeout = globalThis.setTimeout;

// Fake timers do not cover native Web Crypto, so the revision digest settles on a real event-loop
// turn. A hung request's timeout only starts once it is issued: wait for that, in real time,
// before advancing the fake clock.
const untilIssued = async (issued: () => boolean) => {
  for (let turn = 0; turn < 500 && !issued(); turn += 1) {
    await new Promise<void>((resolve) => realSetTimeout(resolve, 2));
  }
  expect(issued()).toBe(true);
};

const revisionOf = async (config: unknown = baseConfig(), meta: Json = metadata(), formKey = 'contact') => {
  const upstream = createUpstream({ metadata: () => json(meta) });
  return (await getDefinition(upstream, config, formKey)).schemaRevision;
};

const submitWith = (
  upstream: Upstream,
  req: HubspotSubmitRequest,
  options: { config?: unknown; formKey?: unknown; timeoutMs?: number } = {},
) =>
  submitHubspotLeadForm({
    formKey: 'formKey' in options ? options.formKey : 'contact',
    config: 'config' in options ? options.config : baseConfig(),
    fetch: upstream.fetch,
    request: req,
    ...(options.timeoutMs === undefined ? {} : { timeoutMs: options.timeoutMs }),
  });

const validBody = async (config: unknown = baseConfig(), extra: Json = {}) => ({
  schemaRevision: await revisionOf(config),
  answers: validAnswers(),
  ...extra,
});

let consoles: MockInstance[] = [];
const logged = () => JSON.stringify(consoles.flatMap((spy) => spy.mock.calls));

beforeEach(() => {
  consoles = (['log', 'info', 'warn', 'error', 'debug'] as const).map((level) =>
    vi.spyOn(console, level).mockImplementation(() => {}),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  const strays = created.flatMap((upstream) => upstream.unexpected);
  created.length = 0;
  expect(strays).toEqual([]);
});

// ---------------------------------------------------------------------------

describe('resolveLeadFormsConfig', () => {
  // Disabled, missing and unreadable config all mean "not configured": 503, never a 404.
  const notEnabled: [string, unknown][] = [
    ['an undefined config', undefined],
    ['a null config', null],
    ['an empty config', {}],
    ['a non-object config', 'enabled'],
    ['an array config', []],
    ['an explicitly disabled complete config', { ...baseConfig(), enabled: false }],
    ['a string "false" flag', { ...baseConfig(), enabled: 'false' }],
    ['a numeric flag', { ...baseConfig(), enabled: 1 }],
    ['a misspelled flag', { ...baseConfig(), enabled: 'tru' }],
    ['a missing flag', configWith((c) => { delete c.enabled; })],
  ];

  const inconsistent: [string, unknown][] = [
    ['a missing HubSpot section', configWith((c) => { delete c.hubspot; })],
    ['an empty access token', configWith((c) => { c.hubspot.accessToken = ''; })],
    ['a non-string access token', configWith((c) => { c.hubspot.accessToken = 42; })],
    ['an access token containing whitespace', configWith((c) => { c.hubspot.accessToken = 'pat na1 token'; })],
    ['no configured forms', configWith((c) => { c.hubspot.forms = {}; })],
    ['forms that are not an object', configWith((c) => { c.hubspot.forms = 'contact'; })],
    ['an alias containing spaces', configWith((c) => { c.hubspot.forms = { 'bad alias': TARGET }; })],
    ['an alias starting with a digit', configWith((c) => { c.hubspot.forms = { '1abc': TARGET }; })],
    ['an own __proto__ alias', configWith((c) => { c.hubspot.forms = { ['__proto__']: TARGET }; })],
    ['an overlong alias', configWith((c) => { c.hubspot.forms = { [`a${'b'.repeat(64)}`]: TARGET }; })],
    ['a target that is not an object', configWith((c) => { c.hubspot.forms.contact = 'target'; })],
    ['an empty portal ID', configWith((c) => { c.hubspot.forms.contact.portalId = ''; })],
    ['a non-numeric portal ID', configWith((c) => { c.hubspot.forms.contact.portalId = 'abc123'; })],
    ['a negative portal ID', configWith((c) => { c.hubspot.forms.contact.portalId = '-1'; })],
    ['an overlong portal ID', configWith((c) => { c.hubspot.forms.contact.portalId = '1'.repeat(16); })],
    ['an empty form ID', configWith((c) => { c.hubspot.forms.contact.formId = ''; })],
    ['a form ID that is not a GUID', configWith((c) => { c.hubspot.forms.contact.formId = 'not-a-guid'; })],
    ['a form ID carrying a path', configWith((c) => { c.hubspot.forms.contact.formId = `${FORM_ID}/../x`; })],
    ['a second alias that is invalid', configWith((c) => { c.hubspot.forms.sales = { portalId: '', formId: FORM_ID }; })],
    ['enabled Turnstile without a secret', configWith((c) => { c.turnstile = { ...turnstileOn, secret: '' }; })],
    ['enabled Turnstile without a site key', configWith((c) => { c.turnstile = { ...turnstileOn, siteKey: '' }; })],
    ['enabled Turnstile without a hostname', configWith((c) => { c.turnstile = { ...turnstileOn, expectedHostname: '' }; })],
    ['enabled Turnstile with a URL as hostname', configWith((c) => { c.turnstile = { ...turnstileOn, expectedHostname: 'https://www.example.com' }; })],
    ['enabled Turnstile without an action', configWith((c) => { c.turnstile = { ...turnstileOn, action: '' }; })],
    ['enabled Turnstile with an invalid action', configWith((c) => { c.turnstile = { ...turnstileOn, action: 'not valid!' }; })],
    // Fail closed: an unreadable protection policy must never be read as "protection off".
    ['a missing Turnstile policy', configWith((c) => { delete c.turnstile; })],
    ['a null Turnstile policy', configWith((c) => { c.turnstile = null; })],
    ['a non-object Turnstile policy', configWith((c) => { c.turnstile = 'on'; })],
    ['an empty Turnstile policy', configWith((c) => { c.turnstile = {}; })],
    ['a Turnstile policy without a flag', configWith((c) => { c.turnstile = { ...turnstileOn, enabled: undefined }; })],
    ['a numeric Turnstile flag', configWith((c) => { c.turnstile = { ...turnstileOn, enabled: 1 }; })],
    ['a misspelled Turnstile flag', configWith((c) => { c.turnstile = { ...turnstileOn, enabled: 'tru' }; })],
    ['an upper-case Turnstile flag', configWith((c) => { c.turnstile = { ...turnstileOn, enabled: 'TRUE' }; })],
    ['an empty-string Turnstile flag', configWith((c) => { c.turnstile = { ...turnstileOn, enabled: '' }; })],
  ];

  it.each(notEnabled)('treats %s as not configured (503 NOT_CONFIGURED)', (_label, raw) => {
    expect(thrown(() => resolveLeadFormsConfig(raw))).toMatchObject({
      code: 'NOT_CONFIGURED',
      status: 503,
    });
  });

  it.each(inconsistent)('rejects %s as misconfigured (503 NOT_CONFIGURED)', (_label, raw) => {
    const error = thrown(() => resolveLeadFormsConfig(raw));

    expect(error).toMatchObject({ code: 'NOT_CONFIGURED', status: 503 });
    expect(String(error)).not.toContain(TOKEN);
    expect(String(error)).not.toContain(TURNSTILE_SECRET);
  });

  it('accepts a complete config and normalizes env-provided string and numeric values', () => {
    const resolved = resolveLeadFormsConfig({
      enabled: 'true',
      hubspot: {
        accessToken: `  ${TOKEN}  `,
        forms: {
          contact: { portalId: 4815162, formId: FORM_ID },
          sales: { portalId: PORTAL_ID, formId: OTHER_FORM_ID.toUpperCase() },
        },
      },
      turnstile: { enabled: 'false' },
    });

    expect(resolved.accessToken).toBe(TOKEN);
    expect(resolved.forms.get('contact')).toEqual(TARGET);
    expect(resolved.forms.get('sales')).toEqual({ portalId: PORTAL_ID, formId: OTHER_FORM_ID.toUpperCase() });
    expect(resolved.forms.size).toBe(2);
    expect(resolved.turnstile).toEqual(NO_TURNSTILE);
  });

  it('keeps Turnstile disabled when explicitly turned off even if values are present', () => {
    const resolved = resolveLeadFormsConfig(
      configWith((c) => { c.turnstile = { ...turnstileOn, enabled: false }; }),
    );

    expect(resolved.turnstile).toEqual(NO_TURNSTILE);
  });

  it('resolves a complete enabled Turnstile policy', () => {
    expect(resolveLeadFormsConfig(protectedConfig()).turnstile).toEqual(turnstileOn);
  });

  it('only resolves own, well-formed aliases', () => {
    const resolved = resolveLeadFormsConfig(baseConfig());

    for (const alias of ['constructor', 'toString', '__proto__', 'hasOwnProperty']) {
      expect(resolved.forms.get(alias)).toBeUndefined();
    }
  });
});

describe('disabled or misconfigured adapters make zero upstream requests', () => {
  const unusable: [string, unknown][] = [
    ['missing config', undefined],
    ['an empty config', {}],
    ['a disabled config', { ...baseConfig(), enabled: false }],
    ['a missing access token', configWith((c) => { c.hubspot.accessToken = ''; })],
    ['an invalid portal ID', configWith((c) => { c.hubspot.forms.contact.portalId = 'abc'; })],
    ['incomplete Turnstile settings', configWith((c) => { c.turnstile = { ...turnstileOn, secret: '' }; })],
    // An enabled adapter must never run without Siteverify because its protection flag is unreadable.
    ['a missing Turnstile policy', configWith((c) => { delete c.turnstile; })],
    ['a Turnstile policy without a flag', configWith((c) => { c.turnstile = { ...turnstileOn, enabled: undefined }; })],
    ['a numeric Turnstile flag', configWith((c) => { c.turnstile = { ...turnstileOn, enabled: 1 }; })],
    ['a misspelled Turnstile flag', configWith((c) => { c.turnstile = { ...turnstileOn, enabled: 'tru' }; })],
  ];

  it.each(unusable)('GET with %s', async (_label, config) => {
    const upstream = createUpstream();

    const error = await caught(getDefinition(upstream, config));

    expect(error).toMatchObject({ code: 'NOT_CONFIGURED', status: 503 });
    expect(upstream.fetch).not.toHaveBeenCalled();
  });

  it.each(unusable)('POST with %s', async (_label, config) => {
    const upstream = createUpstream();
    const { req, state } = untouchedRequest();

    const error = await caught(submitWith(upstream, req, { config }));

    expect(error).toMatchObject({ code: 'NOT_CONFIGURED', status: 503 });
    expect(upstream.fetch).not.toHaveBeenCalled();
    expect(state.reads).toBe(0);
  });

  it('answers 503 for disabled, missing and inconsistent config and 404 only for an unknown alias', async () => {
    const upstream = createUpstream();

    await expect(getDefinition(upstream, {})).rejects.toMatchObject({ status: 503 });
    await expect(getDefinition(upstream, undefined)).rejects.toMatchObject({ status: 503 });
    await expect(
      getDefinition(upstream, { ...baseConfig(), enabled: false }),
    ).rejects.toMatchObject({ status: 503 });
    await expect(
      getDefinition(upstream, configWith((c) => { c.hubspot.accessToken = ''; })),
    ).rejects.toMatchObject({ status: 503 });
    // Configuration is validated before the alias, so a bad config never reads as "unknown alias".
    await expect(getDefinition(upstream, {}, 'unknown')).rejects.toMatchObject({ status: 503 });
    await expect(
      getDefinition(upstream, baseConfig(), 'unknown'),
    ).rejects.toMatchObject({ code: 'NOT_CONFIGURED', status: 404 });
    expect(upstream.fetch).not.toHaveBeenCalled();
  });
});

describe('unknown form keys', () => {
  const keys: [string, unknown][] = [
    ['an unconfigured alias', 'unknown'],
    ['an empty alias', ''],
    ['a different-case alias', 'CONTACT'],
    ['__proto__', '__proto__'],
    ['constructor', 'constructor'],
    ['toString', 'toString'],
    ['a path-like alias', 'contact/../x'],
    ['an alias with a query string', 'contact?x=1'],
    ['a portal-form GUID', FORM_ID],
    ['undefined', undefined],
    ['a number', 42],
    ['an object', {}],
    ['an array', ['contact']],
  ];

  it.each(keys)('404s %s without any upstream request after config validation', async (_label, formKey) => {
    const upstream = createUpstream();

    await expect(getDefinition(upstream, baseConfig(), formKey)).rejects.toMatchObject({
      code: 'NOT_CONFIGURED',
      status: 404,
    });
    await expect(
      submitWith(upstream, request({}), { formKey }),
    ).rejects.toMatchObject({ code: 'NOT_CONFIGURED', status: 404 });
    expect(upstream.fetch).not.toHaveBeenCalled();
  });
});

describe('getHubspotLeadFormDefinition', () => {
  it('fetches the configured form with the private token and returns only the public definition', async () => {
    const upstream = createUpstream();

    const definition = await getDefinition(upstream);

    expect(order(upstream)).toEqual(['metadata']);
    const call = upstream.calls[0]!;
    expect(call.url).toBe('https://api.hubapi.com/marketing/v3/forms/11111111-2222-4333-8444-555555555555');
    expect(call.url).toBe(METADATA_URL);
    expect(call.init.method).toBe('GET');
    expect(call.init.redirect).toBe('manual');
    expect(call.init.signal).toBeInstanceOf(AbortSignal);
    expect(call.init.body).toBeUndefined();
    const headers = new Headers(call.init.headers);
    expect(headers.get('authorization')).toBe(`Bearer ${TOKEN}`);
    expect(headers.get('accept')).toBe('application/json');

    expect(definition).toEqual({
      formKey: 'contact',
      schemaRevision: expect.stringMatching(/^[0-9a-f]{64}$/),
      fields: publicFields,
      protection: { enabled: false },
    });
    expect(Object.keys(definition).sort()).toEqual(['fields', 'formKey', 'protection', 'schemaRevision']);
  });

  it('maps every supported HubSpot field type and drops hidden fields from the public definition', async () => {
    const definition = await getDefinition(createUpstream());

    expect(definition.fields.map((entry) => [entry.name, entry.type])).toEqual([
      ['firstname', 'text'],
      ['email', 'email'],
      ['phone', 'phone'],
      ['mobilephone', 'phone'],
      ['num_employees', 'number'],
      ['message', 'textarea'],
      ['service', 'dropdown'],
      ['contact_method', 'radio'],
    ]);
  });

  it('never exposes private bindings, hidden defaults, IDs, credentials or the raw response', async () => {
    const definition = await getDefinition(createUpstream(), protectedConfig());
    const text = JSON.stringify(definition);

    for (const secret of [
      FORM_ID,
      PORTAL_ID,
      TOKEN,
      TURNSTILE_SECRET,
      'objectTypeId',
      '0-1',
      'lead_source',
      'website',
      'hidden',
      'Contact us',
      'displayOptions',
      'submitButtonText',
      'legalConsentOptions',
      'expectedHostname',
      'www.example.com',
    ]) {
      expect(text).not.toContain(secret);
    }
  });

  it('advertises coherent per-definition protection when Turnstile is enabled', async () => {
    const definition = await getDefinition(createUpstream(), protectedConfig());

    expect(definition.protection).toEqual({
      enabled: true,
      siteKey: turnstileOn.siteKey,
      action: turnstileOn.action,
    });
  });

  it('keeps identical output for identical upstream metadata and accepts a case-different form ID', async () => {
    const first = await getDefinition(createUpstream());
    const second = await getDefinition(createUpstream());
    const upper = await getDefinition(
      createUpstream({ metadata: () => json(metadata((form) => { form.id = FORM_ID.toUpperCase(); })) }),
    );

    expect(second).toEqual(first);
    expect(upper.fields).toEqual(first.fields);
  });

  describe('upstream failures', () => {
    it.each([401, 403, 404, 429, 500, 503])(
      'maps HTTP %i from HubSpot to UPSTREAM_UNAVAILABLE without leaking the body',
      async (status) => {
        const upstream = createUpstream({
          metadata: () => json({ message: `leak ${TOKEN} jamie@example.com` }, { status }),
        });

        const error = await caught(getDefinition(upstream));

        expect(error).toMatchObject({ code: 'UPSTREAM_UNAVAILABLE', status: 502 });
        expect(JSON.stringify(toLeadFormResponse(error))).not.toMatch(/leak|jamie|pat-na1/);
        expect(upstream.fetch).toHaveBeenCalledTimes(1);
      },
    );

    it('does not follow redirects', async () => {
      const upstream = createUpstream({
        metadata: () =>
          new Response(null, { status: 302, headers: { location: 'https://evil.example/steal' } }),
      });

      await expect(getDefinition(upstream)).rejects.toMatchObject({ code: 'UPSTREAM_UNAVAILABLE' });
      expect(upstream.fetch).toHaveBeenCalledTimes(1);
      expect(upstream.calls[0]!.init.redirect).toBe('manual');
    });

    it.each([
      ['a network error', failure(new TypeError('fetch failed'))],
      ['invalid JSON', () => new Response('<html>nope</html>', { status: 200 })],
      ['a JSON array', () => json([])],
      ['a JSON null', () => json(null)],
      ['a different form ID', () => json(metadata((form) => { form.id = OTHER_FORM_ID; }))],
      ['a missing form ID', () => json(metadata((form) => { delete form.id; }))],
      [
        'a response above the metadata size cap',
        () => json(metadata((form) => { form.padding = 'x'.repeat(1_100_000); })),
      ],
    ])('maps %s to UPSTREAM_UNAVAILABLE', async (_label, responder) => {
      const upstream = createUpstream({ metadata: responder });

      await expect(getDefinition(upstream)).rejects.toMatchObject({
        code: 'UPSTREAM_UNAVAILABLE',
        status: 502,
      });
    });

    it('aborts a hung metadata request after the default ten second bound', async () => {
      vi.useFakeTimers();
      const upstream = createUpstream({ metadata: hang });

      const outcome = caught(getDefinition(upstream));
      await vi.advanceTimersByTimeAsync(9_999);
      expect(upstream.calls[0]!.init.signal?.aborted).toBe(false);
      await vi.advanceTimersByTimeAsync(1);

      expect(await outcome).toMatchObject({ code: 'UPSTREAM_UNAVAILABLE', status: 502 });
      expect(upstream.calls[0]!.init.signal?.aborted).toBe(true);
      expect(upstream.fetch).toHaveBeenCalledTimes(1);
    });

    it('honours an injected timeout', async () => {
      vi.useFakeTimers();
      const upstream = createUpstream({ metadata: hang });

      const outcome = caught(getDefinition(upstream, baseConfig(), 'contact', 500));
      await vi.advanceTimersByTimeAsync(500);

      expect(await outcome).toMatchObject({ code: 'UPSTREAM_UNAVAILABLE' });
    });
  });
});

describe('unsupported HubSpot definitions are rejected whole', () => {
  const choiceOptions = [
    { label: 'One', value: 'one', displayOrder: 0 },
    { label: 'Two', value: 'two', displayOrder: 1 },
  ];
  const extra = (overrides: Json): Json => field({ name: 'extra', label: 'Extra', fieldType: 'single_line_text', ...overrides });
  const add = (overrides: Json) => withFields((fields) => { fields.push(extra(overrides)); });
  const consent = (type: unknown): Json =>
    metadata((form) => {
      form.legalConsentOptions = {
        type,
        consentToProcessText: 'I agree to the processing of my data.',
        communicationConsentText: 'I agree to receive communications.',
        subscriptionTypeIds: [1234],
        lawfulBasis: 'lead',
      };
    });
  const hidden = (overrides: Json) => add({ hidden: true, ...overrides });

  const unsupported: [string, () => Json][] = [
    ['a single_checkbox field', () => add({ fieldType: 'single_checkbox' })],
    ['a multiple_checkboxes field', () => add({ fieldType: 'multiple_checkboxes', options: choiceOptions })],
    ['a hidden single_checkbox field', () => hidden({ fieldType: 'single_checkbox', defaultValue: 'true' })],
    ['a datepicker field', () => add({ fieldType: 'datepicker' })],
    ['a file field', () => add({ fieldType: 'file' })],
    ['a payment_link_radio field', () => add({ fieldType: 'payment_link_radio', options: choiceOptions })],
    ['an unknown field type', () => add({ fieldType: 'future_type' })],
    ['a prototype-key field type', () => add({ fieldType: 'constructor' })],
    ['a missing field type', () => add({ fieldType: undefined })],
    ['explicit consent', () => consent('explicit_consent_to_process')],
    ['implicit consent', () => consent('implicit_consent_to_process')],
    ['legitimate interest consent', () => consent('legitimate_interest')],
    ['an unknown consent type', () => consent('future_consent')],
    ['a non-string consent type', () => consent(5)],
    ['missing consent options', () => metadata((form) => { delete form.legalConsentOptions; })],
    ['empty consent options', () => metadata((form) => { form.legalConsentOptions = {}; })],
    ['a dependent (conditional) field', () => add({ dependentFieldFilters: [{ filters: [], dependentFieldNames: ['firstname'], formFieldAction: 'DISPLAY' }] })],
    ['a progressive field group', () => metadata((form) => { form.fieldGroups[0].groupType = 'progressive'; })],
    ['a dependent field group', () => metadata((form) => { form.fieldGroups[0].groupType = 'dependent_field'; })],
    ['a field group without a type', () => metadata((form) => { delete form.fieldGroups[0].groupType; })],
    ['a rich text group', () => metadata((form) => { form.fieldGroups[0].richText = '<p>Legal notice</p>'; })],
    ['no field groups', () => metadata((form) => { form.fieldGroups = []; })],
    ['field groups that are not an array', () => metadata((form) => { form.fieldGroups = {}; })],
    ['a group that is not an object', () => metadata((form) => { form.fieldGroups = ['group']; })],
    ['an archived form', () => metadata((form) => { form.archived = true; })],
    ['a non-HubSpot form type', () => metadata((form) => { form.formType = 'captured'; })],
    ['a missing form type', () => metadata((form) => { delete form.formType; })],
    ['a hidden field without a default', () => hidden({})],
    ['a hidden field with an empty default', () => hidden({ defaultValue: '' })],
    ['a hidden field with a non-string default', () => hidden({ defaultValue: 5 })],
    ['a hidden dropdown default that is not an option', () => hidden({ fieldType: 'dropdown', options: choiceOptions, defaultValue: 'three' })],
    ['a hidden email default that is not an email', () => hidden({ fieldType: 'email', defaultValue: 'not-an-email' })],
    ['a hidden number default that is not numeric', () => hidden({ fieldType: 'number', defaultValue: 'abc' })],
    ['a form with only hidden fields', () => metadata(undefined, [extra({ hidden: true, defaultValue: 'x' })])],
    ['a name duplicated across object types', () => add({ name: 'email', objectTypeId: '0-2', fieldType: 'email' })],
    ['a hidden field duplicating a visible name', () => hidden({ name: 'firstname', defaultValue: 'x' })],
    ['an unsafe field name', () => add({ name: '__proto__' })],
    ['a field name starting with a digit', () => add({ name: '1st' })],
    ['a field name with a space', () => add({ name: 'has space' })],
    ['a missing field name', () => add({ name: undefined })],
    ['a missing objectTypeId', () => add({ objectTypeId: undefined })],
    ['a malformed objectTypeId', () => add({ objectTypeId: 'contacts' })],
    ['an empty label', () => add({ label: '   ' })],
    ['a non-boolean required flag', () => add({ required: 'yes' })],
    ['a non-boolean hidden flag', () => add({ hidden: 'no' })],
    ['a dropdown without options', () => add({ fieldType: 'dropdown' })],
    ['a dropdown with empty options', () => add({ fieldType: 'dropdown', options: [] })],
    ['an option with an empty value', () => add({ fieldType: 'radio', options: [{ label: 'None', value: '' }, ...choiceOptions] })],
    ['an option without a label', () => add({ fieldType: 'radio', options: [{ value: 'one' }] })],
    ['duplicate option values', () => add({ fieldType: 'dropdown', options: [choiceOptions[0], choiceOptions[0]] })],
    ['a hidden option', () => add({ fieldType: 'dropdown', options: [{ ...choiceOptions[0], hidden: true }, choiceOptions[1]] })],
    ['options on a text field', () => add({ options: choiceOptions })],
    ['an email domain blocklist', () => patched('email', { validation: { blockedEmailDomains: ['gmail.com'], useDefaultBlockList: false } })],
    ['the default email blocklist', () => patched('email', { validation: { blockedEmailDomains: [], useDefaultBlockList: true } })],
    ['phone digit bounds', () => patched('phone', { validation: { minAllowedDigits: 7, maxAllowedDigits: 20 } })],
    ['number validation', () => patched('num_employees', { validation: { min: 0 } })],
    ['a validation shape that is not an object', () => patched('firstname', { validation: 'strict' })],
    ['a non-numeric visible number default', () => patched('num_employees', { defaultValue: 'abc' })],
    ['a visible dropdown default that is not an option', () => patched('service', { defaultValue: 'three' })],
    ['a non-string visible default', () => patched('firstname', { defaultValue: 7 })],
    [
      'more than 100 fields',
      () =>
        metadata(
          undefined,
          Array.from({ length: 101 }, (_unused, index) =>
            field({ name: `field_${index}`, label: `Field ${index}`, fieldType: 'single_line_text' }),
          ),
        ),
    ],
  ];

  it.each(unsupported)('rejects %s with an explicit UNSUPPORTED_FORM reason', async (_label, make) => {
    const upstream = createUpstream({ metadata: () => json(make()) });

    const error = await caught(getDefinition(upstream));

    expect(error).toMatchObject({ code: 'UNSUPPORTED_FORM', status: 422 });
    expect((error as { reason: string }).reason).toEqual(expect.stringMatching(/\S/));
    expect(toLeadFormResponse(error)).toEqual({ status: 422, body: { code: 'UNSUPPORTED_FORM' } });
    expect(upstream.fetch).toHaveBeenCalledTimes(1);
  });

  it('never returns a partial definition after dropping the unsupported field', async () => {
    const upstream = createUpstream({
      metadata: () => json(add({ fieldType: 'multiple_checkboxes', options: choiceOptions })),
    });

    const outcome = await caught(getDefinition(upstream));

    expect(outcome).toMatchObject({ code: 'UNSUPPORTED_FORM' });
    expect(outcome).not.toHaveProperty('fields');
  });

  it('accepts a hidden field of a supported type with a valid server-held default', async () => {
    const upstream = createUpstream({
      metadata: () =>
        json(
          withFields((fields) => {
            fields.push(
              field({ name: 'region', label: 'Region', hidden: true, fieldType: 'dropdown', options: choiceOptions, defaultValue: 'two' }),
              field({ name: 'seats', label: 'Seats', hidden: true, fieldType: 'number', defaultValue: '5' }),
            );
          }),
        ),
    });

    const definition = await getDefinition(upstream);

    expect(definition.fields).toEqual(publicFields);
  });
});

describe('schemaRevision', () => {
  const sensitive: [string, () => { config?: unknown; meta?: Json; formKey?: string }][] = [
    ['configured alias', () => ({ config: configWith((c) => { c.hubspot.forms = { sales: { portalId: PORTAL_ID, formId: FORM_ID } }; }), formKey: 'sales' })],
    ['portal ID', () => ({ config: configWith((c) => { c.hubspot.forms.contact.portalId = '7654321'; }) })],
    ['form ID', () => ({ config: configWith((c) => { c.hubspot.forms.contact.formId = OTHER_FORM_ID; }), meta: metadata((f) => { f.id = OTHER_FORM_ID; }) })],
    ['objectTypeId', () => ({ meta: patched('phone', { objectTypeId: '0-2' }) })],
    ['field name', () => ({ meta: patched('phone', { name: 'phone_number' }) })],
    ['HubSpot field type behind the same generic type', () => ({ meta: patched('phone', { fieldType: 'mobile_phone' }) })],
    ['required flag', () => ({ meta: patched('phone', { required: true }) })],
    ['label', () => ({ meta: patched('phone', { label: 'Phone number' }) })],
    ['placeholder', () => ({ meta: patched('phone', { placeholder: '555-0100' }) })],
    ['description', () => ({ meta: patched('phone', { description: 'Best number to reach you' }) })],
    ['visible default', () => ({ meta: patched('num_employees', { defaultValue: '1' }) })],
    ['option value', () => ({ meta: patched('service', { options: [{ label: 'Repair', value: 'fix' }, { label: 'Install', value: 'install' }] }) })],
    ['option label', () => ({ meta: patched('service', { options: [{ label: 'Repairs', value: 'repair' }, { label: 'Install', value: 'install' }] }) })],
    ['removed option', () => ({ meta: patched('service', { options: [{ label: 'Repair', value: 'repair' }] }) })],
    ['option order', () => ({ meta: patched('service', { options: [{ label: 'Install', value: 'install' }, { label: 'Repair', value: 'repair' }] }) })],
    ['hidden default', () => ({ meta: patched('lead_source', { defaultValue: 'referral' }) })],
    ['hidden field name', () => ({ meta: patched('lead_source', { name: 'lead_origin' }) })],
    ['hidden objectTypeId', () => ({ meta: patched('lead_source', { objectTypeId: '0-2' }) })],
    ['hidden field added', () => ({ meta: withFields((f) => { f.push(field({ name: 'utm', label: 'UTM', hidden: true, fieldType: 'single_line_text', defaultValue: 'x' })); }) })],
    ['hidden field removed', () => ({ meta: withFields((f) => { f.pop(); }) })],
    ['field order', () => ({ meta: withFields((f) => { const first = f[0]!; f[0] = f[1]!; f[1] = first; }) })],
    ['Turnstile enabled', () => ({ config: protectedConfig() })],
  ];

  it('is a stable SHA-256 hex digest', async () => {
    const first = await revisionOf();

    expect(first).toMatch(/^[0-9a-f]{64}$/);
    expect(await revisionOf()).toBe(first);
  });

  it.each(sensitive)('changes when the %s changes', async (_label, make) => {
    const baseline = await revisionOf();
    const { config, meta, formKey } = make();

    expect(await revisionOf(config, meta, formKey)).not.toBe(baseline);
  });

  it.each([
    ['site key', { siteKey: '0x4AAAAAAAothersite' }],
    ['action', { action: 'other-action' }],
    ['expected hostname', { expectedHostname: 'other.example.com' }],
  ])('changes when the Turnstile %s changes', async (_label, change) => {
    const baseline = await revisionOf(protectedConfig());
    const changed = configWith((c) => { c.turnstile = { ...turnstileOn, ...change }; });

    expect(await revisionOf(changed)).not.toBe(baseline);
  });

  it('does not depend on secrets or on metadata that cannot change a submission', async () => {
    const baseline = await revisionOf(protectedConfig());

    const otherToken = protectedConfig();
    otherToken.hubspot.accessToken = 'pat-na1-a-different-token';
    expect(await revisionOf(otherToken)).toBe(baseline);

    const otherSecret = configWith((c) => { c.turnstile = { ...turnstileOn, secret: 'a-different-turnstile-secret' }; });
    expect(await revisionOf(otherSecret)).toBe(baseline);

    const cosmetic = metadata((form) => {
      form.name = 'Renamed internally';
      form.updatedAt = '2027-01-01T00:00:00.000Z';
      form.displayOptions = { submitButtonText: 'Go' };
    });
    expect(await revisionOf(protectedConfig(), cosmetic)).toBe(baseline);
  });

  it('is exposed by the pure helper and matches the published revision', async () => {
    const form = normalizeHubspotForm('contact', TARGET, metadata());

    expect(await computeHubspotSchemaRevision(form, NO_TURNSTILE)).toBe(await revisionOf());
    expect(await computeHubspotSchemaRevision(form, turnstileOn)).toBe(await revisionOf(protectedConfig()));
  });
});

describe('serializeHubspotSubmission', () => {
  const form = () => normalizeHubspotForm('contact', TARGET, metadata());

  it('serializes objectTypeId, name and string value in HubSpot order and injects hidden defaults', () => {
    expect(serializeHubspotSubmission(form(), validAnswers())).toEqual({ fields: expectedSubmission });
  });

  it('keeps the normalized form consistent with the public definition', () => {
    expect(form().fields).toEqual(publicFields);
    expect(form().bindings).toHaveLength(9);
    expect(form().portalId).toBe(PORTAL_ID);
    expect(form().formId).toBe(FORM_ID);
  });

  it.each([
    [0, '0'],
    [-3, '-3'],
    [12, '12'],
    [2.5, '2.5'],
    [-0, '0'],
    [1234567890123, '1234567890123'],
  ])('serializes the number %s as the decimal string %s', (value, text) => {
    const { fields } = serializeHubspotSubmission(form(), { ...validAnswers(), num_employees: value });

    expect(fields.find((entry) => entry.name === 'num_employees')).toEqual({
      objectTypeId: '0-1',
      name: 'num_employees',
      value: text,
    });
  });

  it.each([1e21, 1e-7, Number.NaN, Number.POSITIVE_INFINITY])(
    'refuses a number that has no plain decimal form (%s)',
    (value) => {
      expect(
        thrown(() => serializeHubspotSubmission(form(), { ...validAnswers(), num_employees: value })),
      ).toMatchObject({ code: 'INVALID_SUBMISSION' });
    },
  );

  it('omits empty and absent optional answers but keeps required and hidden values', () => {
    const { fields } = serializeHubspotSubmission(form(), {
      firstname: 'Jamie',
      email: 'jamie@example.com',
      service: 'repair',
      message: '',
    });

    expect(fields.map((entry) => entry.name)).toEqual(['firstname', 'email', 'service', 'lead_source']);
  });

  it('preserves unicode and surrounding whitespace exactly', () => {
    const { fields } = serializeHubspotSubmission(form(), {
      ...validAnswers(),
      firstname: ' Zoë  O’Neil ✓ ',
    });

    expect(fields[0]).toEqual({ objectTypeId: '0-1', name: 'firstname', value: ' Zoë  O’Neil ✓ ' });
  });

  it('never lets answers override hidden values, add unknown fields or read inherited properties', () => {
    const inherited = Object.create({ phone: 'inherited' }) as Json;
    Object.assign(inherited, validAnswers(), { lead_source: 'evil', extra: 'x', objectTypeId: '0-9' });

    const { fields } = serializeHubspotSubmission(form(), inherited);

    expect(fields).toEqual(expectedSubmission);
  });

  it('refuses answer kinds the supported subset cannot represent', () => {
    for (const value of [true, ['repair'], {}, null]) {
      expect(
        thrown(() => serializeHubspotSubmission(form(), { ...validAnswers(), message: value as never })),
      ).toMatchObject({ code: 'INVALID_SUBMISSION' });
    }
  });
});

describe('submitHubspotLeadForm', () => {
  it('submits validated answers plus server-held hidden defaults to the configured HubSpot form only', async () => {
    const upstream = createUpstream();

    const result = await submitWith(upstream, request(await validBody()));

    expect(result).toEqual({ success: true });
    expect(order(upstream)).toEqual(['metadata', 'submit']);
    const call = upstream.calls[1]!;
    expect(call.url).toBe('https://api.hsforms.com/submissions/v3/integration/submit/4815162/11111111-2222-4333-8444-555555555555');
    expect(call.url).toBe(SUBMIT_URL);
    expect(call.init.method).toBe('POST');
    expect(call.init.redirect).toBe('manual');
    expect(call.init.signal).toBeInstanceOf(AbortSignal);
    const headers = new Headers(call.init.headers);
    expect(headers.get('content-type')).toBe('application/json');
    expect(headers.has('authorization')).toBe(false);
    expect(JSON.parse(String(call.init.body))).toEqual({ fields: expectedSubmission });
    expect(String(call.init.body)).not.toContain(TOKEN);
  });

  it('accepts the revision published by the definition endpoint', async () => {
    const upstream = createUpstream();
    const { schemaRevision } = await getDefinition(upstream);

    await expect(
      submitWith(upstream, request({ schemaRevision, answers: validAnswers() })),
    ).resolves.toEqual({ success: true });
  });

  it('retrieves and normalizes current metadata on every POST (no cache)', async () => {
    const upstream = createUpstream();
    const body = await validBody();

    await submitWith(upstream, request(body));
    await submitWith(upstream, request(body));

    expect(order(upstream)).toEqual(['metadata', 'submit', 'metadata', 'submit']);
  });

  describe('request body', () => {
    const tampered: [string, Json][] = [
      ['an objectTypeId', { objectTypeId: '0-1' }],
      ['a portalId', { portalId: PORTAL_ID }],
      ['a formId', { formId: OTHER_FORM_ID }],
      ['legal consent options', { legalConsentOptions: { consent: { consentToProcess: true } } }],
      ['a fields array', { fields: [{ name: 'email', value: 'a@b.co' }] }],
      ['a client definition', { definition: { fields: [] } }],
      ['hidden values', { hiddenFields: { lead_source: 'evil' } }],
      ['a context object', { context: { hutk: 'abc' } }],
      ['an unknown key', { extra: true }],
      ['an own __proto__ key', JSON.parse('{"__proto__":{"polluted":true}}') as Json],
    ];

    it.each(tampered)('rejects %s before any upstream request', async (_label, extra) => {
      const upstream = createUpstream();
      const body = await validBody(baseConfig(), extra);

      const error = await caught(submitWith(upstream, request(body)));

      expect(error).toMatchObject({ code: 'INVALID_SUBMISSION', status: 400 });
      expect(upstream.fetch).not.toHaveBeenCalled();
    });

    const malformed: [string, () => HubspotSubmitRequest][] = [
      ['invalid JSON', () => request('{"schemaRevision":')],
      ['an empty body', () => request('')],
      ['a missing body', () => request('', { body: undefined })],
      ['a null body', () => request('', { body: null })],
      ['a JSON array', () => request('[]')],
      ['JSON null', () => request('null')],
      ['a JSON scalar', () => request('"text"')],
      ['invalid UTF-8', () => request('', { body: new Response(new Uint8Array([0x7b, 0xff, 0xfe, 0x7d])).body })],
    ];

    it.each(malformed)('rejects %s before any upstream request', async (_label, make) => {
      const upstream = createUpstream();

      await expect(submitWith(upstream, make())).rejects.toMatchObject({
        code: 'INVALID_SUBMISSION',
        status: 400,
      });
      expect(upstream.fetch).not.toHaveBeenCalled();
    });

    const badShapes: [string, Json][] = [
      ['a missing revision', { schemaRevision: undefined }],
      ['an empty revision', { schemaRevision: '' }],
      ['a non-hex revision', { schemaRevision: 'abc' }],
      ['an uppercase revision', { schemaRevision: 'A'.repeat(64) }],
      ['a numeric revision', { schemaRevision: 12345 }],
      ['missing answers', { answers: undefined }],
      ['array answers', { answers: [] }],
      ['null answers', { answers: null }],
      ['a numeric Turnstile token', { turnstileToken: 12345 }],
    ];

    it.each(badShapes)('rejects %s before any upstream request', async (_label, override) => {
      const upstream = createUpstream();
      const body = { ...(await validBody()), ...override };

      await expect(submitWith(upstream, request(body))).rejects.toMatchObject({
        code: 'INVALID_SUBMISSION',
        status: 400,
      });
      expect(upstream.fetch).not.toHaveBeenCalled();
    });

    it.each([
      ['text/plain', 'text/plain'],
      ['form encoding', 'application/x-www-form-urlencoded'],
      ['a missing content type', undefined],
      ['an empty content type', ''],
    ])('rejects %s with 415', async (_label, contentType) => {
      const upstream = createUpstream();

      await expect(
        submitWith(upstream, request(await validBody(), { contentType })),
      ).rejects.toMatchObject({ code: 'INVALID_SUBMISSION', status: 415 });
      expect(upstream.fetch).not.toHaveBeenCalled();
    });

    it.each(['application/json', 'application/json; charset=utf-8', 'APPLICATION/JSON'])(
      'accepts the content type %s',
      async (contentType) => {
        const upstream = createUpstream();

        await expect(
          submitWith(upstream, request(await validBody(), { contentType })),
        ).resolves.toEqual({ success: true });
      },
    );

    it('enforces the 64 KiB raw limit from a declared Content-Length without reading the body', async () => {
      const upstream = createUpstream();
      const { req, state } = untouchedRequest({
        contentLength: String(MAX_SUBMIT_BODY_BYTES + 1),
      });

      await expect(submitWith(upstream, req)).rejects.toMatchObject({
        code: 'INVALID_SUBMISSION',
        status: 413,
      });
      expect(state.reads).toBe(0);
      expect(upstream.fetch).not.toHaveBeenCalled();
    });

    it('rejects an unparseable Content-Length', async () => {
      const upstream = createUpstream();

      await expect(
        submitWith(upstream, request(await validBody(), { contentLength: 'lots' })),
      ).rejects.toMatchObject({ code: 'INVALID_SUBMISSION', status: 400 });
      expect(upstream.fetch).not.toHaveBeenCalled();
    });

    it('enforces the 64 KiB limit on the streamed bytes even when the header lies and stops reading early', async () => {
      const upstream = createUpstream();
      let pulls = 0;
      const chunk = new Uint8Array(4096).fill(0x20);
      const endless = new ReadableStream<Uint8Array>({
        pull(controller) {
          pulls += 1;
          controller.enqueue(chunk);
        },
      });

      await expect(
        submitWith(upstream, { contentType: 'application/json', contentLength: '10', body: endless }),
      ).rejects.toMatchObject({ code: 'INVALID_SUBMISSION', status: 413 });
      expect(pulls).toBeLessThan(40);
      expect(upstream.fetch).not.toHaveBeenCalled();
    });

    it('accepts a body of exactly 64 KiB', async () => {
      const upstream = createUpstream();
      const text = JSON.stringify(await validBody());
      const padded = text + ' '.repeat(MAX_SUBMIT_BODY_BYTES - text.length);
      expect(new TextEncoder().encode(padded).length).toBe(MAX_SUBMIT_BODY_BYTES);

      await expect(
        submitWith(upstream, request(padded, { contentLength: String(MAX_SUBMIT_BODY_BYTES) })),
      ).resolves.toEqual({ success: true });
    });
  });

  describe('answer validation uses the trusted current definition', () => {
    const invalid: [string, (answers: Json) => void][] = [
      ['a missing required field', (a) => { delete a.firstname; }],
      ['a whitespace-only required text', (a) => { a.firstname = '   '; }],
      ['an invalid email', (a) => { a.email = 'not-an-email'; }],
      ['a dropdown value that is not an option', (a) => { a.service = 'demolition'; }],
      ['a radio value that is not an option', (a) => { a.contact_method = 'carrier-pigeon'; }],
      ['a numeric string instead of a number', (a) => { a.num_employees = '12'; }],
      ['a non-finite number', (a) => { a.num_employees = null; }],
      ['an array for a text field', (a) => { a.message = ['text']; }],
      ['an object for a text field', (a) => { a.message = { text: 'hi' }; }],
      ['a boolean for a text field', (a) => { a.message = true; }],
      ['an unknown answer key', (a) => { a.extra = 'x'; }],
      ['a hidden field value from the browser', (a) => { a.lead_source = 'evil'; }],
      ['an objectTypeId smuggled as an answer', (a) => { a.objectTypeId = '0-2'; }],
      ['an oversized text answer', (a) => { a.message = 'x'.repeat(4001); }],
    ];

    it.each(invalid)('rejects %s without Siteverify or submission', async (_label, mutate) => {
      const upstream = createUpstream();
      const body = await validBody(protectedConfig(), { turnstileToken: TURNSTILE_TOKEN });
      mutate(body.answers);

      await expect(
        submitWith(upstream, request(body), { config: protectedConfig() }),
      ).rejects.toMatchObject({ code: 'INVALID_SUBMISSION', status: 400 });
      expect(order(upstream)).toEqual(['metadata']);
    });

    it('refuses a number HubSpot cannot represent before spending the Turnstile token', async () => {
      const upstream = createUpstream();
      const body = await validBody(protectedConfig(), { turnstileToken: TURNSTILE_TOKEN });
      body.answers.num_employees = 1e21;

      await expect(
        submitWith(upstream, request(body), { config: protectedConfig() }),
      ).rejects.toMatchObject({ code: 'INVALID_SUBMISSION', status: 400 });
      expect(order(upstream)).toEqual(['metadata']);
    });

    it('accepts numeric zero and omitted optional fields', async () => {
      const upstream = createUpstream();
      const body = await validBody();
      body.answers = { firstname: 'Jamie', email: 'jamie@example.com', service: 'repair', num_employees: 0 };

      await expect(submitWith(upstream, request(body))).resolves.toEqual({ success: true });
      const sent = JSON.parse(String(upstream.calls[1]!.init.body)) as { fields: Json[] };
      expect(sent.fields.map((entry) => [entry.name, entry.value])).toEqual([
        ['firstname', 'Jamie'],
        ['email', 'jamie@example.com'],
        ['num_employees', '0'],
        ['service', 'repair'],
        ['lead_source', 'website'],
      ]);
    });

    it('rejects any submitted consent because the supported subset has none', async () => {
      const upstream = createUpstream();
      const body = await validBody(baseConfig(), {
        consent: { consentToProcess: true, communications: {} },
      });

      await expect(submitWith(upstream, request(body))).rejects.toMatchObject({
        code: 'INVALID_SUBMISSION',
      });
      expect(order(upstream)).toEqual(['metadata']);
    });

    it('rejects a Turnstile token when protection is disabled', async () => {
      const upstream = createUpstream();
      const body = await validBody(baseConfig(), { turnstileToken: TURNSTILE_TOKEN });

      await expect(submitWith(upstream, request(body))).rejects.toMatchObject({
        code: 'INVALID_SUBMISSION',
      });
      expect(order(upstream)).toEqual(['metadata']);
    });
  });

  describe('stale schema revisions', () => {
    it('returns 409 FORM_CHANGED after the metadata fetch and before Siteverify or submission', async () => {
      const upstream = createUpstream();
      const body = {
        schemaRevision: '0'.repeat(64),
        answers: validAnswers(),
        turnstileToken: TURNSTILE_TOKEN,
      };

      const error = await caught(submitWith(upstream, request(body), { config: protectedConfig() }));

      expect(error).toMatchObject({ code: 'FORM_CHANGED', status: 409 });
      expect(toLeadFormResponse(error)).toEqual({ status: 409, body: { code: 'FORM_CHANGED' } });
      expect(order(upstream)).toEqual(['metadata']);
    });

    it('detects HubSpot metadata that changed between the definition fetch and the POST', async () => {
      const original = createUpstream();
      const { schemaRevision } = await getDefinition(original, protectedConfig());
      const changed = createUpstream({
        metadata: () => json(patched('service', { options: [{ label: 'Repair', value: 'repair' }] })),
      });

      await expect(
        submitWith(
          changed,
          request({ schemaRevision, answers: validAnswers(), turnstileToken: TURNSTILE_TOKEN }),
          { config: protectedConfig() },
        ),
      ).rejects.toMatchObject({ code: 'FORM_CHANGED', status: 409 });
      expect(order(changed)).toEqual(['metadata']);
    });

    it('detects a protection policy change as a form change', async () => {
      const upstream = createUpstream();
      const { schemaRevision } = await getDefinition(upstream, baseConfig());

      await expect(
        submitWith(
          upstream,
          request({ schemaRevision, answers: validAnswers(), turnstileToken: TURNSTILE_TOKEN }),
          { config: protectedConfig() },
        ),
      ).rejects.toMatchObject({ code: 'FORM_CHANGED' });
    });

    it('fails with UPSTREAM_UNAVAILABLE or UNSUPPORTED_FORM when current metadata cannot be used', async () => {
      const body = await validBody();

      await expect(
        submitWith(createUpstream({ metadata: () => json({}, { status: 500 }) }), request(body)),
      ).rejects.toMatchObject({ code: 'UPSTREAM_UNAVAILABLE' });
      await expect(
        submitWith(
          createUpstream({ metadata: () => json(add({ fieldType: 'single_checkbox' })) }),
          request(body),
        ),
      ).rejects.toMatchObject({ code: 'UNSUPPORTED_FORM' });

      function add(overrides: Json): Json {
        return withFields((fields) => {
          fields.push(field({ name: 'agree', label: 'Agree', ...overrides }));
        });
      }
    });
  });

  describe('Turnstile protection', () => {
    const protectedBody = () => validBody(protectedConfig(), { turnstileToken: TURNSTILE_TOKEN });
    const submitProtected = async (upstream: Upstream, body?: Json) =>
      submitWith(upstream, request(body ?? (await protectedBody())), { config: protectedConfig() });

    it('verifies after validation and before submission, and never forwards the token to HubSpot', async () => {
      const upstream = createUpstream();

      await expect(submitProtected(upstream)).resolves.toEqual({ success: true });

      expect(order(upstream)).toEqual(['metadata', 'siteverify', 'submit']);
      const siteverify = upstream.calls[1]!;
      expect(siteverify.url).toBe(SITEVERIFY_URL);
      expect(siteverify.init.redirect).toBe('manual');
      const form = new URLSearchParams(String(siteverify.init.body));
      expect(form.get('secret')).toBe(TURNSTILE_SECRET);
      expect(form.get('response')).toBe(TURNSTILE_TOKEN);
      const submission = upstream.calls[2]!;
      expect(String(submission.init.body)).not.toContain(TURNSTILE_TOKEN);
      expect(String(submission.init.body)).not.toContain(TURNSTILE_SECRET);
    });

    it('fails closed when the token is missing', async () => {
      const upstream = createUpstream();
      const body = { ...(await protectedBody()), turnstileToken: undefined };

      await expect(submitProtected(upstream, body)).rejects.toMatchObject({
        code: 'VERIFICATION_FAILED',
        status: 403,
      });
      expect(order(upstream)).toEqual(['metadata']);
    });

    it.each([
      ['an invalid token', { success: false, 'error-codes': ['invalid-input-response'] }],
      ['an expired or replayed token', { success: false, 'error-codes': ['timeout-or-duplicate'] }],
      ['another hostname', { ...verified, hostname: 'evil.example.com' }],
      ['another action', { ...verified, action: 'other-form' }],
      ['a response without hostname', { success: true, action: 'lead-form' }],
    ])('fails closed on %s without submitting', async (_label, siteverify) => {
      const upstream = createUpstream({ siteverify: () => json(siteverify) });

      const error = await caught(submitProtected(upstream));

      expect(error).toMatchObject({ code: 'VERIFICATION_FAILED', status: 403 });
      expect(order(upstream)).toEqual(['metadata', 'siteverify']);
    });

    it.each([
      ['an HTTP error', () => json({}, { status: 500 })],
      ['a network error', failure(new TypeError('fetch failed'))],
      ['a redirect', () => new Response(null, { status: 302, headers: { location: 'https://evil.example/' } })],
      ['invalid JSON', () => new Response('nope', { status: 200 })],
    ])('fails closed on a Siteverify %s without submitting', async (_label, responder) => {
      const upstream = createUpstream({ siteverify: responder });

      await expect(submitProtected(upstream)).rejects.toMatchObject({
        code: 'UPSTREAM_UNAVAILABLE',
        status: 502,
      });
      expect(order(upstream)).toEqual(['metadata', 'siteverify']);
    });

    it('fails closed when Siteverify hangs and never retries', async () => {
      vi.useFakeTimers();
      const upstream = createUpstream({ siteverify: hang });
      const body = await protectedBody();

      const outcome = caught(submitProtected(upstream, body));
      await untilIssued(() => upstream.calls.length === 2);
      await vi.advanceTimersByTimeAsync(10_000);

      expect(await outcome).toMatchObject({ code: 'UPSTREAM_UNAVAILABLE' });
      expect(order(upstream)).toEqual(['metadata', 'siteverify']);
    });
  });

  describe('HubSpot submission outcomes', () => {
    it.each([200, 201, 204])('confirms success on HTTP %i', async (status) => {
      const upstream = createUpstream({ submit: () => new Response(null, { status }) });

      await expect(submitWith(upstream, request(await validBody()))).resolves.toEqual({ success: true });
    });

    it('maps a HubSpot validation rejection to INVALID_SUBMISSION without leaking the body', async () => {
      const upstream = createUpstream({
        submit: () =>
          json(
            { status: 'error', message: 'Invalid email jamie@example.com', errors: [{ errorType: 'INVALID_EMAIL' }] },
            { status: 400 },
          ),
      });

      const error = await caught(submitWith(upstream, request(await validBody())));

      expect(error).toMatchObject({ code: 'INVALID_SUBMISSION', status: 400 });
      expect(JSON.stringify(toLeadFormResponse(error))).not.toContain('jamie');
    });

    it.each([401, 403, 404, 410, 429])('maps HTTP %i to UPSTREAM_UNAVAILABLE', async (status) => {
      const upstream = createUpstream({ submit: () => json({}, { status }) });

      await expect(submitWith(upstream, request(await validBody()))).rejects.toMatchObject({
        code: 'UPSTREAM_UNAVAILABLE',
        status: 502,
      });
      expect(order(upstream)).toEqual(['metadata', 'submit']);
    });

    it('does not follow a submission redirect', async () => {
      const upstream = createUpstream({
        submit: () => new Response(null, { status: 307, headers: { location: 'https://evil.example/' } }),
      });

      await expect(submitWith(upstream, request(await validBody()))).rejects.toMatchObject({
        code: 'UPSTREAM_UNAVAILABLE',
      });
      expect(order(upstream)).toEqual(['metadata', 'submit']);
    });

    it.each([500, 502, 503, 504])('reports DELIVERY_UNKNOWN for HTTP %i and never retries', async (status) => {
      const upstream = createUpstream({ submit: () => json({}, { status }) });

      await expect(submitWith(upstream, request(await validBody()))).rejects.toMatchObject({
        code: 'DELIVERY_UNKNOWN',
        status: 504,
      });
      expect(order(upstream)).toEqual(['metadata', 'submit']);
    });

    it('reports DELIVERY_UNKNOWN for a transport failure and never retries', async () => {
      const upstream = createUpstream({ submit: failure(new TypeError('fetch failed')) });

      await expect(submitWith(upstream, request(await validBody()))).rejects.toMatchObject({
        code: 'DELIVERY_UNKNOWN',
        status: 504,
      });
      expect(order(upstream)).toEqual(['metadata', 'submit']);
    });

    it('reports DELIVERY_UNKNOWN when the submission times out, with exactly one POST', async () => {
      vi.useFakeTimers();
      const upstream = createUpstream({ submit: hang });
      const body = await validBody();

      const outcome = caught(submitWith(upstream, request(body)));
      await untilIssued(() => upstream.calls.length === 2);
      await vi.advanceTimersByTimeAsync(10_000);
      expect(await outcome).toMatchObject({ code: 'DELIVERY_UNKNOWN', status: 504 });
      await vi.advanceTimersByTimeAsync(120_000);

      expect(order(upstream)).toEqual(['metadata', 'submit']);
      expect(upstream.calls[1]!.init.signal?.aborted).toBe(true);
    });
  });
});

describe('toLeadFormResponse', () => {
  it('returns exactly the sanitized stable code and status', async () => {
    const error = await caught(getDefinition(createUpstream(), {}));

    expect(toLeadFormResponse(error)).toEqual({ status: 503, body: { code: 'NOT_CONFIGURED' } });
  });

  it('stays quiet about the explicitly disabled default but logs a real misconfiguration', () => {
    const response = toLeadFormResponse(
      thrown(() => resolveLeadFormsConfig({ ...baseConfig(), enabled: false })),
    );

    expect(response).toEqual({ status: 503, body: { code: 'NOT_CONFIGURED' } });
    expect(consoles.flatMap((spy) => spy.mock.calls)).toEqual([]);

    toLeadFormResponse(
      thrown(() => resolveLeadFormsConfig(configWith((c) => { c.turnstile = { ...turnstileOn, enabled: 1 }; }))),
    );
    expect(logged()).toContain('Turnstile enabled flag');
    expect(logged()).not.toContain(TURNSTILE_SECRET);
    expect(logged()).not.toContain(TOKEN);
  });

  it('hides unexpected failures behind a generic code and never logs their message', () => {
    const response = toLeadFormResponse(new Error('boom jamie@example.com pat-na1-secret'));

    expect(response).toEqual({ status: 500, body: { code: 'UPSTREAM_UNAVAILABLE' } });
    expect(logged()).not.toContain('jamie@example.com');
    expect(logged()).not.toContain('pat-na1-secret');
    expect(toLeadFormResponse('oops')).toEqual({ status: 500, body: { code: 'UPSTREAM_UNAVAILABLE' } });
  });

  it('never returns or logs tokens, secrets, submitted values or upstream bodies', async () => {
    const leak = `${TOKEN} ${TURNSTILE_SECRET} ${TURNSTILE_TOKEN} jamie@example.com`;
    // Each promise is wrapped in `caught` as it is created: the `await validBody()` calls below
    // yield to the event loop, and an early rejection without a handler would be reported as unhandled.
    const failing: Promise<unknown>[] = [
      caught(getDefinition(createUpstream({ metadata: () => json({ leak }, { status: 500 }) }))),
      caught(getDefinition(createUpstream({ metadata: () => json({ ...metadata(), leak }, { status: 200 }) }), {})),
      caught(submitWith(createUpstream({ submit: () => json({ leak }, { status: 400 }) }), request(await validBody()))),
      caught(submitWith(createUpstream({ submit: () => json({ leak }, { status: 503 }) }), request(await validBody()))),
      caught(
        submitWith(
          createUpstream({ siteverify: () => json({ success: false, leak, 'error-codes': ['invalid-input-response'] }) }),
          request(await validBody(protectedConfig(), { turnstileToken: TURNSTILE_TOKEN })),
          { config: protectedConfig() },
        ),
      ),
      caught(submitWith(createUpstream({ submit: failure(new Error(leak)) }), request(await validBody()))),
      caught(submitWith(createUpstream(), request(await validBody(baseConfig(), { objectTypeId: leak })))),
    ];

    for (const outcome of failing) {
      const error = await outcome;
      expect(error).toBeDefined();
      const response = toLeadFormResponse(error);
      expect(Object.keys(response.body)).toEqual(['code']);
      expect(JSON.stringify(response)).not.toMatch(/pat-na1|turnstile|jamie|leak/i);
    }

    expect(logged()).not.toMatch(/pat-na1|turnstile-secret|turnstile-token|jamie@example\.com|leak/i);
  });
});

describe('Nitro routes stay thin', () => {
  interface Harness {
    status: Mock;
    headers: Mock;
    requestHeaders: Record<string, string>;
    params: Record<string, string>;
    body: ReadableStream<Uint8Array> | undefined;
  }

  const harness = (config: unknown, upstream: Upstream): Harness => {
    const state: Harness = {
      status: vi.fn(),
      headers: vi.fn(),
      requestHeaders: { 'content-type': 'application/json' },
      params: { formKey: 'contact' },
      body: undefined,
    };
    vi.stubGlobal('defineEventHandler', (handler: unknown) => handler);
    vi.stubGlobal('getRouterParam', (_event: unknown, name: string) => state.params[name]);
    vi.stubGlobal('getRequestHeader', (_event: unknown, name: string) => state.requestHeaders[name.toLowerCase()]);
    vi.stubGlobal('getRequestWebStream', () => state.body);
    vi.stubGlobal('setResponseStatus', state.status);
    vi.stubGlobal('setResponseHeader', state.headers);
    vi.stubGlobal('useRuntimeConfig', () => ({ leadForms: config }));
    vi.stubGlobal('fetch', upstream.fetch);
    return state;
  };

  const loadGet = async () =>
    (await import('../../apps/web/server/api/lead-forms/hubspot/[formKey].get'))
      .default as unknown as (event: unknown) => Promise<unknown>;
  const loadPost = async () =>
    (await import('../../apps/web/server/api/lead-forms/hubspot/[formKey].post'))
      .default as unknown as (event: unknown) => Promise<unknown>;

  it('GET returns the public definition uncached', async () => {
    const upstream = createUpstream();
    const state = harness(baseConfig(), upstream);

    const result = (await (await loadGet())({})) as { formKey: string; fields: unknown };

    expect(result.formKey).toBe('contact');
    expect(result.fields).toEqual(publicFields);
    expect(state.headers).toHaveBeenCalledWith(expect.anything(), 'cache-control', 'no-store');
    expect(state.status).not.toHaveBeenCalled();
    expect(order(upstream)).toEqual(['metadata']);
  });

  it('GET answers missing or disabled config with 503 { code } and no upstream request', async () => {
    for (const config of [undefined, { ...baseConfig(), enabled: false }]) {
      const upstream = createUpstream();
      const state = harness(config, upstream);

      await expect((await loadGet())({})).resolves.toEqual({ code: 'NOT_CONFIGURED' });

      expect(state.status).toHaveBeenCalledWith(expect.anything(), 503);
      expect(upstream.fetch).not.toHaveBeenCalled();
    }
  });

  it('GET answers an unknown alias under valid config with 404 { code } and no upstream request', async () => {
    const upstream = createUpstream();
    const state = harness(baseConfig(), upstream);
    state.params.formKey = 'unknown';

    await expect((await loadGet())({})).resolves.toEqual({ code: 'NOT_CONFIGURED' });

    expect(state.status).toHaveBeenCalledWith(expect.anything(), 404);
    expect(upstream.fetch).not.toHaveBeenCalled();
  });

  it('POST submits the streamed body and returns { success: true }', async () => {
    const upstream = createUpstream();
    const state = harness(baseConfig(), upstream);
    state.body = streamOf(JSON.stringify(await validBody()));
    state.requestHeaders['content-length'] = String(JSON.stringify(await validBody()).length);

    await expect((await loadPost())({})).resolves.toEqual({ success: true });

    expect(state.status).not.toHaveBeenCalled();
    expect(state.headers).toHaveBeenCalledWith(expect.anything(), 'cache-control', 'no-store');
    expect(order(upstream)).toEqual(['metadata', 'submit']);
  });

  it('POST maps adapter failures to a status and a { code } body', async () => {
    const upstream = createUpstream();
    const state = harness(baseConfig(), upstream);
    state.body = streamOf(JSON.stringify({ schemaRevision: '0'.repeat(64), answers: validAnswers() }));

    await expect((await loadPost())({})).resolves.toEqual({ code: 'FORM_CHANGED' });

    expect(state.status).toHaveBeenCalledWith(expect.anything(), 409);
    expect(order(upstream)).toEqual(['metadata']);
  });

  it('POST with disabled, missing or ambiguous-protection config answers 503 and never reads the body or calls upstream', async () => {
    const unusable = [
      {},
      { ...baseConfig(), enabled: false },
      configWith((c) => { c.turnstile = { ...turnstileOn, enabled: 1 }; }),
    ];

    for (const config of unusable) {
      const upstream = createUpstream();
      const state = harness(config, upstream);
      state.body = streamOf('{}');

      await expect((await loadPost())({})).resolves.toEqual({ code: 'NOT_CONFIGURED' });

      expect(state.status).toHaveBeenCalledWith(expect.anything(), 503);
      expect(state.body.locked).toBe(false);
      expect(upstream.fetch).not.toHaveBeenCalled();
    }
  });
});
