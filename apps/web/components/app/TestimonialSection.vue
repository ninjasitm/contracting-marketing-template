<script setup lang="ts">
import { ref } from 'vue';
import type { Testimonial } from '@/types/types';

// Concept: ninjasitm/nitm-marketing TestimonialSection, da649f7e374da848aac277d202a49942d708fc92.
defineProps<{ testimonial: Testimonial }>();
const failedAvatar = ref<string>();
</script>

<template>
  <LayoutPageSection class="w-full max-w-screen-xl mx-auto mt-20 px-2">
    <section
      aria-label="Client testimonial"
      class="border-y border-border py-12 md:py-16 text-foreground"
    >
      <figure class="max-w-4xl mx-auto px-4 md:px-8">
        <blockquote class="text-2xl md:text-3xl font-light leading-relaxed break-words">
          <p>{{ testimonial.quote }}</p>
        </blockquote>
        <figcaption class="flex items-center gap-4 mt-8">
          <NuxtImg
            v-if="testimonial.avatar && testimonial.avatar !== failedAvatar"
            :src="testimonial.avatar"
            alt=""
            width="48"
            height="48"
            loading="lazy"
            class="w-12 h-12 shrink-0 rounded-full object-cover"
            @error="failedAvatar = testimonial.avatar"
          />
          <div class="min-w-0 break-words">
            <p class="font-semibold">
              {{ testimonial.author }}
            </p>
            <p class="text-sm text-muted-foreground mt-1">
              {{ testimonial.position }}
            </p>
          </div>
        </figcaption>
      </figure>
    </section>
  </LayoutPageSection>
</template>
