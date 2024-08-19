<script lang="ts" setup>
import { defineProps, toRefs } from 'vue';
import linkedInImage from '~/public/images/linkedin.svg';

const props = defineProps<{
  name: string;
  position: string;
  description: string;
  photo: string;
  linkedinUrl?: string;
}>();

const { photo, linkedinUrl, name, position, description } = toRefs(props);
</script>

<template>
  <article class="flex flex-col">
    <div
      :alt="name"
      loading="lazy"
      :style="{
        backgroundImage: `url('${photo}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }"
      class="object-contain max-w-full rounded-2xl aspect-[0.86] hover:scale-105 transition-transform duration-300"
    ></div>
    <div class="flex flex-col mt-6 w-full">
      <div
        class="flex gap-5 justify-between items-center w-full tracking-tight uppercase"
      >
        <h3 class="self-stretch my-auto">{{ name }}</h3>
        <AwesomeButton
          :href="linkedinUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            :src="linkedInImage"
            alt="LinkedIn"
            class="object-contain shrink-0 self-stretch my-auto w-14 md:w-8 aspect-square"
          />
        </AwesomeButton>
      </div>
      <hr class="w-full border border-black mt-4" />
      <p
        class="gap-2 self-stretch pt-6 mt-1 w-full tracking-tight uppercase whitespace-nowrap"
      >
        {{ position }}
      </p>
      <p class="mt-4 text-xl font-light leading-8 text-black">
        {{ description }}
      </p>
    </div>
  </article>
</template>
