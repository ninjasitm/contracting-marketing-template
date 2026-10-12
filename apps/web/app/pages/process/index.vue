<script lang="ts" setup>
import { reactive } from 'vue';
import ProcessSection from '../../../components/process/ProcessSection.vue';
import _config from '@content/_pages/process.json';
import _appConfig from '@content/config.json';
import type { BasePageState } from '@/types/types';
import { useSeoConfig } from '@/composables/useSeoConfig';

export interface ProcessPageState extends BasePageState {
  sections?: Array<{
    title: string;
    description: string;
    items: string[];
  }>;
}

definePageMeta({ layout: 'page' });

const processConfig = _config as ProcessPageState;
const appConfig = _appConfig;

// Configure SEO metadata
useSeoConfig(processConfig.seo, processConfig.hero, appConfig);

const state: ProcessPageState = reactive({
  hero: processConfig.hero,
  sections: processConfig.sections,
  callToAction: processConfig.callToAction,
});
</script>
<template>
  <div
    class="flex relative flex-col pb-24 w-full md:min-h-[800px] max-md:max-w-full px-2"
  >
    <!-- Hero Section using AppHero -->
    <AppHero
      :title="state.hero?.title"
      :description="state.hero?.description"
      :mode="state.hero?.mode || 'text'"
      :alignment="state.hero?.alignment || 'center'"
      :size="state.hero?.size || 'medium'"
      class="pt-40 pb-20 lg:pt-60"
    />

    <!-- Process Sections -->
    <LayoutPageSection
      class="flex flex-col font-light text-black dark:text-white w-full max-w-screen-xl mx-auto"
    >
      <div
        class="flex flex-wrap gap-20 mt-10 w-full max-md:mt-10 max-md:max-w-full"
      >
        <ProcessSection
          v-for="(section, index) in state.sections"
          :key="index"
          :title="section.title"
          :description="section.description"
          :items="section.items"
        />
      </div>
    </LayoutPageSection>

    <!-- Call to Action Section -->
    <AppCTA
      v-if="
        state.callToAction &&
          (state.callToAction.title || state.callToAction.primaryButtonText)
      "
      :title="state.callToAction.title || 'Ready to Get Started?'"
      :description="
        state.callToAction.description ||
          'Now that you understand our process, let us discuss your project and how we can help bring your vision to life.'
      "
      :primary-action="
        state.callToAction.primaryButtonText || 'Start Your Project'
      "
      class="w-full max-w-screen-xl mx-auto mt-20"
      @primary-action="
        navigateTo(state.callToAction.primaryButtonUrl || '/contact')
      "
    />
  </div>
</template>
