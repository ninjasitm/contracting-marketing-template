<script lang="ts" setup>
/**
 * ThemeViewer Component
 *
 * A development component to visualize the theme's color palette, typography, and component styles.
 * This helps ensure consistent application of the design system.
 */

// Props
const _props = defineProps({
  showColors: {
    type: Boolean,
    default: true,
  },
  showTypography: {
    type: Boolean,
    default: true,
  },
  showComponents: {
    type: Boolean,
    default: true,
  },
  showUtilities: {
    type: Boolean,
    default: true,
  },
});

const { showColors, showTypography, showComponents, showUtilities } = _props;

// Sample text for typography demo
const loremText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

// Color categories
const colorCategories = [
  {
    name: 'Primary',
    base: 'bg-primary',
    shades: Array.from({ length: 10 }, (_, i) => (i === 0 ? '50' : `${i}00`)),
  },
  {
    name: 'Secondary',
    base: 'bg-secondary',
    shades: Array.from({ length: 10 }, (_, i) => (i === 0 ? '50' : `${i}00`)),
  },
  {
    name: 'Success',
    base: 'bg-success',
    shades: Array.from({ length: 10 }, (_, i) => (i === 0 ? '50' : `${i}00`)),
  },
  {
    name: 'Error',
    base: 'bg-error',
    shades: Array.from({ length: 10 }, (_, i) => (i === 0 ? '50' : `${i}00`)),
  },
  {
    name: 'Warning',
    base: 'bg-warning',
    shades: Array.from({ length: 10 }, (_, i) => (i === 0 ? '50' : `${i}00`)),
  },
  {
    name: 'Info',
    base: 'bg-info',
    shades: Array.from({ length: 10 }, (_, i) => (i === 0 ? '50' : `${i}00`)),
  },
  {
    name: 'Grey',
    base: 'bg-grey',
    shades: Array.from({ length: 10 }, (_, i) => (i === 0 ? '50' : `${i}00`)),
  },
];

// Typography scale
const typographyScale = [
  { name: 'Heading 1', class: 'heading-1' },
  { name: 'Heading 2', class: 'heading-2' },
  { name: 'Heading 3', class: 'heading-3' },
  { name: 'Heading 4', class: 'heading-4' },
  { name: 'Body Large', class: 'body-lg' },
  { name: 'Body', class: 'body' },
  { name: 'Body Small', class: 'body-sm' },
  { name: 'Caption', class: 'caption' },
];

// Font families
const fontFamilies = [
  { name: 'Sans (Manrope)', class: 'font-sans' },
  { name: 'Heading (Sora)', class: 'font-heading' },
  { name: 'Mono (JetBrains Mono)', class: 'font-mono' },
];
</script>

<template>
  <div
    class="theme-viewer p-8 bg-white dark:bg-dark-bg-primary text-black dark:text-white"
  >
    <h1 class="text-2xl font-bold mb-6">
      Theme Viewer
    </h1>

    <!-- Color Palette -->
    <section
      v-if="showColors"
      class="mb-12"
    >
      <h2 class="text-xl font-bold mb-4">
        Color Palette
      </h2>
      <div
        v-for="category in colorCategories"
        :key="category.name"
        class="mb-8"
      >
        <h3 class="text-lg font-semibold mb-2">
          {{ category.name }}
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <!-- Default shade -->
          <div class="flex flex-col">
            <div
              :class="[
                category.base,
                'h-20 rounded-lg shadow-md flex items-center justify-center',
              ]"
            >
              <span
                class="font-mono text-xs text-center"
                :class="
                  ['50', '100', '200', '300', '400'].includes(category.name)
                    ? 'text-gray-900'
                    : 'text-white'
                "
              >
                {{ category.base }}
              </span>
            </div>
            <p class="text-sm mt-1 text-center">
              Default
            </p>
          </div>

          <!-- Color shades -->
          <div
            v-for="shade in category.shades"
            :key="shade"
            class="flex flex-col"
          >
            <div
              :class="[
                `${category.base}-${shade}`,
                'h-20 rounded-lg shadow-md flex items-center justify-center',
              ]"
            >
              <span
                class="font-mono text-xs text-center"
                :class="
                  ['50', '100', '200', '300'].includes(shade)
                    ? 'text-gray-900'
                    : 'text-white'
                "
              >
                {{ shade }}
              </span>
            </div>
            <p class="text-sm mt-1 text-center">
              {{ shade }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Typography -->
    <section
      v-if="showTypography"
      class="mb-12"
    >
      <h2 class="text-xl font-bold mb-4">
        Typography
      </h2>

      <!-- Font families -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-2">
          Font Families
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="font in fontFamilies"
            :key="font.name"
            class="p-4 bg-gray-100 dark:bg-dark-bg-secondary rounded-lg"
          >
            <p :class="[font.class, 'mb-1']">
              {{ font.name }}
            </p>
            <p
              :class="[font.class, 'text-sm text-gray-500 dark:text-gray-400']"
            >
              ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789
            </p>
          </div>
        </div>
      </div>

      <!-- Typography scale -->
      <div>
        <h3 class="text-lg font-semibold mb-2">
          Typography Scale
        </h3>
        <div class="space-y-4">
          <div
            v-for="type in typographyScale"
            :key="type.name"
            class="p-4 bg-gray-100 dark:bg-dark-bg-secondary rounded-lg flex flex-col md:flex-row md:items-center"
          >
            <div class="md:w-1/4 font-medium mb-2 md:mb-0">
              {{ type.name }}
            </div>
            <div class="md:w-3/4">
              <p :class="type.class">
                {{ loremText }}
              </p>
              <p
                class="mt-2 text-xs text-gray-500 dark:text-gray-400 font-mono"
              >
                .{{ type.class }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Components -->
    <section
      v-if="showComponents"
      class="mb-12"
    >
      <h2 class="text-xl font-bold mb-4">
        Components
      </h2>

      <!-- Buttons -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-2">
          Buttons
        </h3>
        <div class="flex flex-wrap gap-4">
          <button class="btn-primary">
            Primary Button
          </button>
          <button class="btn-secondary">
            Secondary Button
          </button>
          <button class="btn-outline">
            Outline Button
          </button>
          <button class="btn bg-error text-white">
            Error Button
          </button>
          <button class="btn bg-success text-white">
            Success Button
          </button>
        </div>
      </div>

      <!-- Cards -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-2">
          Cards
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="card">
            <div class="card-header">
              Card Title
            </div>
            <div class="card-body">
              <p>
                This is a standard card component with header, body, and footer
                sections.
              </p>
            </div>
            <div class="card-footer">
              Card Footer
            </div>
          </div>

          <div class="card">
            <div class="card-header bg-primary text-white">
              Primary Card
            </div>
            <div class="card-body">
              <p>
                A card with a colored header showing the primary theme color.
              </p>
            </div>
            <div class="card-footer">
              Card Footer
            </div>
          </div>

          <div class="card">
            <div class="card-header bg-secondary text-white">
              Secondary Card
            </div>
            <div class="card-body">
              <p>
                A card with a colored header showing the secondary theme color.
              </p>
            </div>
            <div class="card-footer">
              Card Footer
            </div>
          </div>
        </div>
      </div>

      <!-- Forms -->
      <div>
        <h3 class="text-lg font-semibold mb-2">
          Form Controls
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Text Input</label>
            <input
              type="text"
              class="form-input"
              placeholder="Enter text"
            >
          </div>

          <div>
            <label class="form-label">Select Input</label>
            <select class="form-input">
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- Utilities -->
    <section
      v-if="showUtilities"
      class="mb-12"
    >
      <h2 class="text-xl font-bold mb-4">
        Utility Classes
      </h2>

      <!-- Flexbox utilities -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-2">
          Flexbox Utilities
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 border rounded-lg">
            <p class="text-sm mb-2 font-mono">
              .flex-center
            </p>
            <div
              class="flex-center h-24 bg-gray-100 dark:bg-dark-bg-secondary rounded-lg"
            >
              <p>Centered content</p>
            </div>
          </div>

          <div class="p-4 border rounded-lg">
            <p class="text-sm mb-2 font-mono">
              .flex-between
            </p>
            <div
              class="flex-between h-24 bg-gray-100 dark:bg-dark-bg-secondary rounded-lg px-4"
            >
              <p>Left</p>
              <p>Right</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Position utilities -->
      <div>
        <h3 class="text-lg font-semibold mb-2">
          Position Utilities
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 border rounded-lg">
            <p class="text-sm mb-2 font-mono">
              .absolute-center
            </p>
            <div
              class="relative h-24 bg-gray-100 dark:bg-dark-bg-secondary rounded-lg"
            >
              <div class="absolute-center p-2 bg-primary text-white rounded">
                <p>Centered</p>
              </div>
            </div>
          </div>

          <div class="p-4 border rounded-lg">
            <p class="text-sm mb-2 font-mono">
              .text-shadow
            </p>
            <div
              class="flex-center h-24 bg-gray-100 dark:bg-dark-bg-secondary rounded-lg"
            >
              <p class="text-shadow text-xl font-bold">
                Text with shadow
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
