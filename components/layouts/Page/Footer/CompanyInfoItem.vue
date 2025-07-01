<script lang="ts" setup>
import { toRefs } from 'vue';

type Item = {
  label: string;
  value: string;
};

const props = defineProps<Item>();

const { label, value } = toRefs(props);
</script>

<template>
  <div class="flex flex-col flex-1 shrink justify-between basis-0 min-h-[52px]">
    <h3 class="text-sm text-stone-500 dark:text-stone-400">
      {{ label }}
    </h3>
    <p class="mt-3 text-base text-black dark:text-white">
      {{ value }}
    </p>
  </div>
</template>
