<script lang="ts" setup>
import { toRefs } from 'vue';

const props = defineProps<{
  id: string;
  slug: string;
  imageSrc: string;
  description: string;
  client: string;
}>();

const { imageSrc, description, client } = toRefs(props);
</script>

<template>
  <article class="flex flex-col grow shrink min-w-[240px] w-[330px]">
    <NuxtLink
      :to="{
        name: 'work-slug',
        params: { slug: slug },
      }"
    >
      <img
        :src="imageSrc"
        :alt="description"
        loading="lazy"
        class="object-contain w-full rounded-2xl aspect-[0.86] hover:scale-105 transition-transform duration-300"
      />
    </NuxtLink>
    <div class="flex flex-col mt-6 w-full">
      <p class="text-lg font-light">{{ description }}</p>
      <p class="mt-4 text-base tracking-tight uppercase">{{ client }}</p>
    </div>
  </article>
</template>
