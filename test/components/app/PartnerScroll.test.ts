import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import PartnerScroll from '@/components/app/PartnerScroll.vue';
const motion = vi.hoisted(() => ({ value: 'no-preference' }));
vi.mock('@vueuse/core', () => ({ usePreferredReducedMotion: () => ref(motion.value) }));
const partners = [
  { name: 'Alpha', heroImage: '/hero.png', logo: '/logo.svg', description: 'Partner detail', services: ['web-design'], url: 'https://example.com' },
  { name: 'Beta', url: 'javascript:alert(1)' },
];
describe('PartnerScroll', () => {
  it('scopes inert duplicates, safe links, pause controls and reactive image fallbacks', async () => {
    const wrapper = mount(PartnerScroll, { props: { partners } });
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.partner-group')).toHaveLength(2);
    expect(wrapper.get('.duplicate').attributes('aria-hidden')).toBe('true');
    expect(wrapper.get('.duplicate').attributes('inert')).toBeDefined();
    expect(wrapper.get('.duplicate').findAll('a')).toHaveLength(0);
    expect(wrapper.findAll('a')).toHaveLength(1);
    expect(wrapper.get('a').attributes('rel')).toBe('noopener noreferrer');
    await wrapper.get('button').trigger('click');
    expect(wrapper.get('.partner-scroll').classes()).toContain('paused');
    await wrapper.get('img').trigger('error');
    expect(wrapper.get('img').attributes('src')).toBe('/logo.svg');
    await wrapper.get('img').trigger('error');
    expect(wrapper.findAll('img')).toHaveLength(0);
    wrapper.unmount();
  });
  it('keeps a single complete static list for reduced motion', async () => {
    motion.value = 'reduce';
    const wrapper = mount(PartnerScroll, { props: { partners } });
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.partner-group')).toHaveLength(1);
    expect(wrapper.text()).toContain('Partner detail');
    expect(wrapper.text()).toContain('web design');
    expect(wrapper.find('button').exists()).toBe(false);
    wrapper.unmount(); motion.value = 'no-preference';
  });
});
