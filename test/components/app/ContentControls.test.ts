import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { describe, it, expect } from 'vitest';
import ContentTabs from '../../../apps/web/components/app/ContentTabs.vue';
import ContentTabDetail from '../../../apps/web/components/app/ContentTabDetail.vue';
import FilterBar from '../../../apps/web/components/app/FilterBar.vue';
const items = [{ id: 'one', title: 'First', summary: 'First summary' }, { id: 'two', title: 'Second', topics: ['Second topic'] }];
describe('content controls', () => {
  it('selects panels and emits controlled values with separate instance IDs', async () => {
    const wrapper = mount(ContentTabs, { props: { items }, global: { stubs: { NuxtImg: true } } });
    const triggers = wrapper.findAll('[role=tab]');
    expect(triggers[0]!.attributes('aria-selected')).toBe('true');
    await triggers[1]!.trigger('mousedown', { button: 0, ctrlKey: false });
    expect(wrapper.emitted('update:modelValue')).toEqual([['two']]);
    expect(wrapper.text()).toContain('Second topic');
    const second = mount(defineComponent({ components: { ContentTabs }, setup: () => ({ items }), template: '<ContentTabs :items="items" /><ContentTabs :items="items" />' }), { global: { stubs: { NuxtImg: true } } });
    const lists = second.findAll('[role=tablist]');
    expect(lists[0]!.get('[role=tab]').attributes('id')).not.toBe(lists[1]!.get('[role=tab]').attributes('id'));
  });
  it('does not duplicate summary and description or render unsafe images', () => {
    const wrapper = mount(ContentTabDetail, { props: { item: { id: 'one', title: 'Title', summary: 'Same', description: 'Same', image: 'javascript:alert(1)' } }, global: { stubs: { NuxtImg: true } } });
    expect(wrapper.findAll('p')).toHaveLength(1);
    expect(wrapper.find('nuxt-img-stub').exists()).toBe(false);
  });
  it('reports search and reset without mutating controlled inputs', async () => {
    const modelValue = { category: 'design' };
    const wrapper = mount(FilterBar, { props: { facets: [{ key: 'category', label: 'Category', options: [{ label: 'Design', value: 'design' }] }], modelValue, searchQuery: 'old' } });
    wrapper.findComponent({ name: 'Select' }).vm.$emit('update:modelValue', 'design');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([{ category: 'design' }]);
    wrapper.findComponent({ name: 'Select' }).vm.$emit('update:modelValue', 'not-an-option');
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
    await wrapper.get('input').setValue('<script>text</script>');
    expect(wrapper.emitted('update:searchQuery')?.[0]).toEqual(['<script>text</script>']);
    await wrapper.findAll('button').at(-1)!.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([{}]);
    expect(wrapper.emitted('update:searchQuery')?.at(-1)).toEqual(['']);
    expect(modelValue.category).toBe('design');
    await wrapper.setProps({ modelValue: {}, searchQuery: '' });
    expect(wrapper.findComponent({ name: 'Select' }).props('modelValue')).toBe('');
  });
});
