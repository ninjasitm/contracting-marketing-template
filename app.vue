<script lang="ts" setup>
const { config } = useAppConfig();

useHead({
  title: config.title,
  titleTemplate: `%s - ${config.title}`,
});

// Bugfix for forced color dark mode on computers
if (localStorage.getItem('nuxt-color-mode') === 'system') {
  localStorage.removeItem('nuxt-color-mode');
}
</script>

<template>
  <Body
    class="antialiased duration-300 transition-colors text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-950"
  >
    <NuxtLayout>
      <NuxtLoadingIndicator />
      <NuxtPage />
    </NuxtLayout>
  </Body>
</template>
