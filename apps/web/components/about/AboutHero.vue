<!-- Adapted from ninjasitm/nitm-marketing @ da649f7. MIT: docs/reference/NITM_MARKETING_LICENSE.md. -->
<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { usePreferredReducedMotion } from '@vueuse/core';
import VueTypewriterEffect from 'vue-typewriter-effect';
import AboutHeroMember from './AboutHeroMember.vue';
import type { HeroMember } from '@/types/heroes';
import { isSafeHref } from '@/utils/safe-link';
const props = withDefaults(defineProps<{ title?: string; description?: string; highlightText?: string; suffix?: string; backLinkUrl?: string; backLinkText?: string; members?: HeroMember[]; loadMembers?: boolean; mode?: 'typer' | 'text'; typerBegin?: string; typerText?: string[]; typerEnd?: string; autoplay?: boolean; pauseFor?: number; backgroundClass?: string; size?: 'small' | 'medium' | 'large' | 'full' }>(), { members: () => [], loadMembers: false, mode: 'text', autoplay: true, pauseFor: 4500, size: 'large', backgroundClass: 'bg-background' });
const loaded = ref<HeroMember[]>([]);
const team = computed(() => props.members.length ? props.members : loaded.value);
const safeTyperText = computed(() => props.typerText?.map(text => text.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] ?? character))));
let generation = 0;
watch(() => props.loadMembers, async enabled => {
  const run = ++generation;
  loaded.value = [];
  if (!enabled) return;
  try {
    // Local team files have no publication/order fields: all named entries, sorted by name.
    const entries = await queryContent('_about/teamMembers').sort({ name: 1 }).find();
    if (run === generation) loaded.value = entries.filter(entry => typeof entry.name === 'string').map(entry => ({ name: String(entry.name), position: typeof entry.position === 'string' ? entry.position : undefined, photo: typeof entry.photo === 'string' ? entry.photo : undefined, slug: typeof entry.slug === 'string' ? entry.slug : entry._path }));
  } catch { if (run === generation) loaded.value = []; }
}, { immediate: true });
onBeforeUnmount(() => { generation++; });
const paused = ref(false);
const reduced = usePreferredReducedMotion();
</script>
<template>
  <section
    class="text-foreground px-6 py-12 md:py-20"
    :class="[backgroundClass, { small: 'min-h-[320px]', medium: 'min-h-[420px]', large: 'min-h-[520px]', full: 'min-h-screen' }[size]]"
  >
    <div
      class="max-w-7xl mx-auto grid gap-10 items-center"
      :class="team.length ? 'lg:grid-cols-2' : ''"
    >
      <div>
        <NuxtLink
          v-if="isSafeHref(backLinkUrl) && backLinkText"
          :to="backLinkUrl"
          class="inline-flex mb-6 text-primary"
        >
          <span
            aria-hidden="true"
            class="mr-2"
          >←</span>{{ backLinkText }}
        </NuxtLink>
        <h1 class="text-4xl md:text-6xl break-words leading-tight">
          <template v-if="mode === 'typer' && typerText?.length">
            <span class="sr-only">{{ title || [typerBegin, typerText[0], typerEnd].filter(Boolean).join(' ') }}</span>
            <span aria-hidden="true">{{ typerBegin }} <span class="text-primary"><VueTypewriterEffect
              v-if="!paused && reduced !== 'reduce'"
              :strings="safeTyperText"
              :pause-for="pauseFor"
              loop
            /><span v-else>{{ typerText[0] }}</span></span> {{ typerEnd }}</span>
          </template>
          <template v-else>
            {{ title }} <span class="text-primary">{{ highlightText }}</span> {{ suffix }}
          </template>
        </h1>
        <p
          v-if="description"
          class="mt-6 text-xl text-muted-foreground leading-relaxed"
        >
          {{ description }}
        </p>
        <button
          v-if="mode === 'typer' && typerText?.length && reduced !== 'reduce'"
          type="button"
          class="mt-6 border border-border rounded-md px-4 py-2 focus-visible:ring-2 focus-visible:ring-ring"
          @click="paused = !paused"
        >
          {{ paused ? 'Resume animation' : 'Pause animation' }}
        </button>
        <slot />
      </div>
      <AboutHeroMember
        :members="team"
        :autoplay="autoplay"
        :paused="paused"
        :pause-for="pauseFor"
        @update:paused="paused = $event"
      />
    </div>
  </section>
</template>
