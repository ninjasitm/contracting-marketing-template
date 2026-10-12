import { beforeEach, describe, it, expect, vi, afterEach } from 'vitest';

const loadFactory = async () =>
  (
    await import('../../../apps/web/server/utils/email/factory')
  ).createEmailAdapter;

const buildRuntimeConfig = (overrides: Record<string, unknown> = {}) => ({
  mail: {
    provider: 'smtp',
    apiKey: 'test-api-key',
    smtp: {
      host: 'smtp.example.com',
      port: 587,
      secure: false,
    },
    auth: {
      user: 'user@example.com',
      pass: 'test-password',
    },
    mailgun: {
      domain: 'mg.example.com',
      region: 'us',
    },
    ...overrides,
  },
});

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('createEmailAdapter', () => {
  it('throws a clear error when mail config is missing', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({}));

    const createEmailAdapter = await loadFactory();

    expect(() => createEmailAdapter()).toThrowError(
      'Mail configuration is missing',
    );
  });

  it('normalizes provider values from runtime config', async () => {
    vi.stubGlobal('useRuntimeConfig', () =>
      buildRuntimeConfig({ provider: 'GMAIL' }),
    );

    const createEmailAdapter = await loadFactory();

    const adapter = createEmailAdapter();

    expect(adapter.name).toBe('Gmail');
  });

  it('lets the provider parameter override runtime config', async () => {
    vi.stubGlobal('useRuntimeConfig', () => buildRuntimeConfig());

    const createEmailAdapter = await loadFactory();

    const adapter = createEmailAdapter('mailgun');

    expect(adapter.name).toBe('Mailgun');
  });
});
