// @vitest-environment node

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { createEmailAdapter } from '~/server/utils/email/factory';

vi.mock('~/server/utils/email/factory', () => ({
  createEmailAdapter: vi.fn(),
}));

const baseBody = {
  fullName: 'Jamie Rivera',
  email: 'jamie@example.com',
  phone: '555-0101',
  message: 'Hello there! This is a test message.',
};

const buildRuntimeConfig = (overrides: Record<string, unknown> = {}) => ({
  mail: {
    message: {
      to: 'leads@example.com',
    },
    auth: {
      user: 'mailer@example.com',
      pass: 'test-password',
    },
    ...overrides,
  },
});

const loadHandler = async () => {
  const module = await import(
    '../../../apps/web/server/api/contact/send-email.post'
  );
  return module.default as (event: any) => Promise<unknown>;
};

beforeEach(() => {
  vi.stubGlobal('defineEventHandler', (fn: any) => fn);
  vi.stubGlobal('readBody', () => Promise.resolve(baseBody));
  vi.stubGlobal('createError', (payload: any) => payload);
  vi.stubGlobal('useRuntimeConfig', () => buildRuntimeConfig());
  vi.stubGlobal('useAppConfig', () => ({
    config: { companyName: 'Acme Co', companyInfo: [] },
  }));
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('send-email handler', () => {
  it('sends email using runtime config values', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    vi.mocked(createEmailAdapter).mockReturnValue({ name: 'Mock', send });

    const handler = await loadHandler();

    await handler({} as any);

    expect(createEmailAdapter).toHaveBeenCalled();
    expect(send).toHaveBeenCalled();

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'leads@example.com',
        replyTo: baseBody.email,
        from: {
          email: 'mailer@example.com',
          name: 'Acme Co',
        },
      }),
    );
  });

  it('escapes submitted values in the email HTML without changing replyTo', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const maliciousBody = {
      fullName: 'Jo"><img src=x onerror="alert(1)">&',
      email: baseBody.email,
      phone: "555' onmouseover='alert(1)' &",
      message: `Hello & <script>alert("x")</script> 'quoted'`,
    };
    vi.stubGlobal('readBody', () => Promise.resolve(maliciousBody));
    vi.mocked(createEmailAdapter).mockReturnValue({ name: 'Mock', send });

    const handler = await loadHandler();

    await handler({} as any);

    const firstCall = send.mock.calls[0];
    if (!firstCall) throw new Error('Expected the email adapter to be called');
    const [email] = firstCall;
    expect(email.replyTo).toBe(baseBody.email);
    expect(email.html).toContain(
      'Jo&quot;&gt;&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;',
    );
    expect(email.html).toContain(
      "555&#39; onmouseover=&#39;alert(1)&#39; &amp;",
    );
    expect(email.html).toContain(
      'Hello &amp; &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &#39;quoted&#39;',
    );
    expect(email.html).not.toMatch(/<(?:script|img)\b/i);
  });

  it('falls back to a default recipient when config is missing', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    vi.mocked(createEmailAdapter).mockReturnValue({ name: 'Mock', send });

    vi.stubGlobal('useRuntimeConfig', () => ({ mail: { auth: {} } }));

    const handler = await loadHandler();

    await handler({} as any);

    expect(createEmailAdapter).toHaveBeenCalled();
    expect(send).toHaveBeenCalled();

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'info@company.com',
      }),
    );
  });
});
