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
  <section class="flex flex-col min-w-[240px] w-[620px] max-md:max-w-full">
    <div class="flex flex-col w-full max-md:max-w-full">
      <h3
        class="gap-2 self-stretch pt-6 w-full text-4xl max-md:max-w-full"
        v-html="title"
      ></h3>
      <p
        class="mt-6 text-xl leading-8 text-black max-md:max-w-full"
        v-html="description"
      ></p>
    </div>
    <ul class="mt-10 text-xl leading-8 text-black max-md:max-w-full">
      <li
        v-for="item in items"
        :key="item"
        class="flex-1 shrink gap-2 pb-4 mt-4 w-full"
      >
        {{ item }}
      </li>
    </ul>
  </section>
</template>
