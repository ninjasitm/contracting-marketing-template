<script lang="ts" setup>
import { reactive } from 'vue';
import ServiceFeature from '../../../components/services/ServiceFeature.vue';
import _config from '@content/_pages/services.json';
import type { Service, BasePageState } from '@/types/types';

export interface ServicesPageState extends BasePageState {
  services?: Service[];
}

// Define page metadata
definePageMeta({ layout: 'page' });

const config = _config as ServicesPageState;

// Create reactive state for the page content
const state: ServicesPageState = reactive({
  hero: config.hero,
  services: config.services as Service[],
  callToAction: config.callToAction,
});
</script>

<template>
  <div class="flex relative flex-col pb-24 w-full md:min-h-[800px] max-md:max-w-full px-2">
    <!-- Hero Section using AppHero -->
    <AppHero
      :title="state.hero?.title"
      :description="state.hero?.description"
      :mode="state.hero?.mode || 'text'"
      :alignment="state.hero?.alignment || 'center'"
      :size="state.hero?.size || 'medium'"
      class="pt-40 pb-20 lg:pt-60"
    />

    <!-- Services list section -->
    <LayoutPageSection class="flex flex-col font-light text-black w-full max-w-screen-xl mx-auto mt-10">
      <hr class="w-full border border-black">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
        <ServiceFeature
          v-for="(service, index) in state.services"
          :key="index"
          :title="service.title"
          :icon-src="service.icon"
          :description="service.description"
          :features="service.features"
        />
      </div>
    </LayoutPageSection>

    <!-- Call to Action section -->
    <AppCTA
      v-if="state.callToAction"
      :title="state.callToAction.title"
      :description="state.callToAction.description"
      :primary-action="state.callToAction.primaryButtonText"
      class="w-full max-w-screen-xl mx-auto mt-20"
      @primary-action="navigateTo(state.callToAction.primaryButtonUrl || '/')"
    />
  </div>
</template>