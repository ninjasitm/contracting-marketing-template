import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, nextTick, shallowRef } from 'vue';
import ConversationalForm from '~/components/app/ConversationalForm.vue';
import { useLeadForm, type LeadFormState } from '~/composables/useLeadForm';
import { describe, expect, it, vi } from 'vitest';
import LeadForm from '~/components/app/LeadForm.vue';
import type { LeadField, LeadSubmit } from '~/types/lead-form';

const fields: LeadField[] = [
  { name: 'name', type: 'text', label: 'Name', required: true, description: 'Your name' },
  { name: 'email', type: 'email', label: 'Email', required: true },
  { name: 'phone', type: 'phone', label: 'Phone' },
  { name: 'quantity', type: 'number', label: 'Quantity', defaultValue: 0 },
  { name: 'notes', type: 'textarea', label: 'Notes', validation: { maxLength: 2 } },
  { name: 'topic', type: 'dropdown', label: 'Topic', options: [{ label: 'Repair', value: 'repair' }] },
  { name: 'timing', type: 'radio', label: 'Timing', options: [{ label: 'Later', value: 'later' }] },
  { name: 'services', type: 'checkbox-group', label: 'Services', options: [{ label: 'Install', value: 'install' }] },
  { name: 'confirm', type: 'checkbox', label: 'Confirm', required: true },
];

describe('LeadForm', () => {
  it.each([LeadForm, ConversationalForm])('enforces stable state binding and focuses reset', async (component) => {
    const callback = vi.fn<LeadSubmit>().mockResolvedValue({ success: true });
    const schema = [fields[0]!];
    let first!: LeadFormState;
    let second!: LeadFormState;
    const owner = mount(defineComponent({ setup() {
      first = useLeadForm({ fields: () => schema, submit: () => callback });
      second = useLeadForm({ fields: () => schema, submit: () => callback });
      return () => h('div');
    } }));
    const binding = shallowRef(first);
    const key = shallowRef(0);
    const host = mount(defineComponent({ render: () => h(component, { key: key.value, fields: schema, submit: callback, state: binding.value }) }), { attachTo: document.body });
    const wrapper = host.getComponent(component);
    await wrapper.get('input').setValue('Example');
    await wrapper.get('form').trigger('submit'); await flushPromises();
    await wrapper.get('button').trigger('click');
    expect(document.activeElement).toBe(wrapper.get('input').element);
    binding.value = second;
    await nextTick();
    expect(wrapper.find('form').exists()).toBe(false);
    expect(wrapper.get('[role=alert]').text()).toContain('configuration');
    first.setAnswer('name', 'Old'); await first.submitForm(); await flushPromises();
    expect(wrapper.emitted('success')).toHaveLength(1);
    wrapper.vm.replaceFieldsPreservingCompatibleAnswers([{ name: 'other', type: 'text', label: 'Other' }]);
    expect(first.fields.value[0]?.name).toBe('name');
    key.value += 1;
    await nextTick();
    const remounted = host.getComponent(component);
    expect(remounted.find('form').exists()).toBe(true);
    host.unmount(); owner.unmount();
  });

  it.each([LeadForm, ConversationalForm])('migrates mounted schemas and ignores stale completion', async (component) => {
    let resolve!: (value: { success: true }) => void;
    const callback: LeadSubmit = () => new Promise((done) => { resolve = done; });
    const original: LeadField[] = [{ name: 'name', type: 'text', label: 'Name' }, { name: 'choice', type: 'dropdown', label: 'Choice', defaultValue: 'a', options: [{ label: 'A', value: 'a' }] }];
    const next: LeadField[] = [{ ...original[0]!, label: 'New name' }, { name: 'choice', type: 'dropdown', label: 'New choice', options: [{ label: 'B', value: 'b' }] }];
    const wrapper = mount(component, { props: { fields: original, submit: callback } });
    await wrapper.get('input').setValue('Keep');
    if (component === ConversationalForm) await wrapper.get('form').trigger('submit');
    await wrapper.get('form').trigger('submit');
    wrapper.vm.replaceFieldsPreservingCompatibleAnswers(next);
    await wrapper.setProps({ fields: next });
    expect(wrapper.get('input').element.value).toBe('Keep');
    expect(wrapper.text()).toContain('New name');
    resolve({ success: true }); await flushPromises();
    expect(wrapper.emitted('success')).toBeUndefined();
    expect(wrapper.vm.state.answers.choice).toBeUndefined();
    const changed: LeadSubmit = () => Promise.resolve({ success: true });
    await wrapper.setProps({ submit: changed });
    expect(wrapper.get('input').element.value).toBe('');
    wrapper.unmount();
  });
  it.each([LeadForm, ConversationalForm])('uses external getters rather than unrelated view props and focuses slot resets', async (component) => {
    let state!: LeadFormState;
    const schema = shallowRef<readonly LeadField[]>([fields[0]!]);
    const callback = vi.fn<LeadSubmit>().mockResolvedValue({ success: true });
    const owner = mount(defineComponent({ setup() {
      state = useLeadForm({ fields: () => schema.value, submit: () => callback });
      return () => h('div');
    } }));
    let reset!: () => Promise<void>;
    const wrapper = mount(component, { props: { fields: schema.value, submit: callback, state }, attachTo: document.body,
      slots: { success: (slot: { reset: () => Promise<void> }) => { reset = slot.reset; return h('button', { onClick: reset }, 'Reset'); } },
    });
    await wrapper.get('input').setValue('Keep');
    await wrapper.setProps({ fields: [{ name: 'other', type: 'email', label: 'Other' }], submit: () => Promise.resolve({ success: true }) });
    expect(wrapper.get<HTMLInputElement>('input').element.value).toBe('Keep');
    await wrapper.get('form').trigger('submit'); await flushPromises();
    await reset();
    expect(document.activeElement).toBe(wrapper.get('input').element);
    schema.value = [{ name: 'new', type: 'text', label: 'New field' }];
    await nextTick();
    expect(wrapper.text()).toContain('New field');
    wrapper.unmount();
    state.setAnswer('new', 'Retain');
    await reset();
    expect(state.answers.new).toBe('Retain');
    owner.unmount();
  });
  it('keeps blank numbers empty and applies group selection bounds without mutating arrays', async () => {
    const submit = vi.fn<LeadSubmit>().mockRejectedValue(new Error('private failure'));
    const wrapper = mount(LeadForm, { props: { submit, fields: [
      { name: 'quantity', type: 'number', label: 'Quantity' },
      { name: 'choices', type: 'checkbox-group', label: 'Choices', required: true, validation: { minLength: 2 }, options: [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }] },
    ] }, slots: { 'before-submit': '<p>Additional step</p>' } });
    await wrapper.get('input[type=number]').setValue('');
    await wrapper.get('form').trigger('submit');
    expect(wrapper.get('fieldset').attributes('aria-invalid')).toBe('true');
    const controls = wrapper.findAll<HTMLInputElement>('input[type=checkbox]');
    await controls[0]!.setValue(true);
    await wrapper.get('form').trigger('submit');
    expect(submit).not.toHaveBeenCalled();
    await controls[1]!.setValue(true);
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(submit).toHaveBeenCalledWith({ quantity: '', choices: ['a', 'b'] });
    expect(wrapper.text()).not.toContain('private failure');
    await controls[0]!.setValue(false);
    expect(controls[1]!.element.checked).toBe(true);
    wrapper.unmount();
  });
  it('renders all nine accessible controls and validates then submits detached values', async () => {
    const submit = vi.fn<LeadSubmit>().mockResolvedValue({ success: true });
    const wrapper = mount(LeadForm, { props: { fields, submit }, attachTo: document.body });
    expect(wrapper.findAll('input, textarea, select')).toHaveLength(9);
    await wrapper.get('form').trigger('submit');
    expect(wrapper.get('input[type=text]').attributes('aria-invalid')).toBe('true');
    expect(document.activeElement).toBe(wrapper.get('input[type=text]').element);
    await wrapper.get('input[type=text]').setValue('Example');
    await wrapper.get('input[type=email]').setValue('bad');
    await wrapper.get('form').trigger('submit');
    expect(wrapper.get('input[type=email]').attributes('aria-invalid')).toBe('true');
    await wrapper.get('input[type=email]').setValue('example@example.com');
    await wrapper.get('textarea').setValue('😀😀');
    expect(wrapper.get('textarea').attributes('maxlength')).toBeUndefined();
    await wrapper.get('select').setValue('repair');
    await wrapper.get('input[type=radio]').setValue(true);
    for (const input of wrapper.findAll('input[type=checkbox]')) await input.setValue(true);
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(submit).toHaveBeenCalledWith(expect.objectContaining({ quantity: 0, services: ['install'], confirm: true }));
    expect(wrapper.emitted('success')).toHaveLength(1);
    expect(wrapper.find('form').exists()).toBe(false);
    await wrapper.get('button').trigger('click');
    expect(wrapper.get<HTMLInputElement>('input[type=text]').element.value).toBe('');
    wrapper.unmount();
  });

  it('retains failed drafts, locks duplicates, and isolates IDs and state', async () => {
    let finish!: (value: never) => void;
    const submit = vi.fn<LeadSubmit>(() => new Promise((resolve) => { finish = resolve; }));
    const props = { fields: [fields[0]!], submit };
    const host = mount(defineComponent({ render: () => h('div', [h(LeadForm, props), h(LeadForm, props)]) }), { attachTo: document.body });
    const instances = host.findAllComponents(LeadForm);
    const first = instances[0]!;
    const second = instances[1]!;
    expect(first.get('input').attributes('id')).not.toBe(second.get('input').attributes('id'));
    await first.get('input').setValue('Saved');
    await first.get('form').trigger('submit');
    await first.get('form').trigger('submit');
    expect(submit).toHaveBeenCalledTimes(1);
    expect(first.get('input').attributes('disabled')).toBeDefined();
    finish(false as never);
    await flushPromises();
    expect(first.get('input').element.value).toBe('Saved');
    expect(second.get('input').element.value).toBe('');
    expect(first.emitted('success')).toBeUndefined();
    expect(document.activeElement).toBe(first.get('[role=alert]').element);
    host.unmount();
  });
});
