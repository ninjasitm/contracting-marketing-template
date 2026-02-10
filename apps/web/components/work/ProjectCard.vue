<script lang="ts" setup>
import { toRefs } from 'vue';
import { splitIntoSentences } from '~/utils/utils';
const backgrounds = Array.from(
  { length: 5 },
  (_, i) => `/images/demo/project-backgrounds/${i + 1}.png`,
);

const props = defineProps<{
  id: string;
  title: string;
  slug: string;
  imageSrc: string | undefined;
  description: string | undefined;
  client: string | undefined;
}>();

const { imageSrc, description, client } = toRefs(props);
</script>

<template>
  <NuxtLink
    class="shrink h-[450px] min-w-[240px] w-[330px] shadow-sm"
    :to="{
      name: 'work-slug',
      params: { slug: slug },
    }"
  >
    <article class="flex flex-col h-full justify-between overflow-visible">
      <NuxtImg
        placeholder
        :src="
          imageSrc ||
            backgrounds[Math.floor(Math.random() * backgrounds.length)]
        "
        :alt="description"
        loading="lazy"
        class="object-cover w-full h-[350px] rounded-2xl aspect-[0.86] hover:scale-105 transition-transform duration-300 object-top"
      />
      <div class="flex flex-col mt-6 w-full h-[100px]">
        <p class="text-sm font-light text-gray-700 dark:text-gray-300">
          {{ splitIntoSentences(description as string)[0] }}
        </p>
        <p
          class="mt-4 text-base tracking-tight uppercase text-black dark:text-white"
        >
          {{ client }}
        </p>
      </div>
    </article>
  </NuxtLink>
</template>
