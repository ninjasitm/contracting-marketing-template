<!-- Adapted from ninjasitm/nitm-marketing @ da649f7. Copyright (c) 2025 Ninjas In The Machine. MIT: docs/reference/NITM_MARKETING_LICENSE.md. -->
<script setup lang="ts">
    import type { AccordionItemProps } from "reka-ui";
    import type { HTMLAttributes } from "vue";
    import { reactiveOmit } from "@vueuse/core";
    import { AccordionItem, useForwardProps } from "reka-ui";
    import { cn } from "@/lib/utils";

    const props = defineProps<AccordionItemProps & { class?: HTMLAttributes["class"] }>();

    const delegatedProps = reactiveOmit(props, "class");

    const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <AccordionItem
    v-bind="forwardedProps"
    :class="cn('border-b', props.class)"
  >
    <slot />
  </AccordionItem>
</template>
