<!-- Adapted from ninjasitm/nitm-marketing @ da649f7. Copyright (c) 2025 Ninjas In The Machine. MIT: docs/reference/NITM_MARKETING_LICENSE.md. -->
<script setup lang="ts">
import { DialogTrigger, type DialogTriggerProps } from 'reka-ui';

const props = defineProps<DialogTriggerProps>();
</script>

<template>
  <DialogTrigger v-bind="props">
    <slot />
  </DialogTrigger>
</template>
