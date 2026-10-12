<script setup lang="ts">
// Adapted from ninjasitm/nitm-marketing da649f7. MIT © 2025 NinjasInTheMachine.
// License: docs/reference/NITM_MARKETING_LICENSE.md
withDefaults(defineProps<{
  logoSrc?: string; message?: string; size?: 'sm' | 'md' | 'lg'; loading?: boolean;
}>(), { logoSrc: '', message: 'Loading…', size: 'md', loading: true });
const sizes = { sm: 'w-16 h-16', md: 'w-24 h-24', lg: 'w-32 h-32' };
</script>

<template>
  <div
    v-if="loading"
    role="status"
    aria-live="polite"
    class="flex flex-col items-center justify-center gap-3"
  >
    <img
      v-if="logoSrc"
      :src="logoSrc"
      alt=""
      aria-hidden="true"
      class="object-contain motion-safe:animate-pulse"
      :class="sizes[size]"
    >
    <p class="text-sm text-muted-foreground">
      {{ message || 'Loading…' }}
    </p>
  </div>
</template>
