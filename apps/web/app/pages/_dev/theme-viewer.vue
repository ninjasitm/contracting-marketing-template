<script lang="ts" setup>
/**
 * Theme Viewer Page
 *
 * This is a development-only page to display and visualize all theme components and styles.
 * It helps ensure consistent application of the design system across the site.
 */

// Set page metadata
definePageMeta({
  layout: 'page',
  title: 'Theme Viewer',
  description: 'View all theme components and styles',
});

// Whether dark mode is currently active
const colorMode = useColorMode();

/**
 * Toggle between light and dark mode
 */
const toggleDarkMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
};
</script>

<template>
  <div class="container mx-auto py-8">
    <!-- Page header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold">
          Theme Viewer
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          A comprehensive view of the design system components and styles
        </p>
      </div>

      <!-- Theme toggle -->
      <button
        class="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-md"
        @click="toggleDarkMode"
      >
        <span v-if="colorMode.value === 'dark'">
          <Icon
            name="heroicons:sun"
            class="h-5 w-5 mr-2"
          />
          Light Mode
        </span>
        <span v-else>
          <Icon
            name="heroicons:moon"
            class="h-5 w-5 mr-2"
          />
          Dark Mode
        </span>
      </button>
    </div>

    <!-- Theme viewer component -->
    <AwesomeThemeViewer />

    <!-- Documentation link -->
    <div class="mt-10 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
      <h3 class="text-xl font-bold mb-2">
        Theme Documentation
      </h3>
      <p class="mb-4">
        For detailed information about how to use the theme system, refer to the
        documentation:
      </p>
      <a
        href="https://github.com/yourusername/contracting-marketing-template/blob/main/docs/TAILWIND_THEME.md"
        target="_blank"
        class="btn-primary inline-flex items-center"
      >
        <Icon
          name="heroicons:document-text"
          class="h-5 w-5 mr-2"
        />
        View Theme Documentation
      </a>
    </div>
  </div>
</template>
