<!-- Adapted from ninjasitm/nitm-marketing @ da649f7. MIT: docs/reference/NITM_MARKETING_LICENSE.md. -->
<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useResizeObserver } from '@vueuse/core';
import { isSafeHref } from '@/utils/safe-link';
const props = withDefaults(defineProps<{ title: string; backLinkTo?: string; backLinkText?: string; heroMode?: 'background' | 'image'; image?: string; backgroundImage?: string; backgroundOverlayClass?: string; sectionClass?: string; titleClass?: string; contentClass?: string; imageClass?: string; imagePosition?: 'before' | 'after'; maxWidth?: '4xl' | '5xl' | '6xl' | '7xl' | 'full' }>(), { heroMode: 'background', imagePosition: 'after', backgroundOverlayClass: 'bg-background/85', sectionClass: 'py-12 md:py-20', titleClass: 'text-4xl md:text-6xl', contentClass: 'mx-auto px-6', maxWidth: '7xl', imageClass: 'w-full rounded-2xl object-cover max-h-[60vh]' });
const imageSource = computed(() => props.heroMode === 'background' ? props.backgroundImage ?? props.image : props.image ?? props.backgroundImage);
const failed = ref(false);
const header = ref<HTMLElement | null>(null);
const headerOffset = ref('0px');
onMounted(() => { header.value = document.getElementById('main-header'); });
useResizeObserver(header, () => { headerOffset.value = `${header.value?.getBoundingClientRect().height ?? 0}px`; });
watch(imageSource, () => { failed.value = false; });
</script>
<template>
  <section
    class="detail-hero relative text-foreground overflow-hidden"
    :class="sectionClass"
  >
    <template v-if="heroMode === 'background' && isSafeHref(imageSource) && !failed">
      <NuxtImg
        :src="imageSource"
        alt=""
        class="absolute inset-0 w-full h-full object-cover"
        @error="failed = true"
      />
      <div
        class="absolute inset-0"
        :class="backgroundOverlayClass"
      />
    </template>
    <div
      class="relative flex flex-col gap-6"
      :class="[contentClass, { '4xl': 'max-w-4xl', '5xl': 'max-w-5xl', '6xl': 'max-w-6xl', '7xl': 'max-w-7xl', full: 'max-w-full' }[maxWidth]]"
    >
      <NuxtLink
        v-if="isSafeHref(backLinkTo) && backLinkText"
        :to="backLinkTo"
        class="text-primary inline-flex self-start"
      >
        <span
          aria-hidden="true"
          class="mr-2"
        >←</span>{{ backLinkText }}
      </NuxtLink>
      <h1
        class="break-words"
        :class="titleClass"
      >
        {{ title }}
      </h1>
      <NuxtImg
        v-if="heroMode === 'image' && isSafeHref(imageSource) && !failed"
        :src="imageSource"
        :alt="title"
        :class="[imageClass, imagePosition === 'before' ? 'order-first' : '']"
        @error="failed = true"
      />
      <slot />
    </div>
  </section>
</template>

<style scoped>
/* The local header is in normal flow: offset anchor scrolling, not the hero layout. */
.detail-hero { scroll-margin-top: v-bind(headerOffset); }
</style>
