<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue';

import type { LinkItem } from '~/utils/types';

type CompanyAddressState = {
  currentYear: number;
  address: string | null;
  email: string | null;
  links: LinkItem[];
  companyName: string | null;
};

const currentYear = computed(() => new Date().getFullYear());

const props = defineProps<{
  address: string;
  email: string;
  links: LinkItem[];
  companyName: string;
}>();

const state: CompanyAddressState = reactive({
  currentYear,
  address: null,
  email: null,
  links: [],
  companyName: null,
});

// Mock data
function useMockData() {
  state.address = '1350 College Ave, Bronx, NY, 10456';
  state.email = 'hello@nitm.co';
  state.links = [
    { title: 'Facebook', icon: 'Facebook', url: '#' },
    { title: 'Twitter', icon: 'Twitter', url: '#' },
    { title: 'Instagram', icon: 'Instagram', url: '#' },
    { title: 'LinkedIn', icon: 'LinkedIn', url: '#' },
  ];
  state.companyName = 'Ninjas in the Machine Inc';
}

onMounted(() => {
  state.address = props.address;
  state.email = props.email;
  state.links = props.links;
  state.companyName = props.companyName;
  useMockData();
});
</script>

<template>
  <section
    class="flex flex-wrap gap-5 justify-between items-start pt-6 mt-10 w-full max-md:max-w-full"
  >
    <div
      class="flex flex-col justify-center font-light text-black min-w-[240px] max-md:max-w-full"
    >
      <address class="text-xl tracking-tight uppercase not-italic">
        {{ state.address }}
      </address>
      <div class="mt-8 divide divide-y divide-black">
        <a
          :href="`mailto:${state.email}`"
          class="gap-2 pb-4 mt-10 text-6xl tracking-tighter uppercase whitespace-nowrap max-md:max-w-full max-md:text-4xl"
        >
          {{ state.email }}
        </a>
        <p class="pt-6 mb-6 mt-4 text-lg">
          © {{ currentYear }} {{ state.companyName }}.
        </p>
      </div>
    </div>
    <nav
      class="flex flex-col justify-center text-base text-black whitespace-nowrap"
    >
      <AwesomeLink
        v-for="(link, index) in state.links"
        :key="index"
        :to="link.url"
      >
        <img
          v-if="link.icon"
          :src="link.icon"
          alt=""
          class="object-contain shrink-0 self-stretch my-auto w-6 aspect-square mr-3"
        />
        <span>{{ link.title }}</span>
      </AwesomeLink>
    </nav>
    <div class="flex gap-5 items-center">
      <p>Social media icons go here</p>
    </div>
  </section>
</template>
