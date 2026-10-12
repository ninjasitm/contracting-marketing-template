// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import {
  BodyTooLargeError,
  TURNSTILE_SITEVERIFY_URL,
  TURNSTILE_TOKEN_MAX_LENGTH,
  parseTurnstilePolicy,
  readBoundedText,
  verifyTurnstileToken,
} from '~/server/utils/lead-forms/turnstile';
import type {
  LeadFormFetch,
  TurnstileSettings,
} from '~/server/utils/lead-forms/turnstile';

const settings: TurnstileSettings = {
  secret: 'turnstile-secret-value',
  siteKey: '0x4AAAAAAAsitekey',
  expectedHostname: 'www.example.com',
  action: 'lead-form',
};
const TOKEN = 'turnstile-token-from-the-browser';

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });

const passing = {
  success: true,
  hostname: 'www.example.com',
  action: 'lead-form',
  challenge_ts: '2026-10-12T12:00:00.000Z',
  'error-codes': [],
};

const answering = (make: () => Response | Promise<Response>) =>
  vi
    .fn<LeadFormFetch>()
    .mockImplementation(() => Promise.resolve().then(make));

const hanging = (): Mock<LeadFormFetch> =>
  vi.fn<LeadFormFetch>().mockImplementation(
    (_url, init) =>
      new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener('abort', () =>
          reject(new DOMException('The operation was aborted.', 'AbortError')),
        );
      }),
  );

const verifyWith = (fetchImpl: LeadFormFetch, token: unknown) =>
  verifyTurnstileToken({ token, settings, fetch: fetchImpl });

const verify = (fetchImpl: LeadFormFetch) => verifyWith(fetchImpl, TOKEN);

const consoleSpies = () =>
  (['log', 'info', 'warn', 'error', 'debug'] as const).map((level) =>
    vi.spyOn(console, level).mockImplementation(() => {}),
  );

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('parseTurnstilePolicy', () => {
  it('is disabled only by an explicit false or "false"', () => {
    for (const raw of [
      { enabled: false },
      { enabled: 'false' },
      { enabled: false, ...settings },
      { enabled: 'false', ...settings },
    ]) {
      expect(parseTurnstilePolicy(raw)).toEqual({
        ok: true,
        policy: { enabled: false },
      });
    }
  });

  it.each([
    ['an undefined policy', undefined],
    ['a null policy', null],
    ['an empty policy', {}],
    ['an array policy', []],
    ['a non-object policy', 'on'],
    ['a policy without a flag', { ...settings }],
    ['an undefined flag', { enabled: undefined, ...settings }],
    ['a null flag', { enabled: null, ...settings }],
    ['a numeric flag', { enabled: 1, ...settings }],
    ['a zero flag', { enabled: 0, ...settings }],
    ['an empty-string flag', { enabled: '', ...settings }],
    ['a misspelled flag', { enabled: 'tru', ...settings }],
    ['an upper-case flag', { enabled: 'TRUE', ...settings }],
    ['a padded flag', { enabled: ' true ', ...settings }],
    ['a "yes" flag', { enabled: 'yes', ...settings }],
    ['an object flag', { enabled: {}, ...settings }],
    ['an array flag', { enabled: [true], ...settings }],
  ])('fails closed on %s instead of reading it as disabled', (_label, raw) => {
    const result = parseTurnstilePolicy(raw);

    expect(result.ok).toBe(false);
    expect(JSON.stringify(result)).not.toContain(settings.secret);
  });

  it('accepts a complete enabled policy, including the string form env overrides produce', () => {
    for (const enabled of [true, 'true']) {
      expect(parseTurnstilePolicy({ enabled, ...settings })).toEqual({
        ok: true,
        policy: { enabled: true, ...settings },
      });
    }
  });

  it('rejects incomplete or malformed enabled settings without echoing values', () => {
    const broken: Record<string, unknown>[] = [
      { secret: '' },
      { secret: undefined },
      { secret: 'has space' },
      { secret: 42 },
      { siteKey: '' },
      { siteKey: 'has space' },
      { siteKey: 'k'.repeat(129) },
      { expectedHostname: '' },
      { expectedHostname: 'https://www.example.com' },
      { expectedHostname: 'www.example.com/path' },
      { expectedHostname: 'www.example.com:8443' },
      { expectedHostname: 'www example.com' },
      { expectedHostname: `${'a'.repeat(250)}.com` },
      { action: '' },
      { action: 'has space' },
      { action: 'semi;colon' },
      { action: 'a'.repeat(33) },
    ];

    for (const override of broken) {
      const result = parseTurnstilePolicy({
        enabled: true,
        ...settings,
        ...override,
      });
      expect(result.ok).toBe(false);
      expect(JSON.stringify(result)).not.toContain(settings.secret);
    }
  });
});

describe('verifyTurnstileToken', () => {
  it('posts only the secret and token to the fixed Siteverify URL without following redirects', async () => {
    const fetchImpl = answering(() => json(passing));

    await expect(verify(fetchImpl)).resolves.toEqual({ ok: true });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    expect(url).toBe(TURNSTILE_SITEVERIFY_URL);
    expect(init.method).toBe('POST');
    expect(init.redirect).toBe('manual');
    expect(init.signal).toBeInstanceOf(AbortSignal);
    const headers = new Headers(init.headers);
    expect(headers.get('content-type')).toBe('application/x-www-form-urlencoded');
    expect(headers.has('authorization')).toBe(false);
    const form = new URLSearchParams(String(init.body));
    expect([...form.keys()].sort()).toEqual(['response', 'secret']);
    expect(form.get('secret')).toBe(settings.secret);
    expect(form.get('response')).toBe(TOKEN);
  });

  it('compares the hostname case-insensitively and the action exactly', async () => {
    await expect(
      verify(answering(() => json({ ...passing, hostname: 'WWW.Example.COM' }))),
    ).resolves.toEqual({ ok: true });
    await expect(
      verify(answering(() => json({ ...passing, action: 'Lead-Form' }))),
    ).resolves.toMatchObject({ ok: false, reason: 'rejected' });
  });

  it.each([
    ['unsuccessful verification', { success: false, 'error-codes': ['invalid-input-response'] }],
    ['an expired or replayed token', { success: false, 'error-codes': ['timeout-or-duplicate'] }],
    ['a truthy but non-true success', { ...passing, success: 'true' }],
    ['a different hostname', { ...passing, hostname: 'evil.example.com' }],
    ['a missing hostname', { success: true, action: 'lead-form' }],
    ['a different action', { ...passing, action: 'other-form' }],
    ['a missing action', { success: true, hostname: 'www.example.com' }],
  ])('rejects %s', async (_label, body) => {
    await expect(verify(answering(() => json(body)))).resolves.toMatchObject({
      ok: false,
      reason: 'rejected',
    });
  });

  it.each([
    ['a Cloudflare internal error', () => json({ success: false, 'error-codes': ['internal-error'] })],
    ['HTTP 500', () => json({ success: true }, { status: 500 })],
    ['HTTP 400', () => json({ success: false }, { status: 400 })],
    ['an unfollowed redirect', () => new Response(null, { status: 302, headers: { location: 'https://evil.example/' } })],
    ['invalid JSON', () => new Response('not json', { status: 200 })],
    ['a non-object JSON body', () => json(['success'])],
    ['a null JSON body', () => json(null)],
    ['an oversized body', () => new Response(`{"x":"${'a'.repeat(20_000)}"}`, { status: 200 })],
  ])('fails closed as unavailable on %s', async (_label, make) => {
    const fetchImpl = answering(make);

    await expect(verify(fetchImpl)).resolves.toMatchObject({
      ok: false,
      reason: 'unavailable',
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('fails closed as unavailable on network errors and never retries', async () => {
    const fetchImpl = vi
      .fn<LeadFormFetch>()
      .mockRejectedValue(new TypeError('fetch failed'));

    await expect(verify(fetchImpl)).resolves.toMatchObject({
      ok: false,
      reason: 'unavailable',
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('aborts and fails closed after the request timeout', async () => {
    vi.useFakeTimers();
    const fetchImpl = hanging();

    const pending = verifyTurnstileToken({
      token: TOKEN,
      settings,
      fetch: fetchImpl,
      timeoutMs: 2_000,
    });
    await vi.advanceTimersByTimeAsync(1_999);
    expect(fetchImpl.mock.calls[0]![1].signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);

    await expect(pending).resolves.toMatchObject({
      ok: false,
      reason: 'unavailable',
    });
    expect(fetchImpl.mock.calls[0]![1].signal?.aborted).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('uses a bounded 10 second default timeout', async () => {
    vi.useFakeTimers();
    const fetchImpl = hanging();

    const pending = verify(fetchImpl);
    await vi.advanceTimersByTimeAsync(9_999);
    expect(fetchImpl.mock.calls[0]![1].signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);

    await expect(pending).resolves.toMatchObject({ reason: 'unavailable' });
  });

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['an empty string', ''],
    ['a number', 12345],
    ['an object', { token: TOKEN }],
    ['an oversized token', 't'.repeat(TURNSTILE_TOKEN_MAX_LENGTH + 1)],
  ])('rejects %s without calling Cloudflare', async (_label, token) => {
    const fetchImpl = answering(() => json(passing));

    await expect(verifyWith(fetchImpl, token)).resolves.toMatchObject({
      ok: false,
      reason: 'rejected',
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('accepts a token at the documented maximum length', async () => {
    const fetchImpl = answering(() => json(passing));

    await expect(
      verifyWith(fetchImpl, 't'.repeat(TURNSTILE_TOKEN_MAX_LENGTH)),
    ).resolves.toEqual({ ok: true });
  });

  it('surfaces only well-formed Cloudflare error codes', async () => {
    const result = await verify(
      answering(() =>
        json({
          success: false,
          'error-codes': ['timeout-or-duplicate', 'x'.repeat(100), 'has space', 42, null],
        }),
      ),
    );

    expect(result).toEqual({
      ok: false,
      reason: 'rejected',
      codes: ['timeout-or-duplicate'],
    });
  });

  it('never logs the secret or the token', async () => {
    const spies = consoleSpies();

    await verify(answering(() => json(passing)));
    await verify(answering(() => json({ success: false, 'error-codes': ['timeout-or-duplicate'] })));
    await verify(vi.fn<LeadFormFetch>().mockRejectedValue(new TypeError('fetch failed')));

    const logged = JSON.stringify(spies.flatMap((spy) => spy.mock.calls));
    expect(logged).not.toContain(settings.secret);
    expect(logged).not.toContain(TOKEN);
  });
});

describe('readBoundedText', () => {
  const streamOf = (chunks: Uint8Array[]) => {
    const pulls = { count: 0 };
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        const chunk = chunks[pulls.count++];
        if (chunk) controller.enqueue(chunk);
        else controller.close();
      },
    });
    return { stream, pulls };
  };

  it('decodes multi-chunk UTF-8 and returns empty text for a missing body', async () => {
    const bytes = new TextEncoder().encode('Zoë ✓');
    const { stream } = streamOf([bytes.slice(0, 3), bytes.slice(3)]);

    await expect(readBoundedText(stream, 100)).resolves.toBe('Zoë ✓');
    await expect(readBoundedText(null, 100)).resolves.toBe('');
    await expect(readBoundedText(undefined, 100)).resolves.toBe('');
  });

  it('stops reading as soon as the limit is exceeded', async () => {
    const chunk = new Uint8Array(10).fill(97);
    const { stream, pulls } = streamOf(Array.from({ length: 50 }, () => chunk));

    await expect(readBoundedText(stream, 25)).rejects.toBeInstanceOf(BodyTooLargeError);
    expect(pulls.count).toBeLessThan(10);
  });

  it('accepts exactly the limit and rejects invalid UTF-8', async () => {
    await expect(
      readBoundedText(streamOf([new Uint8Array(25).fill(97)]).stream, 25),
    ).resolves.toBe('a'.repeat(25));
    await expect(
      readBoundedText(streamOf([new Uint8Array([0xff, 0xfe, 0xfd])]).stream, 25),
    ).rejects.toThrow();
  });
});
