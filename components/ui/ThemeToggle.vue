<script setup lang="ts">
import { computed } from 'vue';

const colorMode = useColorMode();

const isDark = computed(() => colorMode.value === 'dark');

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
};
</script>

<template>
  <UiButton
    variant="ghost"
    size="sm"
    class="w-9 h-9 p-0 rounded-md"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggleTheme"
  >
    <Icon
      :name="isDark ? 'lucide:sun' : 'lucide:moon'"
      class="h-4 w-4 transition-all"
    />
  </UiButton>
</template>
