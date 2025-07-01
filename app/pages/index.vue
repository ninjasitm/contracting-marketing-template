<script setup lang="ts">
import { reactive, computed } from 'vue';
import { useHead } from 'nuxt/app';
import _config from '@content/_pages/home.json';
import type { Hero, CallToAction, BasePageState } from '@/types/types';
// Nuxt 3 composables are auto-imported, but for type safety, import from 'nuxt/app'
import { definePageMeta } from '#imports';

export interface HomePageState extends BasePageState {
  coreCompetencies?: {
    title?: string;
    description?: string;
    items?: {
      heading: string;
      items: string[];
    }[];
  };
  differentiators?: {
    title?: string;
    items?: {
      icon: string;
      description: string;
    }[];
  };
  callToAction?: CallToAction;
}

definePageMeta({ layout: 'page' });

const config = _config as HomePageState;

useHead({
  titleTemplate: '',
  title: config?.hero?.title || 'Contracting Starter',
});

// Convert the config to properly typed state
const state = reactive<HomePageState>({
  hero: config.hero
    ? {
        ...config.hero,
        actions: config.hero.actions?.map((action) => ({
          ...action,
          type:
            action.type === 'button' || action.type === 'link'
              ? action.type
              : 'button',
        })),
      }
    : undefined,
  coreCompetencies: config.coreCompetencies,
  differentiators: config.differentiators,
  callToAction: config.callToAction,
});

// Transform hero data for AppHero component
const heroData = computed<Hero>(() => {
  if (!state.hero) return {};

  return {
    title: state.hero.title,
    description: state.hero.description,
    actions: state.hero.actions || [],
    highlightText: state.hero.highlightText || '',
    subtitle: state.hero.subtitle || '',
    suffix: state.hero.suffix || '',
    size: state.hero.size || 'default',
    overlayColor: 'rgba(0, 0, 0, 0.5)', // Default overlay color
    overlayClass: state.hero.overlayClass || 'bg-black bg-opacity-50',
    featuredType: state.hero.featuredType || 'default',
    featuredItems: state.hero.featuredItems || [],
    mode: state.hero.mode || 'default',
    alignment: state.hero.alignment || 'center',
    textColor: state.hero.textColor || 'white',
    backgroundImage: state.hero.backgroundImage || '',
    typerBegin: state.hero.typerBegin || '',
    typerEnd: state.hero.typerEnd || '',
    typerText: state.hero.typerText || '',
    backgroundClass:
      state.hero.backgroundClass ||
      'bg-blend-darken bg-gradient-to-t from-black to-transparent text-white',
  };
});
</script>

<template>
  <div
    class="flex relative flex-col pb-24 w-full min-h-[500px] md:min-h-[800px] max-md:max-w-full"
  >
    <!-- Hero Section using AppHero -->
    <ClientOnly>
      <Teleport defer to="#page-banner">
        <AppHero v-bind="heroData" />
      </Teleport>
    </ClientOnly>

    <!-- Core Competencies Section -->
    <LayoutPageSection
      class="flex flex-col w-full max-w-screen-xl mt-5 md:mt-20 mx-auto px-2 lg:px-2"
    >
      <hr class="w-full border border-black dark:border-white mt-10" />
      <h2
        class="gap-2 self-stretch pt-6 w-full text-xl font-light tracking-tight uppercase text-sky-950 dark:text-sky-300"
        v-html="state.coreCompetencies?.title"
      />
      <div
        class="flex flex-col mt-16 w-full text-black dark:text-white max-md:mt-10"
      >
        <div class="flex flex-col w-full max-md:max-w-full">
          <div class="flex flex-col w-full max-md:max-w-full">
            <p
              class="text-xl lg:text-4xl font-light max-md:max-w-full"
              v-html="state.coreCompetencies?.description"
            />
            <NuxtLink
              class="flex gap-1 items-center mt-3 p-3 my-auto text-base tracking-tight uppercase rounded-lg border border-black dark:border-white max-w-[max-content] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              :to="{ name: 'process' }"
            >
              <NuxtImg
                placeholder
                loading="lazy"
                src="/images/open-link.svg"
                alt=""
                class="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
              />
              <span class="self-stretch my-auto">View our processes</span>
            </NuxtLink>
          </div>
          <div
            class="flex flex-wrap gap-20 items-start mt-16 w-full max-md:mt-10"
          >
            <div
              v-for="(competency, index) in state.coreCompetencies?.items"
              :key="index"
              class="flex flex-col flex-1 shrink basis-0 min-w-[240px]"
            >
              <h3 class="text-base tracking-tight uppercase">
                {{ competency.heading }}
              </h3>
              <ul class="flex flex-col mt-6 w-full text-lg font-light">
                <li
                  v-for="(item, i) in competency.items"
                  :key="i"
                  class="flex-1 shrink gap-4 pb-4 mt-4 w-full border-b border-black dark:border-white"
                  :class="{ 'mt-0': i === 0 }"
                >
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </LayoutPageSection>

    <!-- Differentiators Section -->
    <LayoutPageSection
      class="flex flex-col mt-32 w-full font-light max-md:mt-10 max-w-screen-xl mx-auto px-2 lg:px-2"
    >
      <hr class="w-full border border-black dark:border-white mt-10" />
      <h2
        class="gap-2 self-stretch pt-6 w-full text-xl tracking-tight uppercase whitespace-nowrap text-sky-950 dark:text-sky-300"
        v-html="state.differentiators?.title"
      />
      <div
        class="flex flex-wrap gap-5 mt-16 w-full text-2xl text-black dark:text-white max-md:mt-10"
      >
        <AppCard
          v-for="(differentiator, index) in state.differentiators?.items"
          :key="index"
          variant="default"
          class="flex flex-col grow shrink p-4 lg:p-2 bg-white dark:bg-gray-800 rounded-2xl min-w-[240px] w-[330px]"
        >
          <template #header>
            <NuxtImg
              placeholder
              :src="differentiator.icon"
              :alt="differentiator.description"
              class="object-contain w-14 aspect-square mb-4"
            />
          </template>
          <p class="mt-6">
            {{ differentiator.description }}
          </p>
        </AppCard>
      </div>
    </LayoutPageSection>

    <!-- Call to Action Section -->
    <AppCTA
      v-if="
        state.callToAction &&
        (state.callToAction.title || state.callToAction.description)
      "
      :title="state.callToAction.title"
      :description="state.callToAction.description"
      :primary-action="state.callToAction.primaryButtonText"
      class="w-full max-w-screen-xl mx-auto mt-20"
      @primary-action="navigateTo(state.callToAction.primaryButtonUrl)"
    />
  </div>
</template>
