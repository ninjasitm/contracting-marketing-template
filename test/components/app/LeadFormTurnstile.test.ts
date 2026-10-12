import { mount, flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LeadFormTurnstile from '~/components/app/LeadFormTurnstile.vue';

function sdk() {
  const callbacks: Record<string, (...values: string[]) => void>[] = [];
  const api = {
    render: vi.fn((_element: HTMLElement, options: Record<string, (...values: string[]) => void>) => {
      callbacks.push(options);
      return `w${callbacks.length}`;
    }), reset: vi.fn(), remove: vi.fn(),
  };
  vi.stubGlobal('turnstile', api);
  return { api, callbacks };
}
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('LeadFormTurnstile', () => {
  it('rotates public props, isolates instances and ignores callbacks from removed widgets', async () => {
    const { api, callbacks } = sdk();
    const token = vi.fn();
    const first = mount(LeadFormTurnstile, { props: { siteKey: 'one', action: 'lead', onToken: token } });
    const second = mount(LeadFormTurnstile, { props: { siteKey: 'two' } });
    await flushPromises();
    await first.setProps({ siteKey: 'three', action: 'new' });
    await flushPromises();
    expect(api.remove).toHaveBeenCalledWith('w1');
    expect(api.render).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ sitekey: 'three', action: 'new' }));
    callbacks[0]!.callback!('stale');
    callbacks[0]!['expired-callback']!();
    expect(first.emitted('token')).toBeUndefined();
    expect(first.emitted('expired')).toBeUndefined();
    callbacks[1]!.callback!('second');
    callbacks[2]!.callback!('fresh');
    expect(second.emitted('token')).toEqual([['second']]);
    expect(first.emitted('token')).toEqual([['fresh']]);
    first.vm.reset();
    expect(api.reset).toHaveBeenCalledWith('w3');
    first.unmount();
    callbacks[2]!.callback!('unmounted');
    expect(token).toHaveBeenCalledExactlyOnceWith('fresh');
    expect(api.remove).not.toHaveBeenCalledWith('w2');
    second.unmount();
  });

  it.each(['render', 'reset', 'remove'] as const)('handles SDK %s exceptions safely', async (method) => {
    const { api } = sdk();
    api[method].mockImplementation(() => { throw new Error('private SDK failure'); });
    const wrapper = mount(LeadFormTurnstile, { props: { siteKey: 'key' } });
    await flushPromises();
    if (method === 'reset') { wrapper.vm.reset(); await flushPromises(); }
    if (method === 'remove') expect(() => wrapper.unmount()).not.toThrow();
    else {
      expect(wrapper.get('[role=alert]').text()).toContain('verification check');
      expect(wrapper.text()).not.toContain('private SDK failure');
      wrapper.unmount();
    }
  });

  it('shares lazy script loading, skips unmounted renders and retries missing SDK on remount', async () => {
    const scripts: HTMLScriptElement[] = [];
    vi.spyOn(document.head, 'appendChild').mockImplementation((node) => {
      scripts.push(node as HTMLScriptElement);
      return node;
    });
    const first = mount(LeadFormTurnstile, { props: { siteKey: 'one' } });
    const second = mount(LeadFormTurnstile, { props: { siteKey: 'two' } });
    expect(scripts).toHaveLength(1);
    expect(scripts[0]!.src).toBe('https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit');
    first.unmount();
    scripts[0]!.dispatchEvent(new Event('load'));
    await flushPromises();
    expect(second.get('[role=alert]').text()).toContain('could not load');
    second.unmount();
    const third = mount(LeadFormTurnstile, { props: { siteKey: 'three' } });
    const fourth = mount(LeadFormTurnstile, { props: { siteKey: 'four' } });
    expect(scripts).toHaveLength(2);
    const { api } = sdk();
    third.unmount();
    scripts[1]!.dispatchEvent(new Event('load'));
    await flushPromises();
    expect(api.render).toHaveBeenCalledExactlyOnceWith(expect.anything(), expect.objectContaining({ sitekey: 'four' }));
    fourth.unmount();
  });
});
