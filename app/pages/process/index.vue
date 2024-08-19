<script lang="ts" setup>
import { reactive } from 'vue';
import ProcessSection from '../../../components/process/ProcessSection.vue';
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
  <div
    class="flex relative flex-col pb-24 w-full md:min-h-[800px] max-md:max-w-full px-4"
  >
    <section
      class="h-[450px] flex flex-col justify-center max-w-screen-xl mx-auto"
    >
      <h2
        class="self-center mt-40 w-full text-6xl font-light tracking-tighter text-center text-black uppercase whitespace-nowrap max-md:mt-10 max-md:max-w-full max-md:text-4xl mx-auto"
        v-html="state.title"
      ></h2>
      <p
        class="mt-6 text-xl leading-8 text-black max-md:max-w-full"
        v-html="state.description"
      ></p>
    </section>
    <section
      class="flex flex-col max-w-full font-light text-black w-full max-w-screen-xl mx-auto"
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
    </section>
  </div>
</template>
../../../components/process/ProcessSection.vue
