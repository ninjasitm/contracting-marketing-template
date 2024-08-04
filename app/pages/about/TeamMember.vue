<script lang="ts" setup>
import { defineProps, toRefs } from 'vue';
import linkedInImage from '~/assets/images/linkedin.svg';

const props = defineProps<{
  name: string;
  position: string;
  description: string;
  imageSrc: string;
  linkedinUrl: string;
}>();

const { imageSrc, linkedinUrl, name, position, description } = toRefs(props);
</script>

<template>
  <article class="flex flex-col min-w-[240px] w-[310px]">
    <img
      :src="imageSrc"
      :alt="name"
      loading="lazy"
      class="object-contain max-w-full rounded-2xl aspect-[0.86] w-[310px]"
    />
    <div class="flex flex-col mt-6 w-full">
      <div
        class="flex gap-5 justify-between items-center w-full tracking-tight uppercase"
      >
        <h3 class="self-stretch my-auto">{{ name }}</h3>
        <a :href="linkedinUrl" target="_blank" rel="noopener noreferrer">
          <img
            :src="linkedInImage"
            alt="LinkedIn"
            class="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
          />
        </a>
      </div>
      <p
        class="gap-2 self-stretch pt-6 mt-4 w-full tracking-tight uppercase whitespace-nowrap"
      >
        {{ position }}
      </p>
      <p class="mt-4 text-xl font-light leading-8 text-black">
        {{ description }}
      </p>
    </div>
  </article>
</template>
