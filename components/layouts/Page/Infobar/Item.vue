<script lang="ts" setup>
const props = defineProps<{
  label: string;
  value: string;
}>();
</script>

<template>
  <div class="flex gap-1 items-center self-stretch my-auto">
    <span class="self-stretch my-auto text-blue-100">{{ props.label }}</span>
    <span
      class="self-stretch my-auto font-semibold tracking-tight text-white"
    >{{ props.value }}</span>
  </div>
</template>
