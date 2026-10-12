import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import LogoZoomTransition from '@/components/layouts/LogoZoomTransition.vue';
const motion = vi.hoisted(() => ({ value: 'no-preference' }));
vi.mock('@vueuse/core', () => ({ usePreferredReducedMotion: () => ref(motion.value) }));
afterEach(() => { vi.useRealTimers(); motion.value = 'no-preference'; });
describe('LogoZoomTransition', () => {
  it('completes, restarts and clears pending work on unmount', async () => {
    vi.useFakeTimers();
    const wrapper = mount(LogoZoomTransition, { props: { show: true, logoSrc: '/brand.svg', duration: NaN } });
    vi.advanceTimersByTime(700);
    expect(wrapper.emitted('complete')).toHaveLength(1);
    expect(wrapper.find('[role="status"]').exists()).toBe(false);
    await wrapper.setProps({ show: false });
    await wrapper.setProps({ show: true });
    const complete = vi.fn();
    await wrapper.setProps({ onComplete: complete });
    wrapper.unmount();
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(1000);
    expect(complete).not.toHaveBeenCalled();
  });
  it('bypasses reduced motion immediately', () => {
    vi.useFakeTimers(); motion.value = 'reduce';
    const wrapper = mount(LogoZoomTransition, { props: { show: true } });
    expect(wrapper.emitted('loaded')).toHaveLength(1);
    expect(wrapper.find('[role="status"]').exists()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    wrapper.unmount();
  });
});
