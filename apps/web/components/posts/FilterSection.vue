<script setup lang="ts">
// Concept: ninjasitm/nitm-marketing posts/FilterSection.vue, da649f7e374da848aac277d202a49942d708fc92.
defineProps<{ options: { label: string; value: string }[]; modelValue: string }>();
defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <div
    role="group"
    aria-label="Filter posts"
    class="flex flex-wrap gap-3"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :aria-pressed="modelValue === option.value"
      class="px-4 py-2 rounded-full border text-sm font-medium transition-colors break-words max-w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      :class="modelValue === option.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:bg-accent'"
      @click="$emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
