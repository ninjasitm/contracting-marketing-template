import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BackgroundEffect from '../../../apps/web/components/app/BackgroundEffect.vue';
const mocks = vi.hoisted(() => ({ create: vi.fn(), destroy: vi.fn(), p5: vi.fn() }));
vi.mock('p5', () => ({ default: mocks.p5 }));
vi.mock('vanta/dist/vanta.topology.min', () => ({ default: mocks.create }));
vi.mock('vanta/dist/vanta.dots.min', () => {
  // Match DOTS's real module-local binding, which ignores constructor overrides.
  const capturedThree = Reflect.get(window, 'THREE');
  return { default: (options: Record<string, unknown>) => {
    if (!capturedThree || capturedThree !== options.THREE) throw new Error('DOTS captured the wrong THREE');
    const canvas = document.createElement('canvas');
    (options.el as HTMLElement).appendChild(canvas);
    return { renderer: { domElement: canvas }, camera: {}, destroy: mocks.destroy };
  } };
});
describe('BackgroundEffect', () => {
  beforeEach(() => {
    mocks.create.mockReset(); mocks.destroy.mockReset();
    mocks.create.mockImplementation(({ el }: { el: HTMLElement }) => {
      const canvas = document.createElement('canvas'); el.appendChild(canvas);
      return { destroy: mocks.destroy, p5renderer: { canvas }, p5: {} };
    });
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  });
  it('passes p5 for topology without WebGL and destroys on disable', async () => {
    const wrapper = mount(BackgroundEffect, { props: { effect: 'topology' } });
    await flushPromises();
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ p5: mocks.p5 }));
    await wrapper.setProps({ disabled: true });
    expect(mocks.destroy).toHaveBeenCalled();
    expect(wrapper.emitted('active-change')?.at(-1)).toEqual([false]);
    wrapper.unmount();
  });
  it('honors reduced motion and catches runtime failures with a static fallback', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    const reduced = mount(BackgroundEffect, { props: { effect: 'topology' } });
    await flushPromises(); expect(mocks.create).not.toHaveBeenCalled(); reduced.unmount();
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    mocks.create.mockImplementation(() => { throw new Error('runtime failed'); });
    const failed = mount(BackgroundEffect, { props: { effect: 'topology' } });
    await flushPromises(); expect(failed.classes()).toContain('bg-gradient-to-b');
    expect(failed.emitted('active-change')?.at(-1)).toEqual([false]); failed.unmount();
  });
  it('does not create stale effects after immediate unmount', async () => {
    const wrapper = mount(BackgroundEffect, { props: { effect: 'topology' } });
    wrapper.unmount(); await flushPromises(); expect(mocks.create).not.toHaveBeenCalled();
  });
  it('rejects Vanta swallowed initialization failures and safely destroys detached renderers', async () => {
    const canvas = document.createElement('canvas');
    const dispose = vi.fn();
    mocks.create.mockImplementation(({ el }: { el: HTMLElement }) => ({ renderer: { domElement: canvas, dispose }, destroy: () => { el.removeChild(canvas); mocks.destroy(); } }));
    const wrapper = mount(BackgroundEffect, { props: { effect: 'topology' } });
    await flushPromises();
    expect(wrapper.emitted('active-change')).not.toContainEqual([true]);
    expect(mocks.destroy).toHaveBeenCalledOnce();
    expect(dispose).toHaveBeenCalledOnce();
    expect(wrapper.find('canvas').exists()).toBe(false);
    wrapper.unmount();
  });
  it('binds DOTS at import time without retaining or replacing the host THREE global', async () => {
    const previous = { host: true };
    vi.stubGlobal('THREE', previous);
    vi.stubGlobal('WebGLRenderingContext', vi.fn());
    const context = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as CanvasRenderingContext2D);
    const wrapper = mount(BackgroundEffect, { props: { effect: 'dots' } });
    await vi.waitFor(() => expect(wrapper.emitted('active-change')?.at(-1)).toEqual([true]));
    expect(Reflect.get(window, 'THREE')).toBe(previous);
    expect(wrapper.findAll('canvas')).toHaveLength(1);
    wrapper.unmount(); context.mockRestore(); vi.unstubAllGlobals();
  });
  it('guards generations and tears down offscreen observers', async () => {
    let intersect: (entries: unknown[]) => void = () => {};
    const disconnect = vi.fn();
    vi.stubGlobal('IntersectionObserver', class { constructor(callback: typeof intersect) { intersect = callback; } observe() {} disconnect = disconnect; });
    const wrapper = mount(BackgroundEffect, { props: { effect: 'topology' } });
    await flushPromises(); expect(mocks.create).not.toHaveBeenCalled();
    intersect([{ isIntersecting: true }]);
    await wrapper.setProps({ disabled: true });
    await flushPromises(); expect(mocks.create).not.toHaveBeenCalled();
    await wrapper.setProps({ disabled: false }); await flushPromises(); expect(mocks.create).toHaveBeenCalledTimes(1);
    intersect([{ isIntersecting: false }]); await flushPromises(); expect(mocks.destroy).toHaveBeenCalledTimes(1);
    wrapper.unmount(); expect(disconnect).toHaveBeenCalled(); vi.unstubAllGlobals();
  });
});
