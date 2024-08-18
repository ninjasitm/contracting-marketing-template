<script lang="ts" setup>
import { toRefs, defineProps } from 'vue';

import Collab from './Collab.vue';
import CompanyAddress from './CompanyAddress.vue';
import CompanyInfo from './CompanyInfo.vue';

import type { LinkItem, GenericItem } from '~/utils/types';

const props = defineProps<{
  address?: string;
  email?: string;
  links?: LinkItem[];
  socialLinks?: LinkItem[];
  companyName: string;
  items?: GenericItem[];
  naicsCodesTitle?: string;
  naicsCodes?: string[];
  style?: {
    backgroundColor: string;
  };
  companyInfoStyle?: {
    backgroundColor: string;
  };
}>();

const {
  address,
  email,
  links,
  companyName,
  items,
  naicsCodesTitle,
  naicsCodes,
  style,
  socialLinks,
  companyInfoStyle,
} = toRefs(props);
</script>

<template>
  <footer
    class="flex flex-col border-t border-gray-900/10 dark:border-gray-50/[0.2] w-full justify-center align-center px-4"
    :style="style"
  >
    <Collab class="container max-w-screen-xl mx-auto" />
    <CompanyAddress
      class="container max-w-screen-xl mx-auto mb-12"
      :address="address"
      :email="email"
      :links="links"
      :social-links="socialLinks"
      :company-name="companyName"
    />
    <CompanyInfo
      class="w-full mx-auto"
      :items="items"
      :naics-codes-title="naicsCodesTitle"
      :naics-codes="naicsCodes"
      :style="companyInfoStyle"
    />
  </footer>
</template>
