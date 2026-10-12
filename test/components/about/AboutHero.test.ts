import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import AboutHero from '../../../apps/web/components/about/AboutHero.vue';
import AboutHeroMember from '../../../apps/web/components/about/AboutHeroMember.vue';
const autoplay = vi.hoisted(() => ({ play: vi.fn(), stop: vi.fn() }));
vi.mock('embla-carousel-autoplay', () => ({ default: () => autoplay }));
const carouselStubs = { Carousel: { name: 'CarouselMock', template: '<div><slot /></div>' }, CarouselContent: { template: '<div><slot /></div>' }, CarouselItem: { template: '<div><slot /></div>' }, CarouselNext: true, CarouselPrevious: true };
describe('AboutHero', () => {
  it('loads only the local team collection on opt-in', async () => {
    const find = vi.fn().mockResolvedValue([{ name: 'Local member', photo: '/local.png' }]);
    const sort = vi.fn(() => ({ find }));
    const query = vi.fn(() => ({ sort })); vi.stubGlobal('queryContent', query);
    const wrapper = mount(AboutHero, { props: { loadMembers: true, autoplay: false }, global: { stubs: { ...carouselStubs, NuxtLink: true, NuxtImg: true } } });
    await flushPromises();
    expect(query).toHaveBeenCalledWith('_about/teamMembers');
    expect(sort).toHaveBeenCalledWith({ name: 1 });
    expect(wrapper.text()).toContain('Local member');
    wrapper.unmount(); vi.unstubAllGlobals();
  });
  it('honors persistent pause and resumes only on explicit request', async () => {
    autoplay.play.mockClear();
    const wrapper = mount(AboutHeroMember, { props: { members: [{ name: 'One' }, { name: 'Two' }] }, global: { stubs: { ...carouselStubs, NuxtImg: true } } });
    wrapper.findComponent({ name: 'CarouselMock' }).vm.$emit('init-api', {});
    await wrapper.vm.$nextTick();
    expect(autoplay.play).toHaveBeenCalledOnce();
    await wrapper.get('[data-rotation-toggle]').trigger('click');
    expect(wrapper.get('[data-rotation-toggle]').text()).toBe('Resume rotation');
    await wrapper.setProps({ members: [{ name: 'Changed' }, { name: 'Two' }] });
    expect(autoplay.play).toHaveBeenCalledOnce();
    await wrapper.get('[data-rotation-toggle]').trigger('click');
    expect(autoplay.play).toHaveBeenCalledTimes(2);
    wrapper.unmount();
  });
  it('uses supplied members without a company default or query', () => {
    const query = vi.fn(); vi.stubGlobal('queryContent', query);
    const wrapper = mount(AboutHero, { props: { title: 'Meet our team', members: [{ name: 'Alex', position: 'Builder' }], autoplay: false }, global: { stubs: { ...carouselStubs, NuxtLink: true, NuxtImg: true } } });
    expect(wrapper.get('h1').text()).toBe('Meet our team');
    expect(wrapper.text()).toContain('Alex');
    expect(query).not.toHaveBeenCalled();
    wrapper.unmount(); vi.unstubAllGlobals();
  });
  it('removes failed portraits and retains semantic member text', async () => {
    const wrapper = mount(AboutHeroMember, { props: { members: [{ name: 'Alex', photo: '/alex.png' }], autoplay: false }, global: { stubs: { ...carouselStubs, NuxtImg: { template: '<img />' } } } });
    await wrapper.get('img').trigger('error');
    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.get('figcaption').text()).toBe('Alex');
    wrapper.unmount();
  });
});
