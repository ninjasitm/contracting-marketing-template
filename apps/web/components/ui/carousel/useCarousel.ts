// Adapted from ninjasitm/nitm-marketing @ da649f7. Copyright (c) 2025 Ninjas In The Machine. MIT: docs/reference/NITM_MARKETING_LICENSE.md.
import type { UnwrapRefCarouselApi as CarouselApi, CarouselEmits, CarouselProps } from './interface';
import { createInjectionState } from '@vueuse/core';
import emblaCarouselVue from 'embla-carousel-vue';
import { computed, onUnmounted, ref, unref, watch } from 'vue';

const [useProvideCarousel, useInjectCarousel] = createInjectionState(
  (props: CarouselProps, emits: CarouselEmits) => {
    const orientation = computed(() => props.orientation ?? 'horizontal');
    const [emblaNode, emblaApi] = emblaCarouselVue(computed(() => ({
      ...unref(props.opts),
      axis: orientation.value === 'horizontal' ? 'x' : 'y',
    })), computed(() => unref(props.plugins) ?? []));

    function scrollPrev() {
      emblaApi.value?.scrollPrev();
    }
    function scrollNext() {
      emblaApi.value?.scrollNext();
    }

    const canScrollNext = ref(false);
    const canScrollPrev = ref(false);

    function onSelect(api: CarouselApi) {
      canScrollNext.value = api?.canScrollNext() || false;
      canScrollPrev.value = api?.canScrollPrev() || false;
    }

    function detach(api: CarouselApi) {
      api?.off('reInit', onSelect);
      api?.off('select', onSelect);
    }
    watch(emblaApi, (api, previous) => {
      detach(previous);
      if (!api) return;
      onSelect(api);
      api.on('reInit', onSelect);
      api.on('select', onSelect);
      emits('init-api', api);
    }, { immediate: true });
    onUnmounted(() => detach(emblaApi.value));

    return { carouselRef: emblaNode, carouselApi: emblaApi, canScrollPrev, canScrollNext, scrollPrev, scrollNext, orientation };
  },
);

function useCarousel() {
  const carouselState = useInjectCarousel();

  if (!carouselState)
    throw new Error('useCarousel must be used within a <Carousel />');

  return carouselState;
}

export { useCarousel, useProvideCarousel };
