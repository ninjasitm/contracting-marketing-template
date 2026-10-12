<!-- Adapted from ninjasitm/nitm-marketing @ da649f7. MIT: docs/reference/NITM_MARKETING_LICENSE.md. -->
<script setup lang="ts">
import { computed, ref, shallowRef, watch, onBeforeUnmount } from 'vue';
import { usePreferredReducedMotion } from '@vueuse/core';
import Autoplay from 'embla-carousel-autoplay';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import type { UnwrapRefCarouselApi } from '@/components/ui/carousel/interface';
import type { HeroMember } from '@/types/heroes';
import { isSafeHref } from '@/utils/safe-link';
const props = withDefaults(defineProps<{ members?: HeroMember[]; pauseFor?: number; autoplay?: boolean; paused?: boolean; heightClass?: string; heroImageHeightClass?: string }>(), { members: () => [], pauseFor: 4500, autoplay: true, paused: false, heightClass: 'min-h-[320px]', heroImageHeightClass: 'h-80 md:h-[480px]' });
const emit = defineEmits<{ 'update:paused': [value: boolean] }>();
const reduced = usePreferredReducedMotion();
const userPaused = ref(false);
const stopped = computed(() => props.paused || userPaused.value || reduced.value === 'reduce' || !props.autoplay);
const plugin = Autoplay({ delay: () => props.members.map(() => Math.max(1000, props.pauseFor)), playOnInit: false, stopOnInteraction: true });
const api = shallowRef<UnwrapRefCarouselApi>();
const failed = ref(new Set<number>());
watch(() => props.members, () => { failed.value = new Set(); }, { deep: true });
function syncRotation() { if (stopped.value || props.members.length < 2) plugin.stop(); else if (api.value) plugin.play(); }
watch([stopped, () => props.members.length], syncRotation);
function detach() { api.value?.off?.('reInit', syncRotation); (api.value?.plugins?.().autoplay ?? plugin).stop(); }
function init(value: UnwrapRefCarouselApi) {
  if (api.value === value) return;
  detach();
  api.value = value;
  value?.on?.('reInit', syncRotation);
  syncRotation();
}
function pause() { userPaused.value = !stopped.value; emit('update:paused', userPaused.value); }
function interact(event: Event) { if ((event.target as HTMLElement)?.closest('[data-rotation-toggle]')) return; userPaused.value = true; emit('update:paused', true); }
onBeforeUnmount(detach);
</script>
<template>
  <div
    v-if="members.length"
    :class="heightClass"
  >
    <Carousel
      aria-label="Featured team members"
      :opts="{ loop: members.length > 1 }"
      :plugins="[plugin]"
      @init-api="init"
      @focusin="interact"
      @pointerdown="interact"
    >
      <CarouselContent>
        <CarouselItem
          v-for="(member, index) in members"
          :key="member.slug || index"
        >
          <figure class="rounded-2xl bg-muted overflow-hidden">
            <NuxtImg
              v-if="isSafeHref(member.featurePhoto || member.photo) && !failed.has(index)"
              :src="member.featurePhoto || member.photo"
              :alt="member.name"
              class="w-full object-contain"
              :class="heroImageHeightClass"
              @error="failed.add(index)"
            />
            <figcaption class="p-6">
              <h3 class="text-xl font-semibold text-foreground">
                {{ member.name }}
              </h3><p
                v-if="member.position"
                class="text-muted-foreground"
              >
                {{ member.position }}
              </p>
            </figcaption>
          </figure>
        </CarouselItem>
      </CarouselContent>
      <div
        v-if="members.length > 1"
        class="flex justify-center gap-4 mt-4"
      >
        <CarouselPrevious class="static translate-x-0 translate-y-0" />
        <button
          v-if="autoplay && reduced !== 'reduce'"
          data-rotation-toggle
          type="button"
          class="rounded-md border border-border px-4 text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          @click="pause"
        >
          {{ stopped ? 'Resume rotation' : 'Pause rotation' }}
        </button>
        <CarouselNext class="static translate-x-0 translate-y-0" />
      </div>
    </Carousel>
  </div>
  <slot
    v-else
    name="empty"
  />
</template>
