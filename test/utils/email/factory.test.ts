import { beforeEach, describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('#imports', () => ({
  useRuntimeConfig: vi.fn(),
}));

vi.mock('#app', () => ({
  useRuntimeConfig: vi.fn(),
}));

vi.mock('#app/config', () => ({
  useRuntimeConfig: vi.fn(),
}));

const loadFactory = async () =>
  (await import('../../../server/utils/email/factory')).createEmailAdapter;

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
    const imports = await import('#imports');
    vi.mocked(imports.useRuntimeConfig).mockReturnValue({});
    const appImports = await import('#app');
    vi.mocked(appImports.useRuntimeConfig).mockReturnValue({});
    const appConfigImports = await import('#app/config');
    vi.mocked(appConfigImports.useRuntimeConfig).mockReturnValue({});
    vi.stubGlobal('useRuntimeConfig', () => ({}));

    const createEmailAdapter = await loadFactory();

    expect(() => createEmailAdapter()).toThrowError(
      'Mail configuration is missing',
    );
  });

  it('normalizes provider values from runtime config', async () => {
    const imports = await import('#imports');
    vi.mocked(imports.useRuntimeConfig).mockReturnValue(
      buildRuntimeConfig({ provider: 'GMAIL' }),
    );
    const appImports = await import('#app');
    vi.mocked(appImports.useRuntimeConfig).mockReturnValue(
      buildRuntimeConfig({ provider: 'GMAIL' }),
    );
    const appConfigImports = await import('#app/config');
    vi.mocked(appConfigImports.useRuntimeConfig).mockReturnValue(
      buildRuntimeConfig({ provider: 'GMAIL' }),
    );
    vi.stubGlobal('useRuntimeConfig', () =>
      buildRuntimeConfig({ provider: 'GMAIL' }),
    );

    const createEmailAdapter = await loadFactory();

    const adapter = createEmailAdapter();

    expect(adapter.name).toBe('Gmail');
  });

  it('lets the provider parameter override runtime config', async () => {
    const imports = await import('#imports');
    vi.mocked(imports.useRuntimeConfig).mockReturnValue(buildRuntimeConfig());
    const appImports = await import('#app');
    vi.mocked(appImports.useRuntimeConfig).mockReturnValue(
      buildRuntimeConfig(),
    );
    const appConfigImports = await import('#app/config');
    vi.mocked(appConfigImports.useRuntimeConfig).mockReturnValue(
      buildRuntimeConfig(),
    );
    vi.stubGlobal('useRuntimeConfig', () => buildRuntimeConfig());

    const createEmailAdapter = await loadFactory();

    const adapter = createEmailAdapter('mailgun');

    expect(adapter.name).toBe('Mailgun');
  });
});
