import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getPostLoadFailureStatus,
  useContentQueries,
} from '../../apps/web/composables/useContent';

const calls: Array<{ key: string; handler: () => Promise<unknown> }> = [];
const queryCalls: Array<{ path: string; builder: any }> = [];
let queryResults: unknown[] = [];

function createBuilder() {
  const builder: any = {
    only: vi.fn(() => builder),
    where: vi.fn(() => builder),
    sort: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    find: vi.fn(() => Promise.resolve(queryResults)),
    findOne: vi.fn(() => Promise.resolve(null)),
  };
  return builder;
}

beforeEach(() => {
  calls.length = 0;
  queryCalls.length = 0;
  queryResults = [];
  vi.stubGlobal('queryContent', (path: string) => {
    const builder = createBuilder();
    queryCalls.push({ path, builder });
    return builder;
  });
  vi.stubGlobal(
    'useAsyncData',
    (key: string, handler: () => Promise<unknown>) => {
      const call = { key, handler };
      calls.push(call);
      return call;
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('post content queries', () => {
  it('keeps post-not-found errors distinct from other load failures', () => {
    expect(getPostLoadFailureStatus({ statusCode: 404 })).toBe(404);
    expect(getPostLoadFailureStatus(new Error('query failed'))).toBe(500);
  });

  it('lists published posts with tags for category filtering', async () => {
    void useContentQueries.usePosts();
    const call = calls[0];
    if (!call) throw new Error('Posts query was not captured');
    await call.handler();

    const queryCall = queryCalls[0];
    if (!queryCall) throw new Error('Content query was not captured');
    const { path, builder } = queryCall;
    expect(path).toBe('/_posts/data');
    expect(builder.only).toHaveBeenCalledWith([
      'title',
      'slug',
      'summary',
      'date',
      'heroImage',
      'author',
      'featured',
      'tags',
    ]);
    expect(builder.where).toHaveBeenCalledWith({ published: { $eq: true } });
  });

  it('only loads a post by slug when it is published', async () => {
    void useContentQueries.usePost('template-example');
    const call = calls[0];
    if (!call) throw new Error('Post query was not captured');
    await call.handler();

    const queryCall = queryCalls[0];
    if (!queryCall) throw new Error('Content query was not captured');
    const { path, builder } = queryCall;
    expect(path).toBe('/_posts/data');
    expect(builder.where).toHaveBeenNthCalledWith(1, {
      slug: 'template-example',
    });
    expect(builder.where).toHaveBeenNthCalledWith(2, {
      published: { $eq: true },
    });
    expect(builder.findOne).toHaveBeenCalledOnce();
  });

  it('skips published posts missing a usable title or slug', async () => {
    queryResults = [
      { title: 'No slug' },
      { title: '   ', slug: 'blank-title' },
      { title: 'Usable post', slug: 'usable-post' },
    ];
    void useContentQueries.usePosts();
    const call = calls[0];
    if (!call) throw new Error('Posts query was not captured');

    await expect(call.handler()).resolves.toEqual([
      { title: 'Usable post', slug: 'usable-post' },
    ]);
  });
});
