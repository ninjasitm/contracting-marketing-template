// @vitest-environment node

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { createEmailAdapter } from '~/server/utils/email/factory';

vi.mock('h3', () => ({
  defineEventHandler: (fn: any) => fn,
  readBody: vi.fn(),
  createError: (payload: any) => payload,
}));

vi.mock('#imports', () => ({
  defineEventHandler: (fn: any) => fn,
  readBody: vi.fn(),
  createError: (payload: any) => payload,
  useRuntimeConfig: vi.fn(),
  useAppConfig: vi.fn(),
}));

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({}),
  useAppConfig: () => ({}),
}));

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
  const module = await import('../../../server/api/contact/send-email.post');
  return module.default as (event: any) => Promise<unknown>;
};

beforeEach(async () => {
  const { readBody } = await import('h3');
  vi.mocked(readBody).mockResolvedValue(baseBody);
  const imports = await import('#imports');
  vi.mocked(imports.readBody).mockResolvedValue(baseBody);
  vi.mocked(imports.useRuntimeConfig).mockReturnValue(buildRuntimeConfig());
  vi.mocked(imports.useAppConfig).mockReturnValue({ companyName: 'Acme Co' });
  const appImports = await import('#app');
  vi.spyOn(appImports, 'useRuntimeConfig').mockReturnValue(
    buildRuntimeConfig(),
  );
  vi.spyOn(appImports, 'useAppConfig').mockReturnValue({
    companyName: 'Acme Co',
  });
  const appConfigImports = await import('#app/config');
  vi.spyOn(appConfigImports, 'useRuntimeConfig').mockReturnValue(
    buildRuntimeConfig(),
  );
  vi.spyOn(appConfigImports, 'useAppConfig').mockReturnValue({
    companyName: 'Acme Co',
  });
  vi.stubGlobal('defineEventHandler', (fn: any) => fn);
  vi.stubGlobal('readBody', async () => baseBody);
  vi.stubGlobal('createError', (payload: any) => payload);
  vi.stubGlobal('useRuntimeConfig', () => buildRuntimeConfig());
  vi.stubGlobal('useAppConfig', () => ({ companyName: 'Acme Co' }));
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

  it('falls back to a default recipient when config is missing', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    vi.mocked(createEmailAdapter).mockReturnValue({ name: 'Mock', send });

    vi.stubGlobal('useRuntimeConfig', () => ({ mail: { auth: {} } }));
    const nuxtImports = await import('#imports');
    vi.mocked(nuxtImports.useRuntimeConfig).mockReturnValue({
      mail: { auth: {} },
    });
    const appImports = await import('#app');
    vi.spyOn(appImports, 'useRuntimeConfig').mockReturnValue({
      mail: { auth: {} },
    });
    const appConfigImports = await import('#app/config');
    vi.spyOn(appConfigImports, 'useRuntimeConfig').mockReturnValue({
      mail: { auth: {} },
    });

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
