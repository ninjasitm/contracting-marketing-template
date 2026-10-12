import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import WordScramble from '@/components/app/WordScramble.vue';
const motion = vi.hoisted(() => ({ value: 'no-preference' }));
vi.mock('@vueuse/core', () => ({ usePreferredReducedMotion: () => ref(motion.value) }));
afterEach(() => { vi.useRealTimers(); motion.value = 'no-preference'; });

describe('WordScramble', () => {
  it('finishes even with invalid timing/pool, restarts on changes and clears loop timers', async () => {
    vi.useFakeTimers();
    const wrapper = mount(WordScramble, { props: { text: 'Hello', speed: NaN, delay: -1, characterPool: '', loop: true } });
    expect(wrapper.get('.sr-only').text()).toBe('Hello');
    vi.advanceTimersByTime(300);
    expect(wrapper.get('[aria-hidden]').text()).toBe('Hello');
    await wrapper.setProps({ text: 'New', animationType: 'linear', speed: 16, delay: 0, loop: false });
    vi.advanceTimersByTime(100);
    expect(wrapper.get('[aria-hidden]').text()).toBe('New');
    await wrapper.setProps({ loop: true });
    vi.advanceTimersByTime(100);
    wrapper.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('supports static text without timers', () => {
    vi.useFakeTimers();
    const wrapper = mount(WordScramble, { props: { animate: false, text: 'Static', tag: 'h2' } });
    expect(wrapper.element.tagName).toBe('H2');
    expect(vi.getTimerCount()).toBe(0);
    wrapper.unmount();
  });
  it('disables animated glyphs for reduced motion', () => {
    vi.useFakeTimers(); motion.value = 'reduce';
    const wrapper = mount(WordScramble, { props: { text: 'Accessible', init: 'Scrambled' } });
    expect(wrapper.get('[aria-hidden]').text()).toBe('Accessible');
    expect(vi.getTimerCount()).toBe(0);
    wrapper.unmount();
  });
});
