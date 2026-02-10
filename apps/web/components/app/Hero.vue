<script setup lang="ts">
import VueTypewriterEffect from 'vue-typewriter-effect';
import type { Hero as AppHeroProps } from '@/types/types';

const props = defineProps<AppHeroProps>();

let backgroundImageInterval: ReturnType<typeof setInterval> | null = null;

const backgroundImages = computed(() => {
  if (!props.backgroundImage) return [];
  return Array.isArray(props.backgroundImage)
    ? props.backgroundImage
    : [props.backgroundImage];
});

const randomBackgroundImage = ref(
  backgroundImages.value[
    Math.floor(Math.random() * backgroundImages.value.length)
  ],
);

const backgroundStyle = computed(() => {
  if (!backgroundImages.value || backgroundImages.value.length === 0) return {};

  return {
    backgroundImage: `url('${randomBackgroundImage.value}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };
});

const overlayStyle = computed(() => {
  if (!props.overlayColor)
    return {
      backgroundColor: 'rgba(0, 0, 0, 0.15)',
    };

  return {
    backgroundColor: props.overlayColor,
  };
});

const heightClass = computed(() => {
  switch (props.size) {
    case 'tiny':
      return 'min-h-[20vh]';
    case 'small':
      return 'min-h-[40vh]';
    case 'medium':
      return 'min-h-[60vh]';
    case 'large':
      return 'min-h-[75vh]';
    case 'full':
      return 'min-h-screen';
    default:
      return 'min-h-[85vh]';
  }
});

const textAlignmentClass = computed(() => {
  switch (props.alignment) {
    case 'right':
      return 'text-right items-end';
    case 'center':
      return 'text-center items-center';
    case 'left':
    default:
      return 'text-left items-start';
  }
});

const textColorClass = computed(() => {
  return props.textColor || 'text-white';
});

function getActionTo(url: string) {
  try {
    return JSON.parse(url);
  } catch (e) {
    console.warn(`Failed to parse URL: ${url}`, e);
    return url; // If parsing fails, return the URL as is
  }
}

onUnmounted(() => {
  if (backgroundImageInterval) {
    clearInterval(backgroundImageInterval);
  }
});

onMounted(() => {
  backgroundImageInterval = setInterval(() => {
    randomBackgroundImage.value =
      backgroundImages.value[
        Math.floor(Math.random() * backgroundImages.value.length)
      ];
  }, 5000);
});
</script>

<template>
  <section
    class="app-hero relative w-full flex flex-col justify-end transition-all duration-500 ease-in-out"
    :class="[
      heightClass,
      props.backgroundClass ||
        'bg-linear-to-b bg-gradient-to-b from-[#0F1A2A] to-[#171717]',
    ]"
  >
    <Transition name="slide-fade">
      <div
        v-if="randomBackgroundImage"
        class="absolute inset-0"
        :style="backgroundStyle"
      />
    </Transition>
    <!-- Overlay -->
    <div
      v-if="overlayStyle"
      class="absolute inset-0"
      :style="overlayStyle"
    />

    <!-- Content -->
    <div
      class="relative z-10 w-full max-w-7xl mx-auto px-4 py-12 md:py-24 flex flex-col md:px-10"
      :class="[textAlignmentClass]"
    >
      <div class="w-full flex flex-col justify-start align-end">
        <template v-if="mode === 'typer'">
          <h1
            class="text-6xl md:text-8xl lg:text-9xl font-normal leading-tight mb-8 animate-slide-up-fade"
          >
            <span
              class="text-foreground"
              v-html="typerBegin || '_'"
            />
            <span class="text-primary">
              <VueTypewriterEffect
                loop
                :strings="
                  Array.isArray(typerText) ? typerText : [typerText || '']
                "
              />
            </span>
            <span
              class="text-foreground"
              v-html="typerEnd"
            />
          </h1>
        </template>
        <template v-else>
          <h1
            class="text-6xl md:text-7xl lg:text-8xl font-normal leading-tight animate-slide-up-fade"
            :class="[textColorClass]"
            v-html="title"
          />

          <p
            v-if="description"
            class="mt-4 text-lg md:text-xl animate-slide-up-fade-delayed"
            :class="[textColorClass]"
            v-html="description"
          />
        </template>
        <div
          class="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up-fade-long-delay"
        >
          <component
            :is="action.type === 'link' ? 'NuxtLink' : 'AppButton'"
            v-for="action in actions"
            :key="action.text"
            :size="action.size || 'default'"
            :to="getActionTo(action.url)"
            :class="action.class"
          >
            <span v-html="action.text" />
          </component>
        </div>
      </div>
    </div>
  </section>
</template>
