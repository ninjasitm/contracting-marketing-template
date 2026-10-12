<!-- Adapted from ninjasitm/nitm-marketing courses/CourseSessionDetail @ da649f7. MIT: docs/reference/NITM_MARKETING_LICENSE.md. -->
<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ContentTabItem } from '@/types/content-tabs';
import { isSafeHref } from '@/utils/safe-link';
const props = defineProps<{ item: ContentTabItem }>();
const failed = ref(false);
watch(() => props.item.image, () => { failed.value = false; });
</script>
<template>
  <article class="space-y-4 text-foreground break-words">
    <h3 class="text-2xl font-semibold">
      {{ item.title }}
    </h3>
    <NuxtImg
      v-if="isSafeHref(item.image) && !failed"
      :src="item.image"
      :alt="item.title"
      loading="lazy"
      class="w-full rounded-xl object-cover"
      @error="failed = true"
    />
    <p
      v-if="item.summary"
      class="text-muted-foreground leading-relaxed"
    >
      {{ item.summary }}
    </p>
    <p
      v-if="item.description && item.description !== item.summary"
      class="text-muted-foreground leading-relaxed"
    >
      {{ item.description }}
    </p>
    <p
      v-if="item.duration"
      class="inline-flex rounded-full bg-muted px-3 py-1 text-sm"
    >
      {{ item.duration }}
    </p>
    <ul
      v-if="item.topics?.length"
      class="list-disc pl-5 space-y-2"
    >
      <li
        v-for="(topic, index) in item.topics"
        :key="index"
      >
        {{ topic }}
      </li>
    </ul>
    <slot />
  </article>
</template>
