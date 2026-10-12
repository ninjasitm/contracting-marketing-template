import { mount, flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HubspotSalesLeadForm from '~/components/app/HubspotSalesLeadForm.vue';
import type { LeadField, LeadSubmit } from '~/types/lead-form';

const definition = {
  formKey: 'sales',
  schemaRevision: 'rev-1',
  fields: [{ name: 'name', type: 'text', label: 'Name', required: true }] satisfies LeadField[],
  protection: { enabled: false },
};
const MEETINGS = 'https://meetings.hubspot.com/example/intro';

function stub(post: unknown = { success: true }) {
  vi.stubGlobal('$fetch', vi.fn((_url: string, init?: { method?: string }) =>
    init?.method === 'POST'
      ? (post instanceof Error ? Promise.reject(post) : Promise.resolve(post))
      : Promise.resolve(definition)));
}
async function mountSales(props: Record<string, unknown> = {}, slots = {}) {
  const wrapper = mount(HubspotSalesLeadForm, { props: { source: { kind: 'hubspot', formKey: 'sales' }, variant: 'form', ...props }, slots, attachTo: document.body });
  await flushPromises();
  return wrapper;
}
async function submit(wrapper: Awaited<ReturnType<typeof mountSales>>) {
  await wrapper.get('input[type=text]').setValue('Ada');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
}

afterEach(() => vi.unstubAllGlobals());

describe('HubspotSalesLeadForm', () => {
  it('retains generic failed drafts and rejects stale pending success after source changes', async () => {
    let resolve!: (value: { success: true }) => void;
    const pending: LeadSubmit = vi.fn(() => new Promise<{ success: true }>((done) => { resolve = done; }));
    const source = { kind: 'generic' as const, fields: definition.fields, submit: pending };
    const wrapper = await mountSales({ source, meetingsUrl: MEETINGS });
    await wrapper.get('input').setValue('Example');
    await wrapper.get('form').trigger('submit');
    expect(wrapper.find('iframe').exists()).toBe(false);
    await wrapper.get('form').trigger('submit');
    expect(pending).toHaveBeenCalledTimes(1);
    const failed: LeadSubmit = () => Promise.resolve(false as never);
    await wrapper.setProps({ source: { ...source, submit: failed } });
    await wrapper.get('input').setValue('New draft');
    resolve({ success: true }); await flushPromises();
    expect(wrapper.emitted('lead-success')).toBeUndefined();
    expect(wrapper.get<HTMLInputElement>('input').element.value).toBe('New draft');
    await wrapper.get('form').trigger('submit'); await flushPromises();
    expect(wrapper.get<HTMLInputElement>('input').element.value).toBe('New draft');
    expect(wrapper.text()).not.toContain('Choose a meeting time');
    expect(wrapper.find('iframe').exists()).toBe(false);
    wrapper.unmount();
  });
  it('supports generic confirmation, opt-in and semantic source resets without provider requests', async () => {
    stub();
    const callback = vi.fn(() => Promise.resolve({ success: true as const }));
    const source = { kind: 'generic' as const, fields: definition.fields, submit: callback };
    const wrapper = await mountSales({ source, meetingsUrl: MEETINGS });
    expect($fetch).not.toHaveBeenCalled();
    await submit(wrapper);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(wrapper.find('iframe').exists()).toBe(false);
    await wrapper.setProps({ source: { ...source } });
    expect(wrapper.text()).toContain('Choose a meeting time');
    await wrapper.get('button').trigger('click');
    expect(wrapper.find('iframe').exists()).toBe(true);
    await wrapper.setProps({ source: { ...source, submit: () => Promise.resolve({ success: true }) } });
    expect(wrapper.find('iframe').exists()).toBe(false);
    expect(wrapper.find('form').exists()).toBe(true);
    wrapper.unmount();
  });
  it('shows no iframe before lead success, nor after success until the user opts in', async () => {
    stub();
    const wrapper = await mountSales({ meetingsUrl: MEETINGS });
    expect(wrapper.find('iframe').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Choose a meeting time');

    await submit(wrapper);
    expect(wrapper.emitted('lead-success')).toHaveLength(1);
    expect(wrapper.find('iframe').exists()).toBe(false);

    await wrapper.findAll('button').find((b) => b.text() === 'Choose a meeting time')!.trigger('click');
    const iframe = wrapper.get('iframe');
    expect(iframe.attributes('src')).toBe(`${MEETINGS}?embed=true`);
    expect(iframe.attributes('title')).toBeTruthy();
    expect(wrapper.text().toLowerCase()).not.toContain('booked');
    wrapper.unmount();
  });

  it('keeps scheduling hidden when the lead submission fails', async () => {
    stub(Object.assign(new Error('x'), { data: { code: 'UPSTREAM_UNAVAILABLE' } }));
    const wrapper = await mountSales({ meetingsUrl: MEETINGS });
    await submit(wrapper);
    expect(wrapper.emitted('lead-success')).toBeUndefined();
    expect(wrapper.find('iframe').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Choose a meeting time');
    wrapper.unmount();
  });

  it.each([
    'http://meetings.hubspot.com/example/intro',
    'https://evil.example/example/intro',
    'https://meetings.hubspot.com.evil.example/x',
    'https://meetings.hubspot.com/example?email=a@b.co',
    'https://user:pw@meetings.hubspot.com/example',
    'https://meetings.hubspot.com:8443/example',
    'https://meetings.hubspot.com/',
    'not a url',
  ])('never offers scheduling for untrusted URL %s', async (meetingsUrl) => {
    stub();
    const wrapper = await mountSales({ meetingsUrl });
    await submit(wrapper);
    expect(wrapper.emitted('lead-success')).toHaveLength(1);
    expect(wrapper.text()).not.toContain('Choose a meeting time');
    expect(wrapper.find('iframe').exists()).toBe(false);
    wrapper.unmount();
  });

  it('renders the scheduling slot only after success and opt-in, with the lead result', async () => {
    stub({ success: true });
    const wrapper = await mountSales({}, {
      scheduling: `<template #scheduling="{ result }"><p id="slot">slot {{ result.success }}</p></template>`,
    });
    expect(wrapper.find('#slot').exists()).toBe(false);
    await submit(wrapper);
    expect(wrapper.find('#slot').exists()).toBe(false);
    await wrapper.findAll('button').find((b) => b.text() === 'Choose a meeting time')!.trigger('click');
    expect(wrapper.get('#slot').text()).toBe('slot true');
    expect(wrapper.find('iframe').exists()).toBe(false);
    wrapper.unmount();
  });
});
