import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import StatCard from '../../../apps/web/components/about/StatCard.vue';
import ValueCard from '../../../apps/web/components/about/ValueCard.vue';
import TestimonialCard from '../../../apps/web/components/about/TestimonialCard.vue';

describe('about cards', () => {
  it('preserves formatted numbers and semantic labels', () => {
    const wrapper = mount(StatCard, { props: { number: '$2M+', label: 'Delivered' } });
    expect(wrapper.get('dd').text()).toBe('$2M+');
    expect(wrapper.get('dt').text()).toBe('Delivered');
  });
  it('renders values as plain text', () => {
    const wrapper = mount(ValueCard, { props: { title: 'Care', description: '<b>Always</b>' } });
    expect(wrapper.get('h3').text()).toBe('Care');
    expect(wrapper.find('b').exists()).toBe(false);
  });
  it('uses quote/citation and omits unsafe avatars without stray punctuation', () => {
    const wrapper = mount(TestimonialCard, { props: { quote: 'Good work', author: 'Alex', company: 'Acme', avatar: 'javascript:alert(1)' }, global: { stubs: { NuxtImg: { template: '<img />' } } } });
    expect(wrapper.get('blockquote').text()).toContain('Good work');
    expect(wrapper.get('cite').text()).toBe('Alex');
    expect(wrapper.get('figcaption p').text()).toBe('Acme');
    expect(wrapper.find('img').exists()).toBe(false);
  });
  it('removes failed avatars and retries when the source changes', async () => {
    const wrapper = mount(TestimonialCard, { props: { quote: 'Great', author: 'Alex', avatar: '/avatar.png' }, global: { stubs: { NuxtImg: { template: '<img />' } } } });
    await wrapper.get('img').trigger('error');
    expect(wrapper.find('img').exists()).toBe(false);
    await wrapper.setProps({ avatar: '/new.png' });
    expect(wrapper.find('img').exists()).toBe(true);
  });
});
