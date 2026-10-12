import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import FeaturedProjectCard from '../../../apps/web/components/work/FeaturedProjectCard.vue';
import RelatedProject from '../../../apps/web/components/work/RelatedProject.vue';
import FilterSection from '../../../apps/web/components/work/FilterSection.vue';

const global = { stubs: { NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' }, NuxtImg: { template: '<img />' } } };
const project = { title: 'Example', slug: 'a/b?c', client: 'acme', description: 'A useful project' };

describe('work cards and filters', () => {
  it('encodes case-study slugs and injects client metadata', () => {
    const wrapper = mount(FeaturedProjectCard, { props: { project, client: { name: 'Acme Inc.' } }, global });
    expect(wrapper.get('a').attributes('href')).toBe('/work/a%2Fb%3Fc');
    expect(wrapper.text()).toContain('Acme Inc.');
    expect(wrapper.text()).toContain('View case study');
    expect(wrapper.findAll('a')).toHaveLength(1);
  });
  it('supports noninteractive related cards and rejects arbitrary unsafe links', () => {
    expect(mount(RelatedProject, { props: { project, clickable: false }, global }).find('a').exists()).toBe(false);
    expect(mount(FeaturedProjectCard, { props: { project, href: 'javascript:alert(1)' }, global }).find('a').exists()).toBe(false);
  });
  it('emits the reference category-change API with accessible native buttons', async () => {
    const wrapper = mount(FilterSection, { props: { sectionTitle: 'Work', categories: [{ name: 'Design', filter: 'design' }], currentCategory: 'design' } });
    const buttons = wrapper.findAll('button');
    const [firstButton, secondButton] = buttons;
    if (!firstButton || !secondButton) throw new Error('Expected category filter buttons');
    expect(secondButton.attributes('type')).toBe('button');
    expect(secondButton.attributes('aria-pressed')).toBe('true');
    await firstButton.trigger('click');
    await secondButton.trigger('click');
    expect(wrapper.emitted('category-change')).toEqual([[null], ['design']]);
  });
});
