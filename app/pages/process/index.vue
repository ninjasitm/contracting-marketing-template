<script lang="ts" setup>
import { reactive } from 'vue';
import ProcessSection from './ProcessSection.vue';
definePageMeta({ layout: 'page' });

const state = reactive({
  title: 'Process',
  description:
    'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus maecenas tempus, tellus eget.',
  sections: [
    {
      title: 'Research',
      description:
        'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus maecenas tempus, tellus eget.',
      items: [
        'Curabitur ullamcorper ultricies nisi.',
        'Nam eget dui.',
        'Etiam rhoncus maecenas tempus, tellus eget.',
      ],
    },
    {
      title: 'Design',
      description:
        'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus maecenas tempus, tellus eget.',
      items: [
        'Curabitur ullamcorper ultricies nisi.',
        'Nam eget dui.',
        'Etiam rhoncus maecenas tempus, tellus eget.',
      ],
    },
    {
      title: 'Develop',
      description:
        'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus maecenas tempus, tellus eget.',
      items: [
        'Curabitur ullamcorper ultricies nisi.',
        'Nam eget dui.',
        'Etiam rhoncus maecenas tempus, tellus eget.',
      ],
    },
    {
      title: 'Launch',
      description:
        'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus maecenas tempus, tellus eget.',
      items: [
        'Curabitur ullamcorper ultricies nisi.',
        'Nam eget dui.',
        'Etiam rhoncus maecenas tempus, tellus eget.',
      ],
    },
  ],
});
</script>
<template>
  <section class="flex overflow-hidden flex-col bg-sky-100">
    <h2
      class="self-center mt-40 w-full text-6xl font-light tracking-tighter text-center text-black uppercase whitespace-nowrap max-w-[1320px] max-md:mt-10 max-md:max-w-full max-md:text-4xl"
      v-html="state.title"
    ></h2>
    <p
      class="mt-6 text-xl leading-8 text-black max-md:max-w-full"
      v-html="state.description"
    ></p>
    <div
      class="flex flex-col items-center mt-40 w-full max-md:mt-10 max-md:max-w-full"
    >
      <ProcessSection
        v-for="(section, index) in state.sections"
        :key="index"
        :title="section.title"
        :description="section.description"
        :items="section.items"
      />
    </div>
  </section>
</template>
