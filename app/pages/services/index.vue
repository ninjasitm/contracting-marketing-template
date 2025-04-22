<script lang="ts" setup>
import { reactive } from 'vue';
import config from '@@/app/content/_pages/services.json';
import ServiceFeature from '../../../components/services/ServiceFeature.vue';
import type { Service, CallToAction, ServicesPageState } from '@/utils/types';

// Define page metadata
definePageMeta({ layout: 'page' });

// Create reactive state for the page content
const state: ServicesPageState = reactive({
  title: config.title,
  description: config.description,
  services: config.services.map(
    (service: any): Service => ({
      title: service.title,
      icon: service.icon,
      description: service.description,
      features: service.features || [],
    }),
  ),
  callToAction: {
    title: config.callToAction.title,
    description: config.callToAction.description,
    buttonText: config.callToAction.buttonText,
    buttonUrl: config.callToAction.buttonUrl,
  },
});
</script>

<template>
  <div
    class="flex relative flex-col pb-24 w-full md:min-h-[800px] max-md:max-w-full px-2"
  >
    <!-- Page header section -->
    <section class="flex flex-col justify-center pt-40 pb-20 lg:pt-60">
      <h1
        class="text-6xl font-light tracking-tighter text-center text-black uppercase whitespace-nowrap mx-auto max-md:max-w-full max-md:text-4xl"
        v-html="state.title"
      ></h1>
      <div
        class="mt-4 text-lg font-light text-center max-w-[800px] mx-auto max-md:max-w-full"
      >
        <MDC :value="state.description"></MDC>
      </div>
    </section>

    <!-- Services list section -->
    <section
      class="flex flex-col font-light text-black w-full max-w-screen-xl mx-auto mt-10"
    >
      <hr class="w-full border border-black" />
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
    </section>

    <!-- Call to Action section -->
    <section
      class="flex flex-col text-black w-full max-w-screen-xl mx-auto mt-20 p-8 bg-gray-100 rounded-lg"
    >
      <h2
        class="text-3xl font-light tracking-tight text-center"
        v-html="state.callToAction.title"
      ></h2>
      <div class="mt-4 text-lg font-light text-center mx-auto max-w-[800px]">
        <MDC :value="state.callToAction.description"></MDC>
      </div>
      <div class="flex justify-center mt-8">
        <NuxtLink
          :to="state.callToAction.buttonUrl"
          class="px-8 py-3 text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors"
        >
          {{ state.callToAction.buttonText }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
