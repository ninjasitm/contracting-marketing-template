<script lang="ts" setup>
import { toRefs, reactive } from 'vue';

import Collab from './Collab.vue';
import CompanyAddress from './CompanyAddress.vue';
import CompanyInfo from './CompanyInfo.vue';

import type { LinkItem, GenericItem, StyleObject } from '@/utils/types';

const { config } = useconfig();

export type FooterState = {
  address?: string;
  email?: string;
  links?: LinkItem[];
  socialLinks?: LinkItem[];
  items?: GenericItem[];
  naicsCodesTitle?: string;
  naicsCodes?: string[];
  containerStyle?: StyleObject;
  footerStyle?: StyleObject;
  companyInfoStyle?: StyleObject;
};

const state: FooterState = reactive({
  companyName: config.companyName as string,
  address: config.address as string,
  email: config.email as string,
  socialLinks: config.socialLinks as LinkItem[],
  items: config.companyInfo as GenericItem[],
  naicsCodesTitle: config.naicsCodesTitle as string,
  naicsCodes: config.naicsCodes as string[],
  containerStyle: config.footer.containerStyle,
  footerStyle: config.footer.footerStyle,
  companyInfoStyle: config.footer.companyInfoStyle,
});
</script>

<template>
  <footer
    class="flex flex-col border-t border-gray-900/10 dark:border-gray-50/[0.2] w-full justify-center align-center px-4"
    :style="state.containerStyle"
  >
    <Collab class="container max-w-screen-xl mx-auto" />
    <CompanyAddress
      class="container max-w-screen-xl mx-auto mb-12"
      :address="state.address"
      :email="state.email"
      :links="state.links"
      :social-links="state.socialLinks"
      :company-name="state.companyName"
    />
    <CompanyInfo
      class="w-full mx-auto"
      :items="state.items"
      :naics-codes-title="state.naicsCodesTitle"
      :naics-codes="state.naicsCodes"
      :style="state.companyInfoStyle"
    />
  </footer>
</template>
