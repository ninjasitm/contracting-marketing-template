<script lang="ts" setup>
import { toRefs } from 'vue';

const props = defineProps<{
  title: string;
  description: string;
  items: string[];
}>();

const { title, description, items } = toRefs(props);
</script>

<template>
  <div class="flex flex-col w-full md:max-w-[45%] md:flex-[1 0 50%]">
    <hr class="w-full border border-black dark:border-white">
    <div class="flex flex-col w-full max-md:max-w-full">
      <h3
        class="gap-2 self-stretch pt-6 w-full text-4xl max-md:max-w-full"
        v-html="title"
      />
      <p
        class="mt-6 text-xl leading-8 text-black dark:text-white max-md:max-w-full"
        v-html="description"
      />
    </div>
    <ul
      class="mt-5 mb-10 text-xl leading-8 text-black dark:text-white max-md:max-w-full list-disc pl-6"
    >
      <li
        v-for="item in items"
        :key="item"
        class="flex-1 shrink gap-2 pb-1 mt-1 w-full"
      >
        {{ item }}
      </li>
    </ul>
  </div>
</template>
