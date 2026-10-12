<!-- Adapted from ninjasitm/nitm-marketing @ da649f7. Copyright (c) 2025 Ninjas In The Machine. MIT: docs/reference/NITM_MARKETING_LICENSE.md. -->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';
import { type BadgeVariants, badgeVariants } from '.';

const props = defineProps<{
  variant?: BadgeVariants['variant']
  class?: HTMLAttributes['class']
}>();
</script>

<template>
  <div :class="cn(badgeVariants({ variant }), props.class)">
    <slot />
  </div>
</template>
