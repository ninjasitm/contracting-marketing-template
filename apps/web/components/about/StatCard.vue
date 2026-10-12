<script setup lang="ts">
// Adapted from ninjasitm/nitm-marketing @ da649f7e374da848aac277d202a49942d708fc92; see docs/reference/NITM_MARKETING_LICENSE.md.
defineProps<{ number: string | number; label: string }>();
</script>

<template>
  <dl class="rounded-2xl bg-primary p-6 text-primary-foreground flex flex-col gap-2">
    <dt class="text-base order-2 break-words">
      {{ label }}
    </dt>
    <dd class="text-4xl font-bold break-words">
      {{ number }}
    </dd>
  </dl>
</template>
