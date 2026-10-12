import { mount } from '@vue/test-utils';
import { beforeEach, expect, it, vi } from 'vitest';
import AboutHeroMember from '../../../apps/web/components/about/AboutHeroMember.vue';
const state = vi.hoisted(() => ({ motion: 'no-preference', plugin: { play: vi.fn(), stop: vi.fn() } }));
vi.mock('embla-carousel-autoplay', () => ({ default: () => state.plugin }));
vi.mock('@vueuse/core', async importOriginal => ({ ...await importOriginal<typeof import('@vueuse/core')>(), usePreferredReducedMotion: () => ({ value: state.motion }) }));
const stubs = { Carousel: { name: 'CarouselMock', template: '<div><slot /></div>' }, CarouselContent: { template: '<div><slot /></div>' }, CarouselItem: { template: '<div><slot /></div>' }, CarouselNext: true, CarouselPrevious: true, NuxtImg: true };
function createApi() {
  const handlers = new Set<() => void>();
  return { on: vi.fn((_name: string, callback: () => void) => { handlers.add(callback); }), off: vi.fn((_name: string, callback: () => void) => { handlers.delete(callback); }), plugins: () => ({ autoplay: state.plugin }), reInit: () => { state.plugin.stop(); handlers.forEach(fn => fn()); } };
}
beforeEach(() => { state.motion = 'no-preference'; state.plugin.play.mockClear(); state.plugin.stop.mockClear(); });
it('resumes on reInit and detaches once on API replacement and unmount', async () => {
  const wrapper = mount(AboutHeroMember, { props: { members: [{ name: 'One' }, { name: 'Two' }] }, global: { stubs } });
  const old = createApi(), next = createApi();
  const carousel = wrapper.findComponent({ name: 'CarouselMock' });
  carousel.vm.$emit('init-api', old); await wrapper.vm.$nextTick();
  state.plugin.play.mockClear(); old.reInit(); expect(state.plugin.play).toHaveBeenCalledOnce();
  carousel.vm.$emit('init-api', next); carousel.vm.$emit('init-api', next);
  expect(old.off).toHaveBeenCalledOnce(); expect(next.on).toHaveBeenCalledOnce();
  state.plugin.play.mockClear(); old.reInit(); expect(state.plugin.play).not.toHaveBeenCalled();
  wrapper.unmount(); expect(next.off).toHaveBeenCalledOnce(); expect(state.plugin.stop).toHaveBeenCalled();
});
it.each(['user', 'paused', 'off', 'reduced', 'single'])('keeps rotation stopped after reInit: %s', async reason => {
  state.motion = reason === 'reduced' ? 'reduce' : 'no-preference';
  const wrapper = mount(AboutHeroMember, { props: { members: reason === 'single' ? [{ name: 'One' }] : [{ name: 'One' }, { name: 'Two' }], autoplay: reason !== 'off', paused: reason === 'paused' }, global: { stubs } });
  const api = createApi(); wrapper.findComponent({ name: 'CarouselMock' }).vm.$emit('init-api', api); await wrapper.vm.$nextTick();
  if (reason === 'user') await wrapper.get('[data-rotation-toggle]').trigger('click');
  state.plugin.play.mockClear(); api.reInit(); expect(state.plugin.play).not.toHaveBeenCalled();
  wrapper.unmount();
});
