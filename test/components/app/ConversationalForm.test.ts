import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import ConversationalForm from '~/components/app/ConversationalForm.vue';
import LeadForm from '~/components/app/LeadForm.vue';
import { useLeadForm, type LeadFormState } from '~/composables/useLeadForm';
import type { LeadField, LeadSubmit } from '~/types/lead-form';

const fields: LeadField[] = [
  { name: 'quantity', type: 'number', label: 'Quantity', defaultValue: 0 },
  { name: 'notes', type: 'textarea', label: 'Notes', required: true },
];
describe('ConversationalForm', () => {
  it('leaves choice Enter native and shows the composition slot only on the final question', async () => {
    const submit = vi.fn<LeadSubmit>().mockResolvedValue({ success: true });
    const wrapper = mount(ConversationalForm, { props: { submit, fields: [
      { name: 'topic', type: 'dropdown', label: 'Topic', options: [{ label: 'Example', value: 'example' }] },
      { name: 'choice', type: 'radio', label: 'Choice', options: [{ label: 'One', value: 'one' }] },
    ] }, slots: { 'before-submit': '<p>Final step only</p>' } });
    expect(wrapper.text()).not.toContain('Final step only');
    await wrapper.get('select').trigger('keydown', { key: 'Enter' });
    expect(wrapper.find('select').exists()).toBe(true);
    await wrapper.get('form').trigger('submit');
    expect(wrapper.text()).toContain('Final step only');
    await wrapper.get('input').trigger('keydown', { key: 'Enter' });
    expect(submit).not.toHaveBeenCalled();
    wrapper.unmount();
  });
  it('advances with Enter, preserves Back, ignores IME and Shift+Enter, and focuses errors', async () => {
    const submit = vi.fn<LeadSubmit>().mockResolvedValue({ success: true });
    const wrapper = mount(ConversationalForm, { props: { fields, submit }, attachTo: document.body });
    expect(wrapper.get('progress').attributes('value')).toBe('1');
    await wrapper.get('input').trigger('keydown', { key: 'Enter', isComposing: true });
    expect(wrapper.find('textarea').exists()).toBe(false);
    await wrapper.get('input').trigger('keydown', { key: 'Enter' });
    expect(document.activeElement).toBe(wrapper.get('textarea').element);
    expect(wrapper.get('progress').attributes('value')).toBe('2');
    await wrapper.get('textarea').trigger('keydown', { key: 'Enter', shiftKey: true });
    expect(submit).not.toHaveBeenCalled();
    await wrapper.get('textarea').trigger('keydown', { key: 'Enter' });
    expect(wrapper.get('textarea').attributes('aria-invalid')).toBe('true');
    await wrapper.get('textarea').setValue('Example');
    await wrapper.get('button[type=button]').trigger('click');
    expect(wrapper.get('input').element.value).toBe('0');
    await wrapper.get('form').trigger('submit');
    expect(wrapper.get('textarea').element.value).toBe('Example');
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(wrapper.emitted('success')).toHaveLength(1);
    wrapper.unmount();
  });

  it('keeps an externally owned draft across mode unmounts and migration', async () => {
    let state!: LeadFormState;
    const submit: LeadSubmit = () => Promise.resolve({ success: true });
    const owner = mount(defineComponent({ setup() {
      state = useLeadForm({ fields: () => fields, submit: () => submit });
      return () => h('div');
    } }));
    const conversation = mount(ConversationalForm, { props: { fields, submit, state } });
    await conversation.get('form').trigger('submit');
    await conversation.get('textarea').setValue('Keep');
    conversation.unmount();
    state.replaceFieldsPreservingCompatibleAnswers(fields);
    const regular = mount(LeadForm, { props: { fields, submit, state } });
    expect(regular.get('textarea').element.value).toBe('Keep');
    await regular.get('form').trigger('submit');
    await flushPromises();
    expect(regular.emitted('success')).toHaveLength(1);
    regular.unmount(); owner.unmount();
  });
});
