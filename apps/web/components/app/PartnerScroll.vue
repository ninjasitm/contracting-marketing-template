<script setup lang="ts">
// Adapted from ninjasitm/nitm-marketing da649f7. MIT © 2025 NinjasInTheMachine.
// License: docs/reference/NITM_MARKETING_LICENSE.md
import { computed, ref, onMounted, watch } from 'vue';
import { usePreferredReducedMotion } from '@vueuse/core';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isSafeHref } from '@/utils/safe-link';
interface Partner {
  name: string; slug?: string; logo?: string; heroImage?: string;
  url?: string; description?: string; services?: string[];
}
const props = withDefaults(defineProps<{
  partners?: Partner[]; speed?: 'slow' | 'normal' | 'fast';
  animate?: boolean; title?: string; cta?: string; newTab?: boolean;
}>(), { partners: () => [], speed: 'normal', animate: true, title: 'Our partners', cta: 'Learn more', newTab: true });
const mounted = ref(false);
const paused = ref(false);
const reduced = usePreferredReducedMotion();
const moving = computed(() => mounted.value && props.animate && reduced.value !== 'reduce' && props.partners.length > 1);
const duration = computed(() => `${Math.max(20, props.partners.length * 8) * ({ slow: 1.5, normal: 1, fast: 0.6 }[props.speed] ?? 1)}s`);
const failed = ref(new Set<string>());
function imageFailed(event: Event) {
  const src = (event.target as HTMLImageElement).getAttribute('src');
  if (src) failed.value = new Set([...failed.value, src]);
}
function image(partner: Partner) {
  return [partner.heroImage, partner.logo].find(src => src && !failed.value.has(src));
}
watch(() => props.partners, () => { failed.value = new Set(); });
onMounted(() => { mounted.value = true; });
</script>

<template>
  <section :aria-label="title || 'Partners'">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h2
        v-if="title"
        class="text-3xl font-heading text-foreground"
      >
        {{ title }}
      </h2>
      <Button
        v-if="moving"
        type="button"
        variant="outline"
        :aria-pressed="paused"
        @click="paused = !paused"
      >
        {{ paused ? 'Resume partners' : 'Pause partners' }}
      </Button>
    </div>
    <div
      class="partner-scroll"
      :class="{ moving, paused }"
    >
      <div class="partner-track">
        <ul
          v-for="copy in moving ? 2 : 1"
          :key="copy"
          :aria-hidden="copy === 2 ? true : undefined"
          :inert="copy === 2 ? true : undefined"
          class="partner-group"
          :class="{ duplicate: copy === 2 }"
        >
          <li
            v-for="(partner, index) in partners"
            :key="partner.slug || index"
            class="min-w-0"
          >
            <Card class="flex h-full flex-col gap-4 p-6">
              <img
                v-if="image(partner)"
                :src="image(partner)"
                alt=""
                class="h-24 w-full object-contain"
                @error="imageFailed"
              >
              <div
                v-else
                aria-hidden="true"
                class="flex h-24 items-center justify-center rounded-md bg-muted text-3xl font-heading"
              >
                {{ partner.name.slice(0, 1) }}
              </div>
              <h3 class="text-xl font-heading">
                {{ partner.name }}
              </h3>
              <p
                v-if="partner.description"
                class="text-sm text-muted-foreground"
              >
                {{ partner.description }}
              </p>
              <ul
                v-if="partner.services?.length"
                aria-label="Services"
                class="flex flex-wrap gap-2"
              >
                <li
                  v-for="service in partner.services"
                  :key="service"
                  class="rounded-full bg-muted px-3 py-1 text-xs"
                >
                  {{ service.replaceAll('-', ' ') }}
                </li>
              </ul>
              <Button
                v-if="copy === 1 && isSafeHref(partner.url)"
                as="a"
                :href="partner.url"
                :target="newTab ? '_blank' : undefined"
                :rel="newTab ? 'noopener noreferrer' : undefined"
                class="mt-auto"
              >
                {{ cta }}<span class="sr-only">: {{ partner.name }}{{ newTab ? ' (opens in new tab)' : '' }}</span>
              </Button>
              <span
                v-else-if="isSafeHref(partner.url)"
                class="mt-auto text-sm font-medium"
              >{{ cta }}</span>
            </Card>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.partner-group { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: 1.5rem; }
.moving { overflow: hidden; }
.moving .partner-track { display: flex; width: max-content; animation: partner-scroll v-bind(duration) linear infinite; }
.moving .partner-group { display: flex; flex-shrink: 0; padding-right: 1.5rem; }
.moving .partner-group > li { width: min(80vw, 22rem); }
.paused .partner-track, .partner-scroll:hover .partner-track, .partner-scroll:focus-within .partner-track { animation-play-state: paused; }
@keyframes partner-scroll { to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) {
  .moving { overflow: visible; }
  .moving .partner-track { display: block; width: auto; animation: none; }
  .moving .partner-group { display: grid; padding: 0; }
  .moving .partner-group > li { width: auto; }
  .duplicate { display: none !important; }
}
</style>
