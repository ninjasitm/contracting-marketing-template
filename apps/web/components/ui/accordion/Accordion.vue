<!-- Adapted from ninjasitm/nitm-marketing @ da649f7. Copyright (c) 2025 Ninjas In The Machine. MIT: docs/reference/NITM_MARKETING_LICENSE.md. -->
<script setup lang="ts">
    import type { AccordionRootEmits, AccordionRootProps } from "reka-ui";
    import {
        AccordionRoot,
        useForwardPropsEmits,
    } from "reka-ui";

    const props = defineProps<AccordionRootProps>();
    const emits = defineEmits<AccordionRootEmits>();

    const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <AccordionRoot v-bind="forwarded">
    <slot />
  </AccordionRoot>
</template>
