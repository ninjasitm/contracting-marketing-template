import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import FeaturedWorkSection from '../../../apps/web/components/services/FeaturedWorkSection.vue';

describe('FeaturedWorkSection', () => {
  it('groups legacy service projects without nested links', () => {
    const wrapper = mount(FeaturedWorkSection, {
      props: { clickable: true, projects: [{ title: 'Example', category: 'Design', description: 'Summary', image: '/image.png', url: '/work/example' }] },
      global: { stubs: { NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' }, NuxtImg: { template: '<img />' } } },
    });
    expect(wrapper.get('h2').text()).toBe('Featured Work');
    expect(wrapper.findAll('a')).toHaveLength(1);
    expect(wrapper.get('a').attributes('href')).toBe('/work/example');
    expect(wrapper.text()).toContain('Design');
  });
  it('hides empty sections', () => {
    expect(mount(FeaturedWorkSection).find('section').exists()).toBe(false);
  });
});
