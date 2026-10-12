import { mount, flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ContactModal from '@/components/app/ContactModal.vue';
afterEach(() => vi.unstubAllGlobals());

function enter(name: string, value: string) {
  const input = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`)!;
  input.value = value; input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('ContactModal', () => {
  it('does not lock or hide surrounding content when initially closed', async () => {
    const surrounding = document.createElement('main');
    surrounding.textContent = 'Surrounding content'; document.body.append(surrounding);
    const wrapper = mount(ContactModal, { attachTo: document.body });
    try {
      await flushPromises();
      expect(document.querySelector('[role="dialog"]')).toBeNull();
      expect(document.body.style.pointerEvents).not.toBe('none');
      expect(surrounding.getAttribute('aria-hidden')).not.toBe('true');
      expect(surrounding.hasAttribute('inert')).toBe(false);
    } finally { wrapper.unmount(); surrounding.remove(); }
  });
  it('releases modal effects and restores trigger focus on Escape', async () => {
    const surrounding = document.createElement('main'); document.body.append(surrounding);
    const wrapper = mount(ContactModal, { attachTo: document.body });
    try {
      const trigger = wrapper.get('button').element as HTMLButtonElement;
      trigger.focus(); trigger.click(); await flushPromises();
      expect(wrapper.emitted('update:open')?.[0]).toEqual([true]);
      await wrapper.setProps({ open: true }); await flushPromises();
      expect(document.body.style.pointerEvents).toBe('none');
      expect(surrounding.getAttribute('aria-hidden')).toBe('true');
      document.querySelector('[role="dialog"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await flushPromises();
      expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false]);
      await wrapper.setProps({ open: false }); await flushPromises();
      expect(document.querySelector('[role="dialog"]')).toBeNull();
      expect(document.body.style.pointerEvents).not.toBe('none');
      expect(surrounding.getAttribute('aria-hidden')).not.toBe('true');
      expect(surrounding.hasAttribute('inert')).toBe(false);
      await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
    } finally { wrapper.unmount(); surrounding.remove(); }
  });
  it.each([true, false])('retains a pending request and its result across unmount (success=%s)', async success => {
    let resolve!: (response: { success: boolean }) => void;
    const fetch = vi.fn(() => new Promise(done => { resolve = done; })); vi.stubGlobal('$fetch', fetch);
    const wrapper = mount(ContactModal, { attachTo: document.body, props: { open: true } });
    try {
      await flushPromises();
      enter('fullName', 'Jane Doe'); enter('email', 'jane@example.com'); enter('message', 'Please help with my project.');
      await flushPromises();
      document.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); await flushPromises();
      expect(fetch).toHaveBeenCalledTimes(1);
      await wrapper.setProps({ open: false }); await flushPromises();
      expect(document.querySelector('form')).toBeNull();
      await wrapper.setProps({ open: true }); await flushPromises();
      expect(document.querySelector('fieldset')!.disabled).toBe(true);
      document.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); await flushPromises();
      expect(fetch).toHaveBeenCalledTimes(1);
      await wrapper.setProps({ open: false }); await flushPromises();
      resolve({ success }); await flushPromises();
      expect(wrapper.emitted('success')?.length ?? 0).toBe(success ? 1 : 0);
      await wrapper.setProps({ open: true }); await flushPromises();
      if (success) {
        expect(document.querySelector('[role="status"]')!.textContent).toContain('Thank you');
        expect(document.querySelector('form')).toBeNull();
      } else {
        expect(document.querySelector<HTMLInputElement>('[name="fullName"]')!.value).toBe('Jane Doe');
        expect(document.querySelector('[role="alert"]')!.textContent).toContain('could not be sent');
        expect(document.querySelector('fieldset')!.disabled).toBe(false);
      }
    } finally { wrapper.unmount(); }
  });
  it('provides accessible dialog semantics and retains draft across controlled dismissal', async () => {
    const wrapper = mount(ContactModal, { attachTo: document.body, props: { open: true } });
    await flushPromises();
    const dialog = document.querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy();
    const input = dialog.querySelector<HTMLInputElement>('[name="fullName"]')!;
    input.value = 'Draft name'; input.dispatchEvent(new Event('input', { bubbles: true }));
    const close = Array.from(dialog.querySelectorAll('button')).find((button) => button.textContent?.includes('Close'))!;
    close.click(); await flushPromises();
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false]);
    expect(wrapper.emitted('close')).toHaveLength(1);
    await wrapper.setProps({ open: false }); await wrapper.setProps({ open: true }); await flushPromises();
    expect(document.querySelector<HTMLInputElement>('[name="fullName"]')!.value).toBe('Draft name');
    wrapper.unmount();
  });
});
