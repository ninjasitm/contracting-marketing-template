<script lang="ts" setup>
/**
 * ServiceFeature Component
 *
 * A reusable component for displaying service features in the services page.
 * This component can be used to display a service with its icon, title,
 * description and a list of features.
 */

defineProps({
  /**
   * The title of the service
   */
  title: {
    type: String,
    required: true,
  },
  /**
   * The URL path to the service icon
   */
  iconSrc: {
    type: String,
    required: true,
  },
  /**
   * Description text for the service
   */
  description: {
    type: String,
    required: true,
  },
  /**
   * List of features offered with this service
   */
  features: {
    type: Array as () => string[],
    default: () => [],
  },
});

/**
 * Handles image loading errors by substituting a placeholder
 * @param event - The error event from the image
 */
const onImageError = (event: string | Event) => {
  if (typeof event === 'string') {
    console.error('[ServiceFeature]: Failed to load image', event);
    return;
  }

  const target = event.target as HTMLImageElement;
  console.error('[ServiceFeature]: Failed to load image', target.src);
  // Set a placeholder or default image
  target.src = '/images/placeholder.svg';
};
</script>

<template>
  <div
    class="flex flex-col p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow h-full"
  >
    <div class="flex items-center mb-4">
      <NuxtImg
        placeholder
        loading="lazy"
        :src="iconSrc"
        :alt="`${title} icon`"
        class="w-12 h-12 mr-4 object-contain"
        @error="onImageError"
      />
      <h3 class="text-2xl font-medium">
        {{ title }}
      </h3>
    </div>
    <div class="flex-grow">
      <p
        class="text-lg mb-6"
        v-html="description"
      />
      <ul
        v-if="features && features.length > 0"
        class="list-disc pl-6 space-y-2"
      >
        <li
          v-for="(feature, index) in features"
          :key="index"
          class="text-base"
        >
          {{ feature }}
        </li>
      </ul>
    </div>
  </div>
</template>
