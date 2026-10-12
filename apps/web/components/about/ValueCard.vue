<script setup lang="ts">
// Adapted from ninjasitm/nitm-marketing @ da649f7e374da848aac277d202a49942d708fc92; see docs/reference/NITM_MARKETING_LICENSE.md.
defineProps<{ title: string; description: string; icon?: string }>();
</script>

<template>
  <article class="rounded-2xl border border-border bg-card text-card-foreground p-8">
    <Icon
      v-if="icon"
      :name="icon"
      aria-hidden="true"
      class="w-6 h-6 mb-5 text-primary"
    />
    <h3 class="text-2xl font-semibold break-words">
      {{ title }}
    </h3>
    <p class="mt-4 text-muted-foreground leading-relaxed break-words">
      {{ description }}
    </p>
  </article>
</template>
