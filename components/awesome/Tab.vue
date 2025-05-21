<script lang="ts" setup>
import { inject } from 'vue';

defineProps({
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});
const activeTab = inject<string>('activeTab');
</script>

<template>
  <div
    v-show="activeTab === name"
    class="relative overflow-auto px-4 lg:px-10 py-2"
  >
    <slot />
  </div>
</template>
