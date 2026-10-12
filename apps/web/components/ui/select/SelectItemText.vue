<!-- Adapted from ninjasitm/nitm-marketing @ da649f7. Copyright (c) 2025 Ninjas In The Machine. MIT: docs/reference/NITM_MARKETING_LICENSE.md. -->
<script setup lang="ts">
import type { SelectItemTextProps } from "reka-ui";
import { SelectItemText } from "reka-ui";

const props = defineProps<SelectItemTextProps>();
</script>

<template>
  <SelectItemText v-bind="props">
    <slot />
  </SelectItemText>
</template>
