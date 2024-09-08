<script lang="ts" setup>
import { toRefs } from 'vue';
import CompanyInfoItem from './CompanyInfoItem.vue';

import type { GenericItem } from '~/utils/types';

type CompanyInfoProps = {
  items: GenericItem[];
  naicsCodesTitle?: string;
  naicsCodes?: string[];
};

const props = defineProps<CompanyInfoProps>();

const { items, naicsCodesTitle, naicsCodes } = toRefs(props);
</script>

<template>
  <section class="w-full">
    <div class="pb-12 pt-6 container max-w-screen-xl mx-auto">
      <section class="flex flex-wrap p-0 w-full max-md:mt-10 max-md:max-w-full">
        <div
          v-for="(item, index) in items"
          :key="item.label"
          class="flex-[50%] md:flex-[20%] mb-4"
        >
          <CompanyInfoItem
            :key="index"
            :label="item.title"
            :value="item.value"
          />
        </div>
      </section>
      <section class="flex flex-col flex-wrap p-0 w-full max-md:max-w-full">
        <div class="flex flex-col justify-center mt-6 w-full max-md:max-w-full">
          <h3 class="text-sm text-stone-500">
            {{ naicsCodesTitle || 'NAICS' }} Codes
          </h3>
          <p class="mt-2 text-base text-black max-md:max-w-full">
            {{ naicsCodes?.join(', ') }}
          </p>
        </div>
      </section>
    </div>
  </section>
</template>
