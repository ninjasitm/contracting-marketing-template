import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ContactForm from '@/components/app/ContactForm.vue';
import { useContactForm } from '@/composables/useContactForm';

afterEach(() => vi.unstubAllGlobals());
async function fill(wrapper: ReturnType<typeof mount>) {
  await wrapper.get('[name="fullName"]').setValue('Jane Doe');
  await wrapper.get('[name="email"]').setValue('jane@example.com');
  await wrapper.get('[name="message"]').setValue('Please help with my project.');
}
describe('ContactForm', () => {
  it('retains the optional external controller across remounts and preserves success slot', async () => {
    const state = useContactForm();
    const first = mount(ContactForm, { props: { state } });
    await first.get('[name="fullName"]').setValue('Retained draft');
    first.unmount();
    const second = mount(ContactForm, { props: { state }, slots: { success: '<p>Custom confirmation</p>' } });
    expect((second.get('[name="fullName"]').element as HTMLInputElement).value).toBe('Retained draft');
    state.submitted.value = true; await flushPromises();
    expect(second.get('[role="status"]').text()).toBe('Custom confirmation');
    second.unmount();
  });
  it('validates and associates unique labels and errors without sending', async () => {
    const fetch = vi.fn(); vi.stubGlobal('$fetch', fetch);
    const wrapper = mount(ContactForm);
    const pair = mount(defineComponent({ components: { ContactForm }, template: '<ContactForm /><ContactForm />' }));
    const inputs = pair.findAll('[name="fullName"]');
    const [firstInput, secondInput] = inputs;
    if (!firstInput || !secondInput) throw new Error('Expected two contact form inputs');
    expect(firstInput.attributes('id')).not.toBe(secondInput.attributes('id'));
    await wrapper.get('form').trigger('submit');
    expect(fetch).not.toHaveBeenCalled();
    expect(wrapper.get('[name="email"]').attributes('aria-invalid')).toBe('true');
    expect(wrapper.text()).toContain('Please enter a valid email address');
    wrapper.unmount(); pair.unmount();
  });
  it('posts exactly the local payload once, resets only on confirmed success', async () => {
    let resolve!: (value: { success: boolean }) => void;
    const fetch = vi.fn(() => new Promise((done) => { resolve = done; }));
    vi.stubGlobal('$fetch', fetch);
    const wrapper = mount(ContactForm, { props: { categories: ['Quote'] } });
    await fill(wrapper);
    await wrapper.get('form').trigger('submit');
    await wrapper.get('form').trigger('submit');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/contact/send-email', { method: 'POST', body: {
      fullName: 'Jane Doe', email: 'jane@example.com', phone: '', message: 'Quote:\nPlease help with my project.',
    } });
    expect(wrapper.get('fieldset').attributes('disabled')).toBeDefined();
    resolve({ success: true }); await flushPromises();
    expect(wrapper.emitted('success')).toHaveLength(1);
    expect(wrapper.get('[role="status"]').text()).toContain('Thank you');
    expect(wrapper.find('form').exists()).toBe(false);
    wrapper.unmount();
  });
  it.each([false, 'throw'])('retains entered data and permits retry on failure %s', async (failure) => {
    const fetch = vi.fn().mockImplementationOnce(() => failure === 'throw' ? Promise.reject(new Error('private config details')) : Promise.resolve({ success: false })).mockResolvedValue({ success: true });
    vi.stubGlobal('$fetch', fetch);
    const wrapper = mount(ContactForm);
    await fill(wrapper); await wrapper.get('form').trigger('submit'); await flushPromises();
    expect((wrapper.get('[name="fullName"]').element as HTMLInputElement).value).toBe('Jane Doe');
    expect(wrapper.get('[role="alert"]').text()).toContain('could not be sent');
    expect(wrapper.text()).not.toContain('private config');
    expect(wrapper.emitted('success')).toBeUndefined();
    await wrapper.get('form').trigger('submit'); await flushPromises();
    expect(wrapper.emitted('success')).toHaveLength(1);
    wrapper.unmount();
  });
  it('does not let the category satisfy minimum message length or exceed the server maximum', async () => {
    const fetch = vi.fn(); vi.stubGlobal('$fetch', fetch);
    const wrapper = mount(ContactForm, { props: { categories: ['General Inquiry'] } });
    await fill(wrapper);
    await wrapper.get('[name="message"]').setValue('short');
    await wrapper.get('form').trigger('submit');
    await wrapper.get('[name="message"]').setValue('a'.repeat(500));
    await wrapper.get('form').trigger('submit');
    expect(fetch).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('at most 500');
    wrapper.unmount();
  });
});
