// @vitest-environment node
import { describe, expect, it } from 'vitest';
import worker from '../../apps/server/src/index';

describe('optional Cloudflare Worker example', () => {
  it('serves GET /health as JSON', async () => {
    const response = await worker.fetch(new Request('https://example.test/health'));

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(await response.json()).toEqual({ status: 'ok' });
  });

  it('returns 404 for unknown GET paths', async () => {
    const response = await worker.fetch(new Request('https://example.test/unknown'));

    expect(response.status).toBe(404);
    expect(await response.text()).toBe('Not Found');
  });

  it('returns 405 and Allow: GET for unsupported methods', async () => {
    const response = await worker.fetch(new Request('https://example.test/health', { method: 'POST' }));

    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('GET');
    expect(await response.text()).toBe('Method Not Allowed');
  });
});
