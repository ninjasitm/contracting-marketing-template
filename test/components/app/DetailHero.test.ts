import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import DetailHero from '../../../apps/web/components/app/DetailHero.vue';
describe('DetailHero', () => {
  it('renders safe backlink and inline image, resets failure on source change', async () => {
    const wrapper = mount(DetailHero, { props: { title: 'Project', heroMode: 'image', image: '/one.png', backLinkTo: '/work', backLinkText: 'Work' }, global: { stubs: { NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' }, NuxtImg: { template: '<img />' } } } });
    expect(wrapper.get('a').attributes('href')).toBe('/work');
    await wrapper.get('img').trigger('error');
    expect(wrapper.find('img').exists()).toBe(false);
    await wrapper.setProps({ image: '/two.png', backLinkTo: 'javascript:alert(1)' });
    expect(wrapper.find('img').exists()).toBe(true);
    expect(wrapper.find('a').exists()).toBe(false);
    expect(wrapper.find('header').exists()).toBe(false);
  });
});
