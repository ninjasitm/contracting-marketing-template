<script lang="ts" setup>
import { toRefs, reactive } from 'vue';

import type { AppConfig } from '@nuxt/schema';
import { type NuxtAwesomeAppConfig } from '../../../../app.config';
import Collab from './Collab.vue';
import CompanyAddress from './CompanyAddress.vue';
import CompanyInfo from './CompanyInfo.vue';

import type { LinkItem, GenericItem, StyleObject } from '@/utils/types';

const { config } = useAppConfig();

type FooterState = {
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
  links: config?.layout?.page?.navbar?.menus as LinkItem[],
  items: config.companyInfo as GenericItem[],
  naicsCodesTitle: (config.layout?.footer?.naicsCodesTitle ||
    config.naicsCodesTitle) as string,
  naicsCodes: config.naicsCodes as string[],
  containerStyle: config.layout?.footer?.containerStyle || {},
  footerStyle: config.layout?.footer?.footerStyle || {},
  companyInfoStyle: config?.layout?.footer?.companyInfoStyle || {},
});
</script>

<template>
  <footer
    class="flex w-full flex-col border-t border-gray-900/10 dark:border-gray-50/[0.2] w-full justify-center align-center"
    :style="state.containerStyle"
  >
    <Collab class="container max-w-screen-xl mx-auto px-6" />
    <CompanyAddress
      class="container max-w-screen-xl mx-auto mb-12 px-6"
      :address="state.address"
      :email="state.email"
      :links="state.links"
      :social-links="state.socialLinks"
      :company-name="state.companyName"
    />
    <CompanyInfo
      class="w-full mx-auto px-6"
      :items="state.items"
      :naics-codes-title="state.naicsCodesTitle"
      :naics-codes="state.naicsCodes"
      :style="state.companyInfoStyle"
    />
  </footer>
</template>
