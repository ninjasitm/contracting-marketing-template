import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ServicePackages from '@/components/services/ServicePackages.vue';

describe('ServicePackages', () => {
  it('renders configurable static packages without implicit recommendations or unsafe actions', () => {
    const wrapper = mount(ServicePackages, { props: {
      title: 'Plans', href: '/enquire', cta: 'Choose', recommendedLabel: 'Our pick',
      packages: [
        { name: 'Starter', hours: '10 hours', price: '$100', features: ['Support'], bestFor: 'Teams', recommended: true },
        { name: 'Custom', href: 'javascript:alert(1)' },
      ],
    } });
    expect(wrapper.text()).toContain('Our pick');
    expect(wrapper.text()).toContain('Best for: Teams');
    expect(wrapper.findAll('a')).toHaveLength(1);
    expect(wrapper.get('a').attributes('href')).toBe('/enquire');
    expect(wrapper.get('a').text()).toBe('Choose');
    wrapper.unmount();
  });
});
