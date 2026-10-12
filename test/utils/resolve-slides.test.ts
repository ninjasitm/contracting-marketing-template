import { describe, it, expect, vi } from 'vitest';
import { resolveSlides } from '../../apps/web/utils/resolve-slides';
describe('slide resolution', () => {
  it('uses fresh queries, exact Content 2 paths, publication and safe overrides', async () => {
    const query = vi.fn(() => ({ find: () => Promise.resolve([
      { _path: '/_posts/data/example', slug: 'example', title: 'Article', published: true },
      { _path: '/_posts/data/private', slug: 'private', published: false },
    ]) }));
    const results = await resolveSlides([
      { type: 'post', postRef: 'example.md' },
      { type: 'post', postRef: '/_posts/data/example.md', title: 'Override', cta: { text: 'Bad', url: 'javascript:bad' } },
      { type: 'post', postRef: 'ample' }, { type: 'post', postRef: 'private' },
    ], query);
    expect(query).toHaveBeenCalledTimes(4);
    expect(results).toHaveLength(2);
    expect(results[0]?.link).toBe('/posts/example');
    expect(results[1]?.title).toBe('Override');
    expect(results[1]?.cta).toBeUndefined();
    expect(results[1]?.link).toBeUndefined();
  });
  it('maps service page entries, missing fallback and custom references without invented routes', async () => {
    const results = await resolveSlides([
      { type: 'service', serviceRef: 'Consulting' },
      { type: 'work', workRef: 'missing', title: 'Fallback', link: '/contact' },
      { type: 'course', contentId: 'custom' },
      { type: 'generic', cta: { text: 'Unsafe', url: 'java\nscript:bad' } },
    ], () => ({ find: () => Promise.resolve([{ services: [{ title: 'Consulting' }] }]) }), () => Promise.resolve({ type: 'generic', title: 'Extension', link: '/custom' }));
    expect(results.map(s => s.link)).toEqual(['/services', '/contact', '/custom', undefined]);
    expect(results[3]?.cta).toBeUndefined();
  });
});
