<script setup lang="ts">
// Adapted from ninjasitm/nitm-marketing @ da649f7e374da848aac277d202a49942d708fc92; see docs/reference/NITM_MARKETING_LICENSE.md.
withDefaults(defineProps<{ sectionTitle: string; categories: { name: string; filter: string }[]; currentCategory?: string | null }>(), { currentCategory: null });
defineEmits<{ 'category-change': [value: string | null] }>();
</script>

<template>
  <div class="flex flex-col lg:flex-row lg:items-center gap-6">
    <h2 class="text-3xl md:text-4xl text-foreground break-words">
      {{ sectionTitle }}
    </h2>
    <div
      role="group"
      aria-label="Filter projects by category"
      class="flex flex-wrap gap-3 lg:ml-auto"
    >
      <button
        v-for="category in [{ name: 'All', filter: null }, ...categories]"
        :key="category.filter ?? 'all'"
        type="button"
        :aria-pressed="currentCategory === category.filter"
        class="rounded-full border px-4 py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        :class="currentCategory === category.filter ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-muted'"
        @click="$emit('category-change', category.filter)"
      >
        {{ category.name }}
      </button>
    </div>
  </div>
</template>
