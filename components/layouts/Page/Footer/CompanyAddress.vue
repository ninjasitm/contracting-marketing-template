<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue';
import { useGetSocialIcon } from '~/composables/use-social-media';

import type { LinkItem } from '~/utils/types';

type CompanyAddressState = {
  currentYear: number;
  address: string | null;
  email: string | null;
  links: LinkItem[];
  socialLinks: LinkItem[];
  companyName: string | null;
};

const currentYear = computed(() => new Date().getFullYear());

const props = defineProps<{
  address: string;
  email: string;
  links: LinkItem[];
  socialLinks: LinkItem[];
  companyName: string;
}>();

const state: CompanyAddressState = reactive({
  currentYear,
  address: null,
  email: null,
  links: [],
  socialLinks: [],
  companyName: null,
});

// Mock data
// function useMockData() {
//   state.address = '1350 College Ave, Bronx, NY, 10456';
//   state.email = 'hello@nitm.co';
//   state.socialLinks = [
//     { title: 'Facebook', icon: 'Facebook', url: '#' },
//     { title: 'Twitter', icon: 'Twitter', url: '#' },
//     { title: 'Instagram', icon: 'Instagram', url: '#' },
//     { title: 'LinkedIn', icon: 'LinkedIn', url: '#' },
//   ];
//   state.links = [
//     { title: 'Work', url: '/work' },
//     { title: 'About', url: '/about' },
//     { title: 'Services', url: '/services' },
//     { title: 'Contact', url: '/contact' },
//   ];
//   state.companyName = 'Ninjas in the Machine Inc';
// }

onMounted(() => {
  state.address = props.address;
  state.email = props.email;
  state.links = props.links;
  state.companyName = props.companyName;
  // useMockData();
});
</script>

<template>
  <section
    class="flex flex-wrap gap-5 justify-between items-start pt-6 mt-10 w-full max-md:max-w-full"
  >
    <div
      class="flex flex-col justify-center font-light text-black dark:text-white min-w-[240px] max-md:max-w-full"
    >
      <address class="text-xl tracking-tight uppercase not-italic">
        {{ state.address }}
      </address>
      <div class="mt-8 divide divide-y divide-black dark:divide-white">
        <a
          :href="`mailto:${state.email}`"
          class="gap-2 pb-4 mt-10 text-3xl lg:text-6xl tracking-tighter uppercase whitespace-nowrap max-md:max-w-full"
        >
          {{ state.email }}
        </a>
        <p class="pt-6 mb-6 mt-4 text-lg">
          © {{ currentYear }} {{ state.companyName }}
        </p>
      </div>
    </div>
    <div class="flex gap-5 items-center">
      <nav
        class="flex flex-col justify-center text-base text-black dark:text-white whitespace-nowrap"
      >
        <NuxtLink
          v-for="(link, index) in state.links"
          :key="index"
          class="mb-6 inline-flex items-center hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          :to="link.to || link.url"
        >
          <NuxtImg
            v-if="link.icon"
            placeholder
            :src="link.icon"
            alt=""
            class="object-contain shrink-0 self-stretch my-auto w-6 aspect-square mr-3"
          />
          <span>{{ link.title }}</span>
        </NuxtLink>
      </nav>
    </div>
    <div class="flex gap-5 items-center">
      <nav
        class="flex justify-center text-base text-black dark:text-white whitespace-nowrap"
      >
        <NuxtLink
          v-for="(link, index) in state.socialLinks"
          :key="index"
          class="inline-flex items-center hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          :to="link.url"
        >
          <NuxtImg
            v-if="link.icon"
            placeholder
            :src="link.icon"
            alt=""
            class="object-contain shrink-0 self-stretch my-auto w-6 aspect-square mr-3"
          />
          <template v-else>
            <span class="sr-only">{{ link.title }}</span>
            <Icon
              :name="useGetSocialIcon(link.title)"
              class="w-5 h-5"
            />
          </template>
        </NuxtLink>
      </nav>
    </div>
  </section>
</template>
