<script setup lang="ts">
const props = defineProps({
  blur: {
    type: Boolean,
    default: true,
  },
  rounded: {
    type: Boolean,
    default: true,
  },
  transparent: {
    type: Boolean,
    default: true,
  },
  backgroundClass: {
    type: String,
    default: null,
  },
});
</script>

<template>
  <div
    :class="{
      'flex flex-col': true,
      'backdrop-blur-lg': props.blur,
      'rounded-lg': props.rounded,
      'rounded-none': !props.rounded,
      'bg-transparent': props.transparent,
      'bg-white-400/[0.5] divide-gray-400 dark:bg-gray-700/[0.5] dark:divide-gray-700':
        !transparent,
      [backgroundClass]: true,
    }"
  >
    <slot />
  </div>
</template>
