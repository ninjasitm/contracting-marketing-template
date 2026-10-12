import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import BenefitsSection from '../../../apps/web/components/app/BenefitsSection.vue';

describe('BenefitsSection', () => {
  it('supports optional plain-text nested bullets', () => {
    const wrapper = mount(BenefitsSection, { props: { title: 'Benefits', items: [{ title: 'Care', description: 'Included', items: ['<b>Support</b>', 'Updates'] }] }, global: { stubs: { Icon: true } } });
    expect(wrapper.findAll('li').map(item => item.text())).toEqual(['<b>Support</b>', 'Updates']);
    expect(wrapper.find('b').exists()).toBe(false);
  });
  it('renders supplied items safely with optional decorative icons', () => {
    const wrapper = mount(BenefitsSection, {
      props: { title: 'Example benefits', description: 'Example introduction', items: [{ title: 'First', description: '<b>Plain copy</b>', icon: 'lucide:star' }, { title: 'Second', description: 'No icon' }] },
      global: { stubs: { Icon: { template: '<span />' } } },
    });
    expect(wrapper.findAll('h3')).toHaveLength(2);
    expect(wrapper.text()).toContain('<b>Plain copy</b>');
    expect(wrapper.find('b').exists()).toBe(false);
    expect(wrapper.get('span').attributes('aria-hidden')).toBe('true');
  });
});
