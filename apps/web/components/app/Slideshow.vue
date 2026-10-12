<!-- Adapted from ninjasitm/nitm-marketing @ da649f7. Copyright (c) 2025 Ninjas In The Machine. MIT: docs/reference/NITM_MARKETING_LICENSE.md. -->
<script setup lang="ts">
import { computed, ref, watch, onUnmounted, onMounted, useId } from 'vue';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import type { UnwrapRefCarouselApi as CarouselApi } from '@/components/ui/carousel/interface';
import type {
  Slideshow as SlideshowConfig,
  SlideshowAlignment,
  SlideshowSlide,
} from '@/types/slideshow';
import { isSafeHref } from '@/utils/safe-link';
import { resolveSlides, type ResolvedSlide, type SlideReferenceResolver } from '@/utils/resolve-slides';
import useScrollFreeze from '@/composables/useScrollFreeze';
import Autoplay from 'embla-carousel-autoplay';
import type { AutoplayType } from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import AppBackgroundEffect from './BackgroundEffect.vue';

const props = withDefaults(
  defineProps<{
    layout: 'hero' | 'scroll-slide';
    slides: SlideshowSlide[];
    scrollFreeze?: boolean;
    autoplay?: boolean;
    autoplayDelay?: number;
    navigationStyle?: SlideshowConfig['navigationStyle'];
    size?: 'small' | 'medium' | 'large' | 'full';
    alignment?: SlideshowAlignment;
    showNavigation?: boolean;
    backgroundEffect?: SlideshowConfig['backgroundEffect'];
    backgroundEffectOptions?: SlideshowConfig['backgroundEffectOptions'];
    backgroundEffectFade?: SlideshowConfig['backgroundEffectFade'];
    backgroundEffectMode?: SlideshowConfig['backgroundEffectMode'];
    referenceResolver?: SlideReferenceResolver;
  }>(),
  {
    scrollFreeze: false,
    autoplay: false,
    autoplayDelay: 5000,
    navigationStyle: 'icons',
    size: 'full',
    alignment: 'center-right',
    showNavigation: true,
  },
);

let preloadLink: HTMLLinkElement | null = null;
let autoplayFrame: number | null = null;
let activeCarouselApi: CarouselApi | null = null;
let motionQuery: MediaQueryList | null = null;
const componentMounted = ref(false);

const containerRef = ref<HTMLElement | null>(null);
const carouselApiRef = ref<CarouselApi | null>(null);
const slidesKey = computed(() => JSON.stringify(props.slides));
const slideshowInstanceId = useId();
const {
  data: resolvedSlidesData,
  pending,
  error,
} = await useAsyncData(
  computed(() => `slideshow-slides-${slideshowInstanceId}-${slidesKey.value}`),
  () => resolveSlides(props.slides ?? [], path => queryContent(path), props.referenceResolver),
  { watch: [slidesKey, () => props.referenceResolver] },
);
const resolvedSlides = computed(() => resolvedSlidesData.value ?? []);
const autoplayEligible = computed(
  () => props.autoplay && resolvedSlides.value.length > 1,
);
const isLoading = computed(() =>
  componentMounted.value === true ? pending.value : true,
);
const hasLoadError = computed(() => Boolean(error.value));
const isEmpty = computed(
  () => !isLoading.value && !hasLoadError.value && !resolvedSlides.value.length,
);
const currentSlideIndex = ref(0);
const isBackgroundEffectActive = ref(
  false,
);
const autoplayProgress = ref(0);
const prefersReducedMotion = ref(false);
const autoplayPaused = ref(true);
const heroFadeDuration = 60;

const carouselOrientation = computed(() =>
  props.layout === 'hero' ? 'horizontal' : 'vertical',
);
const carouselOpts = computed(() => ({
  loop: !(
    props.scrollFreeze &&
    props.layout === 'scroll-slide' &&
    resolvedSlides.value.length > 1
  ),
  align: 'start' as const,
  slidesToScroll: 1,
  skipSnaps: false,
  axis: props.layout === 'hero' ? ('x' as const) : ('y' as const),
  direction: 'ltr' as const,
  duration: prefersReducedMotion.value
    ? 0
    : props.layout === 'hero'
      ? heroFadeDuration
      : 25,
}));
const autoplayPlugin: AutoplayType = Autoplay({
      delay: Math.max(1, props.autoplayDelay),
      playOnInit: false,
       stopOnInteraction: true,
       stopOnFocusIn: false,
      stopOnMouseEnter: false,
    });
const fadePlugin = Fade();
const carouselPlugins = computed(() => [autoplayPlugin, ...(props.layout === 'hero' ? [fadePlugin] : [])]);


let carouselHovered = false;
let carouselFocused = false;
let carouselDragging = false;
let resumeAfterHover = false;
let autoplayPausedByUser = false;
const { isActive: scrollFreezeActive } = useScrollFreeze(
  containerRef,
  carouselApiRef,
  computed(() => ({
    totalSlides: resolvedSlides.value.length,
    enabled:
      props.scrollFreeze &&
      props.layout === 'scroll-slide' &&
      resolvedSlides.value.length > 1,
  })),
);
const containerHeightClass = computed(
  () =>
    props.layout === 'scroll-slide' ? ({
      small: 'h-[50svh] min-h-[380px]',
      medium: 'h-[60svh] min-h-[420px]',
      large: 'h-[85svh]',
      full: 'h-[100svh]',
    })[props.size] :
    ({
      small: 'h-auto min-h-[85vh] md:h-[50vh] md:min-h-[380px]',
      medium: 'h-auto min-h-[85vh] md:h-[60vh] md:min-h-[420px]',
      large: 'h-auto min-h-[85vh] md:h-[85vh]',
      full: 'h-auto min-h-screen md:h-screen',
    })[props.size] ?? 'h-auto min-h-[85vh]',
);
const backgroundBaseClass =
  'bg-gradient-to-b from-background to-muted';


function safeDestination(slide: ResolvedSlide) {
  return slide.link && isSafeHref(slide.link) ? slide.link : undefined;
}
function textAlignmentClass(alignment?: string) {
  switch (alignment) {
    case 'top-right':
      return 'text-right items-start justify-start md:items-end';
    case 'top-center':
      return 'text-center items-start justify-start md:items-center';
    case 'top-left':
      return 'text-left items-start justify-start';
    case 'right':
      return 'text-right items-start justify-start md:items-end md:justify-end';
    case 'center':
      return 'text-center items-start justify-start md:items-center md:justify-center';
    case 'left':
      return 'text-left items-start justify-start';
    case 'center-right':
      return 'text-right items-start justify-start md:items-center md:justify-center';
    case 'center-left':
      return 'text-left items-start justify-start md:items-center md:justify-center';
    default:
      return 'text-left items-start justify-start';
  }
}
function slideTextAlignmentClass(slide: ResolvedSlide) {
  if (slide.textAlignment) return `text-${slide.textAlignment}`;
  const legacyAlignment = slide.alignment?.replace(/^(top-|center-)/, '');
  return ['left', 'center', 'right'].includes(legacyAlignment ?? '')
    ? `text-${legacyAlignment}`
    : 'text-left';
}
function imagePositionClass(slide: ResolvedSlide) {
  return slide.imagePosition === 'left'
    ? 'lg:col-start-1 lg:row-start-1 lg:row-span-2'
    : 'lg:col-start-2 lg:row-start-1 lg:row-span-2';
}
function textPositionClass(slide: ResolvedSlide) {
  return slide.imagePosition === 'left' ? 'lg:col-start-2' : 'lg:col-start-1';
}
function preloadNextImage() {
  preloadLink?.remove();
  preloadLink = null;
  const image =
    resolvedSlides.value[
      (currentSlideIndex.value + 1) % resolvedSlides.value.length
    ]?.image;
  if (image) {
    preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'image';
    preloadLink.href = image;
    document.head.appendChild(preloadLink);
  }
}
function getAutoplay() {
  return carouselApiRef.value?.plugins?.().autoplay as AutoplayType | undefined;
}
function cancelAutoplayProgress() {
  if (autoplayFrame !== null) cancelAnimationFrame(autoplayFrame);
  autoplayFrame = null;
}
function updateAutoplayProgress() {
  const timeUntilNext = getAutoplay()?.timeUntilNext();
  if (timeUntilNext === null || timeUntilNext === undefined) return;
  autoplayProgress.value = Math.min(
    100,
    Math.max(0, (1 - timeUntilNext / Math.max(1, props.autoplayDelay)) * 100),
  );
}
function startAutoplayProgress() {
  cancelAutoplayProgress();
  autoplayProgress.value = 0;
  if (!autoplayEligible.value || prefersReducedMotion.value) return;
  const renderProgress = () => {
    updateAutoplayProgress();
    autoplayFrame = requestAnimationFrame(renderProgress);
  };
  renderProgress();
}
function stopAutoplayProgress() {
  cancelAutoplayProgress();
}
function toggleAutoplay() {
  const autoplay = getAutoplay();
  if (!autoplayEligible.value || !autoplay || prefersReducedMotion.value)
    return;
  if (autoplayPaused.value) {
    autoplayPausedByUser = false;
    resumeAfterHover = false;
    resumeAutoplayIfEligible();
  } else {
    autoplayPausedByUser = true;
    resumeAfterHover = false;
    autoplay.stop();
  }
}
function onCarouselMouseEnter() {
  carouselHovered = true;
  const autoplay = getAutoplay();
  resumeAfterHover = resumeAfterHover || (Boolean(autoplay?.isPlaying()) && !autoplayPausedByUser);
  if (resumeAfterHover) autoplay?.stop();
}
function onCarouselMouseLeave() {
  carouselHovered = false;
  resumeAfterInteraction();
}
function onCarouselFocusIn() {
  carouselFocused = true;
  const autoplay = getAutoplay();
  resumeAfterHover = resumeAfterHover || (Boolean(autoplay?.isPlaying()) && !autoplayPausedByUser);
  if (resumeAfterHover) autoplay?.stop();
}
function onCarouselFocusOut(event: FocusEvent) {
  if ((event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) return;
  carouselFocused = false;
  resumeAfterInteraction();
}
function resumeAfterInteraction() {
  if (carouselHovered || carouselFocused || carouselDragging) return;
  if (resumeAfterHover) resumeAutoplayIfEligible();
  resumeAfterHover = false;
}
function resumeAutoplayIfEligible() {
  if (!autoplayEligible.value || prefersReducedMotion.value || autoplayPausedByUser || document.visibilityState === 'hidden')
    return;
  if (carouselHovered || carouselFocused || carouselDragging) {
    resumeAfterHover = true;
    return;
  }
  getAutoplay()?.play();
}
function onPointerDown() { carouselDragging = true; }
function onPointerUp() { carouselDragging = false; resumeAutoplayIfEligible(); }
function onVisibilityChange() {
  // Embla also handles visibility; run after it regardless of listener order.
  queueMicrotask(() => {
    if (!componentMounted.value) return;
    if (document.visibilityState === 'hidden' || !autoplayEligible.value || prefersReducedMotion.value || autoplayPausedByUser || carouselHovered || carouselFocused || carouselDragging) getAutoplay()?.stop();
    else resumeAutoplayIfEligible();
  });
}
function scrollPrevious() {
  carouselApiRef.value?.scrollPrev();
  resetAutoplay();
}
function scrollNext() {
  carouselApiRef.value?.scrollNext();
  resetAutoplay();
}
function resetAutoplay() {
  const autoplay = getAutoplay();
  if (autoplay?.isPlaying()) autoplay.reset();
}
function updateCurrentSlide(api: CarouselApi) {
  if (!api) return;
  currentSlideIndex.value = api.selectedScrollSnap?.() ?? 0;
  preloadNextImage();
}
function onCarouselReInit(api: CarouselApi) {
  updateCurrentSlide(api);
  if (!prefersReducedMotion.value) resumeAutoplayIfEligible();
}
function removeCarouselListeners() {
  if (!activeCarouselApi) return;
  activeCarouselApi.off?.('select', updateCurrentSlide);
  activeCarouselApi.off?.('reInit', onCarouselReInit);
  activeCarouselApi.off?.('pointerDown', onPointerDown);
  activeCarouselApi.off?.('pointerUp', onPointerUp);
  activeCarouselApi.off?.('autoplay:play', onAutoplayPlay);
  activeCarouselApi.off?.('autoplay:stop', onAutoplayStop);
  activeCarouselApi.off?.('autoplay:timerset', startAutoplayProgress);
  activeCarouselApi.off?.('autoplay:timerstopped', stopAutoplayProgress);
  activeCarouselApi = null;
}
function onCarouselInit(api: CarouselApi) {
  if (!api) return;
  removeCarouselListeners();
  carouselDragging = false;
  carouselApiRef.value = api;
  activeCarouselApi = api;
  api.on?.('select', updateCurrentSlide);
  api.on?.('reInit', onCarouselReInit);
  api.on?.('pointerDown', onPointerDown);
  api.on?.('pointerUp', onPointerUp);
  if (autoplayPlugin) {
    api.on?.('autoplay:play', onAutoplayPlay);
    api.on?.('autoplay:stop', onAutoplayStop);
    api.on?.('autoplay:timerset', startAutoplayProgress);
    api.on?.('autoplay:timerstopped', stopAutoplayProgress);
    updateAutoplayState();
    if (componentMounted.value) {
      if (prefersReducedMotion.value) getAutoplay()?.stop();
      else resumeAutoplayIfEligible();
    }
  }
  updateCurrentSlide(api);
}
function onKeyDown(event: KeyboardEvent) {
  if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
  const previousKey = props.layout === 'hero' ? 'ArrowLeft' : 'ArrowUp';
  const nextKey = props.layout === 'hero' ? 'ArrowRight' : 'ArrowDown';
  if (event.key === previousKey) {
    event.preventDefault();
    scrollPrevious();
  } else if (event.key === nextKey) {
    event.preventDefault();
    scrollNext();
  }
}
onUnmounted(() => {
  componentMounted.value = false;
  removeCarouselListeners();
  cancelAutoplayProgress();
  preloadLink?.remove();
  motionQuery?.removeEventListener('change', onMotionPreferenceChange);
  document.removeEventListener('visibilitychange', onVisibilityChange);
});
function onMotionPreferenceChange(event: MediaQueryListEvent) {
  prefersReducedMotion.value = event.matches;
  carouselApiRef.value?.reInit?.(carouselOpts.value, carouselPlugins.value);
  if (event.matches) {
    resumeAfterHover = false;
    getAutoplay()?.stop();
    autoplayPaused.value = true;
    autoplayProgress.value = 0;
  } else {
    resumeAutoplayIfEligible();
  }
}
onMounted(() => {
  componentMounted.value = true;
  motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null;
  prefersReducedMotion.value = motionQuery?.matches ?? false;
  motionQuery?.addEventListener('change', onMotionPreferenceChange);
  document.addEventListener('visibilitychange', onVisibilityChange);
  if (autoplayPlugin && prefersReducedMotion.value) getAutoplay()?.stop();
  else resumeAutoplayIfEligible();
  updateAutoplayState();
});

function updateAutoplayState() {
  autoplayPaused.value = !getAutoplay()?.isPlaying();
}

function onAutoplayPlay() {
  autoplayPaused.value = false;
}

function onAutoplayStop() {
  autoplayPaused.value = true;
}
watch([autoplayEligible, () => props.autoplayDelay], () => {
  // Embla reads plugin options during reInit; user pause remains independent.
  autoplayPlugin.options.delay = Math.max(1, props.autoplayDelay);
  carouselApiRef.value?.reInit(carouselOpts.value, carouselPlugins.value);
  if (autoplayEligible.value && !prefersReducedMotion.value) resumeAutoplayIfEligible();
  else getAutoplay()?.stop();
});
</script>

<template>
  <section
    ref="containerRef"
    class="app-slideshow relative flex h-full w-full flex-col justify-center mb-12"
    :class="[
      containerHeightClass,
      scrollFreezeActive ? 'overflow-hidden' : '',
      isBackgroundEffectActive ? 'bg-transparent' : backgroundBaseClass,
    ]"
    role="region"
    aria-roledescription="carousel"
    aria-label="Slideshow"
    tabindex="0"
    @keydown="onKeyDown"
  >
    <Transition
      name="fade"
      mode="out-in"
    >
      <div
        v-if="isLoading"
        key="loading"
        class="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-b from-background to-muted top-[-70px] left-0 right-0 bottom-0 py-[70px]"
      >
        <p
          role="status"
          class="text-muted-foreground"
        >
          Loading slides…
        </p>
      </div>
      <div
        v-else
        key="loaded"
      >
        <AppBackgroundEffect
          v-if="backgroundEffect && backgroundEffect !== 'none'"
          :effect="backgroundEffect"
          :options="backgroundEffectOptions"
          :fade="backgroundEffectFade"
          :mode="backgroundEffectMode"
          @active-change="isBackgroundEffectActive = $event"
        />
        <h2 class="sr-only">
          Slideshow
        </h2>
        <div
          class="relative z-10 flex h-full w-full flex-col justify-center py-4"
        >
          <div
            v-if="hasLoadError"
            class="flex min-h-[40vh] items-center justify-center"
            role="alert"
          >
            <p class="text-muted-foreground">
              Unable to load slides.
            </p>
          </div>
          <div
            v-else-if="isEmpty"
            class="flex min-h-[40vh] items-center justify-center"
          >
            <p class="w-full text-center text-muted-foreground">
              No slides available.
            </p>
          </div>
          <Carousel
            v-else-if="resolvedSlides.length"
            class="relative w-full"
            :class="containerHeightClass"
            :opts="carouselOpts"
            :plugins="carouselPlugins"
            :orientation="carouselOrientation"
            @init-api="onCarouselInit"
          >
            <CarouselContent
              class="h-full !transition-none"
              data-embla-track
              :class="layout === 'scroll-slide' ? 'max-w-7xl mx-auto' : ''"
              :aria-live="autoplayPaused ? 'polite' : 'off'"
              @mouseenter="onCarouselMouseEnter"
              @mouseleave="onCarouselMouseLeave"
              @focusin="onCarouselFocusIn"
              @focusout="onCarouselFocusOut"
            >
              <CarouselItem
                v-for="(slide, index) in resolvedSlides"
                :key="`${slide.type}:${index}:${slide.title ?? slide.link ?? ''}`"
                class="basis-full"
                :class="[
                  containerHeightClass,
                  layout === 'hero'
                    ? 'flex items-start justify-start md:items-center md:justify-center !transition-none'
                    : '',
                ]"
                :aria-label="`Slide ${index + 1} of ${resolvedSlides.length}: ${slide.title ?? 'Untitled'}`"
                role="group"
                :inert="index !== currentSlideIndex"
                :aria-hidden="index !== currentSlideIndex"
              >
                <div
                  v-if="layout === 'hero'"
                  class="slide-hero group relative mx-auto grid h-auto w-full max-w-7xl grid-cols-1 grid-rows-[auto_minmax(12rem,1fr)_auto] gap-6 transition-all duration-500 ease-in-out md:h-3/4 md:pb-0 lg:grid-cols-2 lg:grid-rows-2 lg:gap-8"
                  :class="[
                    isBackgroundEffectActive
                      ? 'bg-transparent'
                      : slide.backgroundClass || backgroundBaseClass,
                    'px-4 md:px-10',
                    textPositionClass(slide),
                    textAlignmentClass(slide.alignment ?? alignment),
                  ]"
                >
                  <h3
                    class="relative z-10 py-2 text-5xl font-normal leading-none md:py-2 md:text-6xl lg:row-start-1 lg:self-end lg:text-7xl"
                    :class="[
                      textPositionClass(slide),
                      slideTextAlignmentClass(slide),
                      slide.textColor || 'text-black dark:text-white',
                    ]"
                  >
                    {{ slide.title }}
                  </h3>
                  <div
                    class="relative z-10 min-h-[20vh] max-h-[30vh] md:max-h-[60vh] lg:max-h-[70vh] overflow-hidden rounded-3xl lg:h-full"
                    :class="imagePositionClass(slide)"
                  >
                    <NuxtImg
                      v-if="slide.image"
                      :src="slide.image"
                      :alt="slide.title ?? 'Slide image'"
                      :loading="index === 0 ? 'eager' : 'lazy'"
                      :fetchpriority="index === 0 ? 'high' : 'auto'"
                      width="1600"
                      height="900"
                      class="min-h-[20vh] max-h-[30vh] md:max-h-[60vh] lg:max-h-[70vh] h-full w-full object-cover"
                    />
                  </div>
                  <div
                    class="relative z-10 flex flex-col py-2 md:py-2 lg:row-start-2 lg:self-start"
                    :class="[
                      textPositionClass(slide),
                      slideTextAlignmentClass(slide),
                    ]"
                  >
                    <p
                      v-if="slide.description"
                      class="max-w-2xl text-xl md:text-2xl text-truncate-3 md:text-truncate-4 lg:text-truncate-5"
                      :class="[
                        slide.textColor || 'text-black/90 dark:text-white/90',
                        textPositionClass(slide),
                        textAlignmentClass(slide.alignment ?? alignment),
                      ]"
                    >
                      {{ slide.description }}
                    </p>
                    <a
                      v-if="slide.cta && isSafeHref(slide.cta.url)"
                      :href="slide.cta.url"
                      class="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                      :class="[textPositionClass(slide)]"
                    >
                      {{ slide.cta.text }}
                      <Icon
                        name="heroicons:chevron-right-20-solid"
                        class="h-6 w-6 animate-bounce-horizontal motion-reduce:animate-none"
                      />
                    </a>
                  </div>
                  <NuxtLink
                    v-if="safeDestination(slide) && safeDestination(slide) !== slide.cta?.url"
                    :to="safeDestination(slide)"
                    class="relative z-10 mt-4 inline-block underline focus-visible:outline-2 focus-visible:outline-primary"
                    :aria-label="`Open ${slide.title ?? slide.cta?.text ?? 'slide'}`"
                  >
                    View details
                  </NuxtLink>
                </div>
                <div
                  v-else
                  class="group relative grid h-full w-full grid-cols-1 grid-rows-[auto_minmax(12rem,1fr)_auto] gap-4 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-8"
                  :class="[
                    slide.backgroundClass,
                    textPositionClass(slide),
                    textAlignmentClass(slide.alignment ?? alignment),
                  ]"
                >
                  <h3
                    class="px-4 text-5xl font-normal leading-none md:text-7xl"
                    :class="[
                      textPositionClass(slide),
                      slide.textColor || 'text-black dark:text-white',
                    ]"
                  >
                    {{ slide.title }}
                  </h3>
                  <div
                    class="relative min-h-[20vh] max-h-[30vh] md:max-h-[60vh] lg:max-h-[70vh] px-4"
                    :class="imagePositionClass(slide)"
                  >
                    <NuxtImg
                      v-if="slide.image"
                      :src="slide.image"
                      :alt="slide.title ?? 'Slide image'"
                      :loading="index === 0 ? 'eager' : 'lazy'"
                      :fetchpriority="index === 0 ? 'high' : 'auto'"
                      width="1600"
                      height="900"
                      class="min-h-[20vh] max-h-[30vh] md:max-h-[60vh] lg:max-h-[70vh] h-full w-full rounded-2xl object-cover"
                    />
                  </div>
                  <div
                    class="relative flex flex-col px-4 lg:order-1"
                    :class="[
                      textPositionClass(slide),
                      textAlignmentClass(slide.alignment ?? alignment),
                    ]"
                  >
                    <p
                      v-if="slide.description"
                      class="text-lg text-muted-foreground"
                      :class="[
                        textPositionClass(slide),
                        textAlignmentClass(slide.alignment ?? alignment),
                      ]"
                    >
                      {{ slide.description }}
                    </p>
                    <a
                      v-if="slide.cta && isSafeHref(slide.cta.url)"
                      :href="slide.cta.url"
                      class="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                      :class="[
                        textPositionClass(slide),
                        textAlignmentClass(slide.alignment ?? alignment),
                      ]"
                    >
                      {{ slide.cta.text }}
                      <Icon
                        name="heroicons:chevron-right-20-solid"
                        class="h-6 w-6 animate-bounce-horizontal motion-reduce:animate-none"
                      />
                    </a>
                  </div>
                  <NuxtLink
                    v-if="safeDestination(slide) && safeDestination(slide) !== slide.cta?.url"
                    :to="safeDestination(slide)"
                    class="relative z-10 mt-4 inline-block underline focus-visible:outline-2 focus-visible:outline-primary"
                    :aria-label="`Open ${slide.title ?? slide.cta?.text ?? 'slide'}`"
                  >
                    View details
                  </NuxtLink>
                </div>
              </CarouselItem>
            </CarouselContent>
            <div
              v-if="showNavigation || autoplayEligible"
              data-slideshow-controls
              class="absolute inset-x-0 bottom-4 z-30 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 md:bottom-2 md:px-10"
            >
              <Button
                v-if="showNavigation"
                variant="ghost"
                type="button"
                :disabled="resolvedSlides.length < 2"
                aria-label="Previous slide"
                :class="
                  navigationStyle === 'icons'
                    ? 'h-11 w-11 rounded-full p-0'
                    : 'text-xs font-semibold tracking-[0.2em]'
                "
                @click="scrollPrevious"
              >
                <span v-if="navigationStyle === 'text'">PREV</span>
                <Icon
                  v-else
                  name="heroicons:chevron-left"
                  class="h-5 w-5"
                />
              </Button>
              <div
                v-if="navigationStyle === 'dots' && showNavigation"
                class="flex gap-2"
                aria-label="Choose slide"
              >
                <button
                  v-for="(_, index) in resolvedSlides"
                  :key="index"
                  type="button"
                  class="h-3 w-3 rounded-full border border-current"
                  :class="index === currentSlideIndex ? 'bg-primary' : 'bg-transparent'"
                  :aria-label="`Go to slide ${index + 1}`"
                  :aria-current="index === currentSlideIndex ? 'true' : undefined"
                  @click="carouselApiRef?.scrollTo(index); resetAutoplay()"
                />
              </div>
              <div
                v-if="autoplayEligible"
                role="progressbar"
                aria-label="Autoplay progress"
                :aria-valuenow="Math.round(autoplayProgress)"
                aria-valuemin="0"
                aria-valuemax="100"
                class="h-px max-w-md flex-1 overflow-hidden bg-black/20 dark:bg-white/25"
                :style="{ '--autoplay-progress': `${autoplayProgress}%` }"
              >
                <div
                  class="h-full bg-current transition-[width] duration-75"
                  :style="{ width: 'var(--autoplay-progress)' }"
                />
              </div>
              <Button
                v-if="autoplayEligible"
                variant="ghost"
                type="button"
                :disabled="prefersReducedMotion"
                :aria-label="
                  autoplayPaused ? 'Play autoplay' : 'Pause autoplay'
                "
                class="h-11 w-11 rounded-full p-0"
                @click="toggleAutoplay"
              >
                <Icon
                  v-if="autoplayPaused"
                  key="play"
                  name="heroicons:play"
                  class="h-5 w-5"
                />
                <Icon
                  v-else
                  key="pause"
                  name="heroicons:pause"
                  class="h-5 w-5"
                />
              </Button>
              <Button
                v-if="showNavigation"
                variant="ghost"
                type="button"
                :disabled="resolvedSlides.length < 2"
                aria-label="Next slide"
                :class="
                  navigationStyle === 'icons'
                    ? 'h-11 w-11 rounded-full p-0'
                    : 'text-xs font-semibold tracking-[0.2em]'
                "
                @click="scrollNext"
              >
                <span v-if="navigationStyle === 'text'">NEXT</span>
                <Icon
                  v-else
                  name="heroicons:chevron-right"
                  class="h-5 w-5"
                />
              </Button>
            </div>
          </Carousel>
        </div>
      </div>
    </Transition>
  </section>
</template>
