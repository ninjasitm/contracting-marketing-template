<script lang="ts" setup>
import { toRefs } from 'vue';
import { splitIntoSentences } from '@/utils/utils';

const props = defineProps<{
  id: string;
  title: string;
  slug: string;
  imageSrc: string;
  description: string;
  client: string;
}>();

const { imageSrc, description, client, string } = toRefs(props);
</script>

<template>
  <NuxtLink
    class="grow shrink h-[330px] min-w-[240px] w-[330px] shadow-sm"
    :to="{
      name: 'work-slug',
      params: { slug: slug },
    }"
  >
    <article class="flex flex-col h-full justify-between">
      <img
        v-if="imageSrc"
        :src="imageSrc"
        :alt="description"
        loading="lazy"
        class="object-contain w-full rounded-2xl aspect-[0.86] hover:scale-105 transition-transform duration-300"
      />
      <span v-else>
        {{ title }}
      </span>
      <div class="flex flex-col mt-6 w-full">
        <p class="text-lg font-light">
          {{ splitIntoSentences(description)[0] }}
        </p>
        <p class="mt-4 text-base tracking-tight uppercase">{{ client }}</p>
      </div>
    </article>
  </NuxtLink>
</template>
