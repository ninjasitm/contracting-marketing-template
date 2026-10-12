import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, ref, Suspense } from 'vue';
import { it, expect, vi } from 'vitest';
import Slideshow from '../../../apps/web/components/app/Slideshow.vue';
const state = vi.hoisted(() => ({ realPlugin: false, running: (): boolean => false, index: 0, playing: false, handlers: new Map<string, Set<(...args: unknown[]) => void>>() }));
vi.mock('../../../apps/web/components/ui/carousel', async () => {
  const { defineComponent, h, onMounted, onUnmounted, ref } = await import('vue');
  const fire = (name: string) => state.handlers.get(name)?.forEach(fn => fn(api));
  let autoplay = { play: () => { state.playing = true; fire('autoplay:play'); }, stop: () => { state.playing = false; fire('autoplay:stop'); }, isPlaying: () => state.playing, reset: () => {}, timeUntilNext: () => 1000 };
  const fakeAutoplay = autoplay;
  let root: HTMLElement;
  const cleanups: (() => void)[] = [];
  const api = { selectedScrollSnap: () => state.index, scrollSnapList: () => [0, 1], rootNode: () => root, containerNode: () => root.querySelector('[data-embla-track]'), internalEngine: () => ({ options: { watchDrag: true }, ownerWindow: window, ownerDocument: document, eventStore: { add: (target: EventTarget, name: string, fn: EventListener) => { target.addEventListener(name, fn); cleanups.push(() => target.removeEventListener(name, fn)); } } }), emit: (name: string) => { fire(name); return api; }, scrollNext: () => { state.index++; fire('select'); }, scrollPrev: () => { state.index--; fire('select'); }, scrollTo: (n: number) => { state.index = n; fire('select'); }, on: (name: string, fn: () => void) => { const handlers = state.handlers.get(name) ?? new Set(); handlers.add(fn); state.handlers.set(name, handlers); return api; }, off: (name: string, fn: () => void) => { state.handlers.get(name)?.delete(fn); if (!state.handlers.get(name)?.size) state.handlers.delete(name); return api; }, plugins: () => ({ autoplay }), reInit: () => {} };
  const content = defineComponent({ setup(_, { slots }) { return () => h('div', slots.default?.()); } });
  return { Carousel: defineComponent({ props: ['plugins'], emits: ['init-api'], setup(props, { slots, emit }) {
    const el = ref<HTMLElement>();
    onMounted(() => {
      if (state.realPlugin) {
        root = el.value!;
        autoplay = props.plugins[0];
        state.running = autoplay.isPlaying;
        props.plugins[0].init(api, { mergeOptions: (...values: unknown[]) => Object.assign({}, ...values), optionsAtMedia: (options: unknown) => options });
      } else autoplay = fakeAutoplay;
      emit('init-api', api);
    });
    onUnmounted(() => { if (state.realPlugin) props.plugins[0].destroy(); cleanups.splice(0).forEach(fn => fn()); });
    return () => h('div', { ref: el }, slots.default?.());
  } }), CarouselContent: content, CarouselItem: content };
});
it.each([{ enabled: false, reduced: false }, { enabled: true, reduced: true }, { enabled: true, reduced: false }])('controls real Embla pointer/focus restarts: %o', async ({ enabled, reduced }) => {
  state.realPlugin = true; state.index = 0; state.handlers.clear();
  vi.stubGlobal('matchMedia', () => ({ matches: reduced, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal('queryContent', () => ({ find: () => Promise.resolve([]) }));
  vi.stubGlobal('useAsyncData', async (_key: unknown, resolve: () => Promise<unknown>) => ({ data: ref(await resolve()), pending: ref(false), error: ref(null) }));
  vi.stubGlobal('requestAnimationFrame', () => 1); vi.stubGlobal('cancelAnimationFrame', () => {});
  const wrapper = mount(defineComponent({ setup() { return () => h(Suspense, null, { default: () => h(Slideshow, { layout: 'hero', autoplay: enabled, slides: [{ type: 'generic', title: 'One' }, { type: 'generic', title: 'Two' }] }) }); } }), { global: { stubs: { NuxtLink: true, NuxtImg: true, Icon: true } } });
  await flushPromises();
  const track = wrapper.get('[data-embla-track]');
  const playing = () => wrapper.find('[aria-label="Pause autoplay"]').exists();
  const pointer = (name: string) => state.handlers.get(name)?.forEach(fn => fn());
  if (enabled && !reduced) {
    expect(playing()).toBe(true);
    pointer('pointerDown'); pointer('pointerUp'); await flushPromises(); expect(playing()).toBe(true);
    await track.trigger('focusin'); await track.trigger('focusout'); expect(playing()).toBe(true);
    await wrapper.get('[aria-label="Pause autoplay"]').trigger('click');
  }
  pointer('pointerDown'); pointer('pointerUp');
  await track.trigger('focusin'); await track.trigger('focusout');
  await flushPromises();
  expect(playing()).toBe(false);
  // The actual plugin, not just the component label, must remain stopped.
  expect(state.running()).toBe(false);
  wrapper.unmount(); state.realPlugin = false; vi.unstubAllGlobals();
});
it('navigates multiple slides, keeps user pause and rejects rendered unsafe CTAs', async () => {
  state.handlers.clear(); state.index = 0; state.playing = false;
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal('queryContent', () => ({ find: () => Promise.resolve([]) }));
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  const cancel = vi.fn(); vi.stubGlobal('cancelAnimationFrame', cancel);
  vi.stubGlobal('useAsyncData', async (_key: unknown, resolve: () => Promise<unknown>) => ({ data: ref(await resolve()), pending: ref(false), error: ref(null) }));
  const wrapper = mount(defineComponent({ setup() { return () => h(Suspense, null, { default: () => h(Slideshow, { layout: 'hero', autoplay: true, navigationStyle: 'dots', slides: [{ type: 'generic', title: 'First', cta: { text: 'Unsafe', url: 'javascript:bad' } }, { type: 'generic', title: 'Second' }] }) }); } }), { global: { stubs: { NuxtLink: true, NuxtImg: true, Icon: true } } });
  await flushPromises();
  expect(wrapper.find('a[href^="javascript"]').exists()).toBe(false);
  expect(state.playing).toBe(true);
  state.handlers.get('autoplay:timerset')?.forEach(fn => fn());
  await flushPromises();
  expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('80');
  await wrapper.get('[aria-label="Pause autoplay"]').trigger('click'); expect(state.playing).toBe(false);
  await wrapper.get('[aria-label="Next slide"]').trigger('click'); expect(state.index).toBe(1);
  await wrapper.get('[data-embla-track]').trigger('mouseenter'); await wrapper.get('[data-embla-track]').trigger('mouseleave'); expect(state.playing).toBe(false);
  expect(wrapper.get('[aria-label="Go to slide 2"]').attributes('aria-current')).toBe('true');
  wrapper.unmount(); expect(state.handlers.size).toBe(0); expect(cancel).toHaveBeenCalled(); vi.unstubAllGlobals();
});
it('disables autoplay under reduced motion while retaining manual vertical controls', async () => {
  state.handlers.clear(); state.index = 0; state.playing = false;
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal('queryContent', () => ({ find: () => Promise.resolve([]) }));
  vi.stubGlobal('useAsyncData', async (_key: unknown, resolve: () => Promise<unknown>) => ({ data: ref(await resolve()), pending: ref(false), error: ref(null) }));
  const wrapper = mount(defineComponent({ setup() { return () => h(Suspense, null, { default: () => h(Slideshow, { layout: 'scroll-slide', autoplay: true, slides: [{ type: 'generic', title: 'First' }, { type: 'generic', title: 'Second' }] }) }); } }), { global: { stubs: { NuxtLink: true, NuxtImg: true, Icon: true } } });
  await flushPromises();
  expect(state.playing).toBe(false);
  expect(wrapper.get('[aria-label="Play autoplay"]').attributes('disabled')).toBeDefined();
  await wrapper.get('[aria-label="Next slide"]').trigger('click'); expect(state.index).toBe(1);
  wrapper.unmount(); vi.unstubAllGlobals();
});
