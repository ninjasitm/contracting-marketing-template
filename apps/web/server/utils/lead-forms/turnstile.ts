/**
 * Optional Cloudflare Turnstile verification for lead forms, plus the small request helpers the
 * HubSpot adapter shares with it. Everything is pure and takes an injected `fetch`; secrets and
 * tokens are never logged or returned.
 */

/** Minimal fetch contract the adapters need; routes pass the platform `fetch`. */
export type LeadFormFetch = (
  url: string,
  init: RequestInit,
) => Promise<Response>;

export const TURNSTILE_SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';
/** Documented maximum length of a Turnstile response token. */
export const TURNSTILE_TOKEN_MAX_LENGTH = 2048;
export const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;

const MAX_SITEVERIFY_BYTES = 16 * 1024;
const SECRET_PATTERN = /^[\x21-\x7e]{1,256}$/;
const SITE_KEY_PATTERN = /^[\x21-\x7e]{1,128}$/;
const ACTION_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;
const HOSTNAME_PATTERN =
  /^(?=.{1,253}$)[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
const ERROR_CODE_PATTERN = /^[a-z0-9-]{1,64}$/;
/** Siteverify failures that say nothing about the visitor: our secret or Cloudflare is at fault. */
const UNAVAILABLE_CODES = new Set([
  'internal-error',
  'bad-request',
  'missing-input-secret',
  'invalid-input-secret',
]);

export interface TurnstileSettings {
  secret: string;
  siteKey: string;
  expectedHostname: string;
  action: string;
}

export type TurnstilePolicy =
  | { enabled: false }
  | ({ enabled: true } & TurnstileSettings);

export type TurnstilePolicyResult =
  | { ok: true; policy: TurnstilePolicy }
  | { ok: false; reason: string };

export type TurnstileVerification =
  | { ok: true }
  | { ok: false; reason: 'rejected'; codes: string[] }
  | { ok: false; reason: 'unavailable' };

export class BodyTooLargeError extends Error {
  constructor() {
    super('Body is larger than the allowed limit');
    this.name = 'BodyTooLargeError';
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const trimmed = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

/**
 * Fails closed: protection is off only for an explicit `false` / `"false"` and on only for an
 * explicit `true` / `"true"`. A missing policy or a missing, misspelled or mistyped flag is a
 * configuration error, never "off". Once enabled every setting must be valid; the failure reason
 * names the setting, never its value.
 */
export function parseTurnstilePolicy(raw: unknown): TurnstilePolicyResult {
  if (!isRecord(raw)) {
    return { ok: false, reason: 'Turnstile policy is missing or malformed' };
  }
  if (raw.enabled === false || raw.enabled === 'false') {
    return { ok: true, policy: { enabled: false } };
  }
  if (raw.enabled !== true && raw.enabled !== 'true') {
    return {
      ok: false,
      reason: 'Turnstile enabled flag must be true or false',
    };
  }

  const secret = trimmed(raw.secret);
  const siteKey = trimmed(raw.siteKey);
  const expectedHostname = trimmed(raw.expectedHostname);
  const action = trimmed(raw.action);

  if (!SECRET_PATTERN.test(secret)) {
    return { ok: false, reason: 'Turnstile secret is missing or malformed' };
  }
  if (!SITE_KEY_PATTERN.test(siteKey)) {
    return { ok: false, reason: 'Turnstile site key is missing or malformed' };
  }
  if (!HOSTNAME_PATTERN.test(expectedHostname)) {
    return {
      ok: false,
      reason: 'Turnstile expected hostname is missing or not a bare hostname',
    };
  }
  if (!ACTION_PATTERN.test(action)) {
    return { ok: false, reason: 'Turnstile action is missing or malformed' };
  }

  return {
    ok: true,
    policy: { enabled: true, secret, siteKey, expectedHostname, action },
  };
}

/** Runs one upstream call under a hard time bound that also covers reading its body. */
export async function withRequestTimeout<T>(
  timeoutMs: number,
  run: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await run(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

/** Frees the connection of a response whose body we deliberately never read. */
export function discardBody(response: Response): void {
  response.body?.cancel().catch(() => undefined);
}

/**
 * Reads a body as UTF-8 text and stops pulling as soon as `limit` bytes are exceeded. A missing body
 * is empty text; invalid UTF-8 rejects.
 */
export async function readBoundedText(
  stream: ReadableStream<Uint8Array> | null | undefined,
  limit: number,
): Promise<string> {
  if (!stream) return '';

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      reader.cancel().catch(() => undefined);
      throw new BodyTooLargeError();
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

/**
 * Verifies a Turnstile token through Siteverify. A missing or malformed token is rejected without
 * a request; every transport, status, parsing or timeout failure fails closed as `unavailable`.
 * Never retries.
 */
export async function verifyTurnstileToken(options: {
  token: unknown;
  settings: TurnstileSettings;
  fetch: LeadFormFetch;
  timeoutMs?: number;
}): Promise<TurnstileVerification> {
  const { token, settings, fetch: send, timeoutMs } = options;
  if (
    typeof token !== 'string' ||
    token.length === 0 ||
    token.length > TURNSTILE_TOKEN_MAX_LENGTH
  ) {
    return { ok: false, reason: 'rejected', codes: [] };
  }

  let outcome: unknown;
  try {
    outcome = await withRequestTimeout(
      timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS,
      async (signal) => {
        const response = await send(TURNSTILE_SITEVERIFY_URL, {
          method: 'POST',
          redirect: 'manual',
          signal,
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: settings.secret,
            response: token,
          }).toString(),
        });
        if (!response.ok) {
          discardBody(response);
          throw new Error('Siteverify did not answer with a success status');
        }
        return JSON.parse(
          await readBoundedText(response.body, MAX_SITEVERIFY_BYTES),
        ) as unknown;
      },
    );
  } catch {
    return { ok: false, reason: 'unavailable' };
  }

  if (!isRecord(outcome)) return { ok: false, reason: 'unavailable' };

  const rawCodes = outcome['error-codes'];
  const codes = Array.isArray(rawCodes)
    ? rawCodes
        .filter(
          (code): code is string =>
            typeof code === 'string' && ERROR_CODE_PATTERN.test(code),
        )
        .slice(0, 10)
    : [];

  if (outcome.success !== true) {
    return codes.some((code) => UNAVAILABLE_CODES.has(code))
      ? { ok: false, reason: 'unavailable' }
      : { ok: false, reason: 'rejected', codes };
  }

  const hostname =
    typeof outcome.hostname === 'string' ? outcome.hostname.toLowerCase() : '';
  if (
    hostname !== settings.expectedHostname.toLowerCase() ||
    outcome.action !== settings.action
  ) {
    return { ok: false, reason: 'rejected', codes };
  }

  return { ok: true };
}
