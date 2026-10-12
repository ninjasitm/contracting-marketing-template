import { mount, flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HubspotLeadForm from '~/components/app/HubspotLeadForm.vue';
import type { HubspotDefinition } from '~/types/hubspot-lead-form';

const definition = (over: Partial<HubspotDefinition> = {}): HubspotDefinition => ({
  formKey: 'sales',
  schemaRevision: 'rev-1',
  fields: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'topic', type: 'dropdown', label: 'Topic', options: [{ label: 'Repair', value: 'repair' }, { label: 'Install', value: 'install' }] },
  ],
  protection: { enabled: false },
  ...over,
});

const failure = (code: string) => Object.assign(new Error('upstream'), { data: { code } });

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

function widgetMock() {
  const callbacks: Record<string, (...values: string[]) => void>[] = [];
  const api = {
    render: vi.fn((_element: HTMLElement, options: Record<string, (...values: string[]) => void>) => {
      callbacks.push(options);
      return `widget-${callbacks.length}`;
    }),
    reset: vi.fn(), remove: vi.fn(),
  };
  vi.stubGlobal('turnstile', api);
  return { api, callbacks };
}

// Stubs $fetch: GETs resolve from `gets` in order, POSTs from `posts` in order.
function stubFetch(gets: unknown[], posts: unknown[] = []) {
  const fetch = vi.fn((_url: string, init?: { method?: string }) => {
    const next = (init?.method === 'POST' ? posts : gets).shift();
    return next instanceof Error ? Promise.reject(next) : Promise.resolve(next);
  });
  vi.stubGlobal('$fetch', fetch);
  return fetch;
}
const posts = (fetch: ReturnType<typeof stubFetch>) => fetch.mock.calls.filter(([, init]) => init?.method === 'POST');
const mountForm = async (props = {}) => {
  const wrapper = mount(HubspotLeadForm, { props: { formKey: 'sales', variant: 'form', ...props }, attachTo: document.body });
  await flushPromises();
  return wrapper;
};
async function submitWith(wrapper: Awaited<ReturnType<typeof mountForm>>, name = 'Ada') {
  await wrapper.get('input[type=text]').setValue(name);
  await wrapper.get('form').trigger('submit');
  await flushPromises();
}

afterEach(() => { vi.unstubAllGlobals(); delete (window as { turnstile?: unknown }).turnstile; });

describe('HubspotLeadForm', () => {
  it.each([
    { fields: [] },
    { fields: Array(101).fill({ name: 'name', type: 'text', label: 'Name' }) },
    { fields: [{ name: 'name', type: 'unknown', label: 'Name' }] },
    { fields: [{ name: 'name', type: 'text', label: 'Name', defaultValue: undefined }] },
    { fields: [{ name: 'topic', type: 'dropdown', label: 'Topic', options: Array(1) }] },
    { fields: [{ name: 'name', type: 'text', label: 'Name', privateId: 'secret' }] },
    { protection: undefined },
    { protection: { enabled: false, siteKey: 'unexpected' } },
    { protection: { enabled: true, siteKey: '' } },
    { protection: { enabled: true, siteKey: 'key' } },
    { protection: { enabled: true, siteKey: 'key', action: '' } },
    { formKey: 'another-alias' },
    { schemaRevision: '' },
    { schemaRevision: 'x'.repeat(129) },
    { consent: {} },
    { portalId: 'private' },
  ])('rejects malformed public metadata before mounting a form: %j', async (invalid) => {
    const { api } = widgetMock();
    stubFetch([{ ...definition(), ...invalid }]);
    const wrapper = await mountForm();
    expect(wrapper.find('form').exists()).toBe(false);
    expect(wrapper.get('[role=alert]').text()).toContain('could not load');
    expect(api.render).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('retains the same-alias draft and shows one safe error when revision reload is invalid', async () => {
    stubFetch([definition(), { ...definition(), protection: {} }], [failure('FORM_CHANGED')]);
    const wrapper = await mountForm();
    const input = wrapper.get('input').element;
    await submitWith(wrapper);
    expect(wrapper.get('input').element).toBe(input);
    expect(wrapper.get<HTMLInputElement>('input').element.value).toBe('Ada');
    expect(wrapper.findAll('[role=alert]')).toHaveLength(1);
    expect(wrapper.text()).toContain('could not reach');
    expect(wrapper.text()).not.toContain('just updated');
    wrapper.unmount();
  });

  it('retains the same-alias draft on a failed revision GET without retrying', async () => {
    const fetch = stubFetch([definition(), failure('UPSTREAM_UNAVAILABLE')], [failure('FORM_CHANGED')]);
    const wrapper = await mountForm();
    await submitWith(wrapper);
    expect(wrapper.get<HTMLInputElement>('input').element.value).toBe('Ada');
    expect(wrapper.findAll('[role=alert]')).toHaveLength(1);
    expect(wrapper.get('[role=alert]').text()).toContain('could not reach');
    expect(posts(fetch)).toHaveLength(1);
    expect(fetch).toHaveBeenCalledTimes(3);
    wrapper.unmount();
  });

  it.each(['alias', 'unmount'])('ignores an initial GET that completes after %s', async (change) => {
    const initial = deferred<HubspotDefinition>();
    const { api } = widgetMock();
    stubFetch([initial.promise, definition({ formKey: 'other' })]);
    const wrapper = await mountForm();
    if (change === 'alias') {
      await wrapper.setProps({ formKey: 'other' });
      await flushPromises();
      await wrapper.get('input').setValue('Bea');
    } else wrapper.unmount();
    initial.resolve(definition({ protection: { enabled: true, siteKey: 'old-key', action: 'lead' } }));
    await flushPromises();
    expect(api.render).not.toHaveBeenCalled();
    if (change === 'alias') {
      expect(wrapper.get<HTMLInputElement>('input').element.value).toBe('Bea');
      wrapper.unmount();
    }
  });

  it('does not start an old FORM_CHANGED reload against the new alias', async () => {
    const response = deferred<unknown>();
    const fetch = stubFetch([definition(), definition({ formKey: 'other' })], [response.promise]);
    const wrapper = await mountForm();
    await submitWith(wrapper);
    await wrapper.setProps({ formKey: 'other' });
    await flushPromises();
    response.resolve({ code: 'FORM_CHANGED' });
    await flushPromises();
    expect(fetch.mock.calls.map(([url]) => url)).toEqual([
      '/api/lead-forms/hubspot/sales', '/api/lead-forms/hubspot/sales', '/api/lead-forms/hubspot/other',
    ]);
    expect(wrapper.text()).not.toContain('just updated');
    wrapper.unmount();
  });

  it('ignores an old revision reload after an alias switch, including widget reset and callbacks', async () => {
    const reload = deferred<HubspotDefinition>();
    const { api, callbacks } = widgetMock();
    const protectedDefinition = definition({ protection: { enabled: true, siteKey: 'key-a', action: 'lead' } });
    const fetch = stubFetch([protectedDefinition, reload.promise, definition({ formKey: 'other', protection: { enabled: true, siteKey: 'key-b', action: 'other' } })], [failure('FORM_CHANGED'), failure('DELIVERY_UNKNOWN')]);
    const wrapper = await mountForm();
    callbacks[0]!.callback!('a-token');
    await submitWith(wrapper);
    await wrapper.setProps({ formKey: 'other' });
    await flushPromises();
    callbacks[1]!.callback!('b-token');
    const bInput = wrapper.get('input').element;
    await wrapper.get('input').setValue('Bea');
    reload.resolve(definition({ schemaRevision: 'old-reload' }));
    await flushPromises();
    callbacks[0]!.callback!('late-a-token');
    callbacks[0]!['expired-callback']!();
    expect(api.reset).not.toHaveBeenCalled();
    expect(wrapper.get('input').element).toBe(bInput);
    expect(wrapper.get<HTMLInputElement>('input').element.value).toBe('Bea');
    expect(wrapper.text()).not.toContain('just updated');
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(posts(fetch)[1]).toMatchObject(['/api/lead-forms/hubspot/other', { body: { schemaRevision: 'rev-1', turnstileToken: 'b-token' } }]);
    expect(fetch.mock.calls[2]![0]).toBe('/api/lead-forms/hubspot/sales');
    wrapper.unmount();
  });

  it.each(['alias', 'variant', 'unmount'])('ignores old POST success after %s changes the presented context', async (change) => {
    const response = deferred<{ success: true }>();
    const { api, callbacks } = widgetMock();
    const protectedDefinition = definition({ protection: { enabled: true, siteKey: 'key', action: 'lead' } });
    const fetch = stubFetch([protectedDefinition, { ...protectedDefinition, formKey: 'other' }], [response.promise]);
    const success = vi.fn();
    const wrapper = await mountForm({ onSuccess: success });
    callbacks[0]!.callback!('a-token');
    await submitWith(wrapper);
    if (change === 'alias') await wrapper.setProps({ formKey: 'other' });
    else if (change === 'variant') await wrapper.setProps({ variant: 'conversational' });
    else wrapper.unmount();
    await flushPromises();
    response.resolve({ success: true });
    await flushPromises();
    expect(api.reset).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledTimes(change === 'alias' ? 3 : 2);
    if (change !== 'unmount') wrapper.unmount();
  });

  it('rotates protected metadata without retaining the previous widget or token', async () => {
    const { api, callbacks } = widgetMock();
    const fetch = stubFetch([
      definition({ protection: { enabled: true, siteKey: 'old-key', action: 'old-action' } }),
      definition({ schemaRevision: 'rev-2', protection: { enabled: true, siteKey: 'new-key', action: 'new-action' } }),
    ], [failure('FORM_CHANGED'), failure('DELIVERY_UNKNOWN')]);
    const wrapper = await mountForm();
    callbacks[0]!.callback!('old-token');
    await submitWith(wrapper);
    expect(api.remove).toHaveBeenCalledWith('widget-1');
    expect(api.render).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ sitekey: 'new-key', action: 'new-action' }));
    callbacks[0]!.callback!('late-old-token');
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(posts(fetch)).toHaveLength(1);
    callbacks[1]!.callback!('new-token');
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(posts(fetch)[1]![1]).toMatchObject({ body: { turnstileToken: 'new-token', schemaRevision: 'rev-2' } });
    wrapper.unmount();
  });
  it('loads the definition and posts revision and answers to the configured route', async () => {
    const fetch = stubFetch([definition()], [{ success: true }]);
    const wrapper = await mountForm();
    expect(fetch).toHaveBeenCalledWith('/api/lead-forms/hubspot/sales');
    await submitWith(wrapper);
    expect(fetch).toHaveBeenLastCalledWith('/api/lead-forms/hubspot/sales', {
      method: 'POST',
      body: { schemaRevision: 'rev-1', answers: expect.objectContaining({ name: 'Ada' }) },
    });
    expect(wrapper.emitted('success')).toHaveLength(1);
    wrapper.unmount();
  });

  it('shows a clear error state when the definition cannot load', async () => {
    stubFetch([failure('UNSUPPORTED_FORM')]);
    const wrapper = await mountForm();
    expect(wrapper.find('form').exists()).toBe(false);
    expect(wrapper.get('[role=alert]').text()).toContain('cannot be displayed');
    wrapper.unmount();
  });

  it.each([
    ['NOT_CONFIGURED', 'not available'],
    ['INVALID_SUBMISSION', 'could not be accepted'],
    ['VERIFICATION_FAILED', 'security check'],
    ['UPSTREAM_UNAVAILABLE', 'could not reach'],
    ['SOMETHING_ELSE', 'Something went wrong'],
  ])('maps %s to a safe message without retrying', async (code, text) => {
    const fetch = stubFetch([definition()], [failure(code)]);
    const wrapper = await mountForm();
    await submitWith(wrapper);
    expect(wrapper.findAll('[role=alert]')).toHaveLength(1);
    expect(wrapper.get('[role=alert]').text()).toContain(text);
    expect(wrapper.text()).not.toContain('upstream');
    expect(posts(fetch)).toHaveLength(1);
    expect(wrapper.get<HTMLInputElement>('input[type=text]').element.value).toBe('Ada');
    wrapper.unmount();
  });

  it('warns that a DELIVERY_UNKNOWN submission may have been received and never retries', async () => {
    vi.useFakeTimers();
    const fetch = stubFetch([definition()], [failure('DELIVERY_UNKNOWN')]);
    const wrapper = await mountForm();
    await submitWith(wrapper);
    await vi.advanceTimersByTimeAsync(60_000);
    vi.useRealTimers();
    expect(wrapper.findAll('[role=alert]')).toHaveLength(1);
    expect(wrapper.get('[role=alert]').text()).toContain('may have been received');
    expect(wrapper.text()).toContain('do not resubmit');
    expect(wrapper.text()).not.toContain('try again');
    expect(posts(fetch)).toHaveLength(1);
    expect(wrapper.emitted('success')).toBeUndefined();
    wrapper.unmount();
  });

  it('migrates in place on FORM_CHANGED, keeps compatible answers and waits for the user to resubmit', async () => {
    const changed = definition({
      schemaRevision: 'rev-2',
      fields: [
        { name: 'name', type: 'text', label: 'Full name', required: true },
        { name: 'topic', type: 'dropdown', label: 'Topic', options: [{ label: 'Install', value: 'install' }] },
      ],
    });
    const fetch = stubFetch([definition(), changed], [failure('FORM_CHANGED'), { success: true }]);
    const wrapper = await mountForm();
    const input = wrapper.get('input[type=text]').element;
    await wrapper.get('select').setValue('repair');
    await submitWith(wrapper);

    expect(posts(fetch)).toHaveLength(1); // no automatic resubmit
    expect(wrapper.get('input[type=text]').element).toBe(input); // not remounted
    expect(wrapper.get<HTMLInputElement>('input[type=text]').element.value).toBe('Ada');
    expect(wrapper.get<HTMLSelectElement>('select').element.value).not.toBe('repair'); // incompatible option dropped
    expect(wrapper.text()).toContain('Full name');
    expect(wrapper.findAll('[role=alert]')).toHaveLength(0);
    expect(wrapper.findAll('[role=status]').filter((n) => n.text().includes('review them and submit again'))).toHaveLength(1);

    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(posts(fetch)).toHaveLength(2);
    expect(posts(fetch)[1]![1]).toMatchObject({ body: { schemaRevision: 'rev-2' } });
    expect(wrapper.emitted('success')).toHaveLength(1);
    wrapper.unmount();
  });

  it('renders Turnstile only when protection is enabled and blocks submit until a token exists', async () => {
    let callbacks: Record<string, (token?: string) => void> = {};
    const turnstile = { render: vi.fn((_el, options) => { callbacks = options; return 'w1'; }), reset: vi.fn(), remove: vi.fn() };
    (window as { turnstile?: unknown }).turnstile = turnstile;

    stubFetch([definition()]);
    const plain = await mountForm();
    expect(turnstile.render).not.toHaveBeenCalled();
    plain.unmount();

    const fetch = stubFetch(
      [definition({ protection: { enabled: true, siteKey: 'site-key', action: 'lead' } })],
      [{ success: true }],
    );
    const wrapper = await mountForm();
    expect(turnstile.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ sitekey: 'site-key', action: 'lead' }));

    await submitWith(wrapper);
    expect(posts(fetch)).toHaveLength(0);
    expect(wrapper.findAll('[role=alert]')).toHaveLength(1);
    expect(wrapper.get('[role=alert]').text()).toContain('security check');

    callbacks.callback!('tok-1');
    callbacks['expired-callback']!();
    await submitWith(wrapper);
    expect(posts(fetch)).toHaveLength(0); // expired token is discarded

    callbacks.callback!('tok-2');
    await submitWith(wrapper);
    expect(posts(fetch)[0]![1]).toMatchObject({ body: { turnstileToken: 'tok-2' } });
    expect(turnstile.reset).toHaveBeenCalled();
    wrapper.unmount();
    expect(turnstile.remove).toHaveBeenCalledWith('w1');
  });
});
