import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import FilterSection from '../../../apps/web/components/posts/FilterSection.vue';

describe('FilterSection', () => {
  it('emits selection and reflects controlled pressed state without adding options', async () => {
    const wrapper = mount(FilterSection, { props: { modelValue: '', options: [{ label: 'All', value: '' }, { label: 'Example', value: 'example' }] } });
    expect(wrapper.get('[role="group"]').attributes('aria-label')).toBe('Filter posts');
    expect(wrapper.findAll('button')).toHaveLength(2);
    expect(wrapper.findAll('button')[0]!.attributes('aria-pressed')).toBe('true');
    await wrapper.findAll('button')[1]!.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([['example']]);
    await wrapper.setProps({ modelValue: 'example' });
    expect(wrapper.findAll('button')[1]!.attributes('aria-pressed')).toBe('true');
  });
});
