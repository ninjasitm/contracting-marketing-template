<script lang="ts" setup>
import { toRefs } from 'vue';
// Fix import path - no need to use ~ prefix with public images
const linkedInImage = '/images/linkedin.svg';

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
    />
    <div class="flex flex-col mt-4 w-full">
      <div
        class="flex gap-5 justify-between items-center w-full tracking-tight uppercase"
      >
        <h3 class="self-stretch my-auto text-sm">
          {{ name }}
        </h3>
        <NuxtLink
          v-if="linkedinUrl"
          :to="linkedinUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
        >
          <NuxtImg
            placeholder
            :src="linkedInImage"
            alt="LinkedIn"
            class="object-contain shrink-0 self-stretch my-auto w-14 md:w-8 aspect-square"
          />
        </NuxtLink>
      </div>
      <hr class="w-full border border-black mt-2" />
      <p
        class="gap-2 self-stretch pt-4 mt-1 w-full tracking-tight uppercase whitespace-nowrap text-sm"
      >
        {{ position }}
      </p>
      <p class="mt-4 text-xl font-light leading-8 text-black">
        {{ description }}
      </p>
    </div>
  </article>
</template>
