<script setup lang="ts">
// Adapted from ninjasitm/nitm-marketing @ da649f7e374da848aac277d202a49942d708fc92; see docs/reference/NITM_MARKETING_LICENSE.md.
import { computed, ref, watch, resolveComponent } from 'vue';
import type { Project, Client } from '@/types/types';
import { isSafeHref } from '@/utils/safe-link';
const props = withDefaults(defineProps<{
  project: Pick<Project, 'title' | 'slug'> & Partial<Pick<Project, 'description' | 'client' | 'heroImage'>>;
  client?: Pick<Client, 'name' | 'logo'>;
  clickable?: boolean;
  compact?: boolean;
  href?: string;
}>(), { clickable: true, compact: false });
const imageFailed = ref(false);
const image = computed(() => props.project.heroImage || props.client?.logo);
const link = computed(() => props.href === undefined ? `/work/${encodeURIComponent(props.project.slug)}` : props.href);
watch(image, () => { imageFailed.value = false; });
</script>

<template>
  <article class="rounded-2xl overflow-hidden border border-border bg-card text-card-foreground min-w-0">
    <component
      :is="clickable && isSafeHref(link) ? resolveComponent('NuxtLink') : 'div'"
      :to="clickable && isSafeHref(link) ? link : undefined"
      class="group block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2"
    >
      <div
        class="bg-muted overflow-hidden"
        :class="compact ? 'aspect-[2/1]' : 'aspect-video'"
      >
        <NuxtImg
          v-if="isSafeHref(image) && !imageFailed"
          :src="image"
          :alt="project.title"
          loading="lazy"
          class="w-full h-full motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
          :class="project.heroImage ? 'object-cover' : 'object-contain p-6'"
          @error="imageFailed = true"
        />
      </div>
      <div class="p-6">
        <p
          v-if="client?.name || project.client"
          class="text-sm text-muted-foreground mb-2 break-words"
        >
          {{ client?.name || project.client }}
        </p>
        <h3 class="text-2xl font-semibold break-words">
          {{ project.title }}
        </h3>
        <p
          v-if="project.description"
          class="mt-3 text-muted-foreground leading-relaxed break-words"
          :class="compact ? 'line-clamp-2' : 'line-clamp-3'"
        >
          {{ project.description }}
        </p>
        <span
          v-if="clickable && isSafeHref(link)"
          class="inline-block mt-5 text-primary font-medium"
        >View case study <span aria-hidden="true">→</span></span>
      </div>
    </component>
  </article>
</template>
