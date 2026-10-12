// Adapted from ninjasitm/nitm-marketing @ da649f7. Copyright (c) 2025 Ninjas In The Machine. MIT: docs/reference/NITM_MARKETING_LICENSE.md.
import { computed, onMounted, onUnmounted, ref, unref, watch, type MaybeRef, type Ref } from 'vue';
import type { CarouselApi } from '../components/ui/carousel';
export interface UseScrollFreezeOptions { totalSlides: MaybeRef<number>; enabled?: MaybeRef<boolean> }
export type UseScrollFreezeOptionsInput = MaybeRef<UseScrollFreezeOptions>;
export default function useScrollFreeze(container: Ref<HTMLElement | null | undefined>, api: Ref<CarouselApi | null | undefined>, options: UseScrollFreezeOptionsInput) {
  const isActive = ref(false), currentSlide = ref(0), isTouchDevice = ref(false);
  const enabled = computed(() => unref(unref(options).enabled) !== false && unref(unref(options).totalSlides) > 1);
  let frame = 0;
  let observer: IntersectionObserver | undefined;
  let target: HTMLElement | null | undefined;
  let stop: (() => void) | undefined;
  const select = () => { currentSlide.value = api.value?.selectedScrollSnap() ?? 0; };
  function wheel(event: WheelEvent) {
    if (!enabled.value || !isActive.value || isTouchDevice.value || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || event.ctrlKey || !event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    // Native inputs and nested scrollable panels keep their own wheel behavior.
    if ((event.target as HTMLElement)?.closest('input, textarea, select, [data-scroll-freeze-ignore]')) return;
    const instance = api.value;
    const next = event.deltaY > 0;
    if (!instance || !(next ? instance.canScrollNext() : instance.canScrollPrev())) return;
    event.preventDefault(); // Must happen synchronously, not inside rAF.
    if (!frame) frame = requestAnimationFrame(() => {
      frame = 0;
      if (enabled.value && isActive.value && instance === api.value) next ? instance.scrollNext() : instance.scrollPrev();
    });
  }
  function teardown() {
    observer?.disconnect(); observer = undefined;
    target?.removeEventListener('wheel', wheel); target = null;
    if (frame) cancelAnimationFrame(frame);
    frame = 0; isActive.value = false;
  }
  onMounted(() => {
    isTouchDevice.value = navigator.maxTouchPoints > 0 || Boolean(window.matchMedia?.('(pointer: coarse)').matches);
    stop = watch([container, enabled], ([el, active]) => {
      teardown();
      if (!el || !active || isTouchDevice.value || typeof IntersectionObserver === 'undefined') return;
      target = el;
      observer = new IntersectionObserver(entries => { isActive.value = Boolean(entries[0]?.isIntersecting && entries[0].intersectionRatio >= 0.5); }, { threshold: 0.5 });
      observer.observe(el); el.addEventListener('wheel', wheel, { passive: false });
    }, { immediate: true });
  });
  watch(api, (value, previous) => { previous?.off('select', select); value?.on('select', select); select(); }, { immediate: true });
  onUnmounted(() => { stop?.(); api.value?.off('select', select); teardown(); });
  return { isActive, currentSlide, isTouchDevice };
}
