<script lang="ts" setup>
import { reactive } from 'vue';
import HubspotForm from '@jagaad/vue-hubspot-form';
import _config from '@content/_pages/contact.json';
import _appConfig from '@content/config.json';
import type { BasePageState } from '@/types/types';
import { useSeoConfig } from '@/composables/useSeoConfig';
import AppContactForm from '@/components/app/ContactForm.vue';

export interface ContactPageState extends BasePageState {
  form?: { sendTo?: string; subject?: string; category?: string[]; message?: string };
  sections?: { title: string; items: string[] }[];
  category?: string[];
  useEmbed?: boolean;
  useHubspotForm?: boolean;
  hubspotFormOptions?: { portalId: string; formId: string };
  successMessageStyle?: { backgroundColor: string; textColor: string; iconColor: string };
}
definePageMeta({ layout: 'page' });
const contactConfig = _config as ContactPageState;
const appConfig = _appConfig;
useSeoConfig(contactConfig.seo, contactConfig.hero, appConfig);
const state: ContactPageState = reactive({
  hero: contactConfig.hero,
  sections: contactConfig.sections,
  category: contactConfig.category || ['General Inquiry', 'Start a Project', 'Request a Quote', 'Partnership', 'Other'],
  useEmbed: contactConfig.useEmbed || false,
  hubspotFormOptions: contactConfig.hubspotFormOptions,
  useHubspotForm: contactConfig.useHubspotForm || false,
  successMessageStyle: contactConfig.successMessageStyle,
  callToAction: contactConfig.callToAction,
});
</script>

<template>
  <div class="flex relative flex-col pb-24 w-full md:min-h-[800px] max-md:max-w-full px-4 lg:px-10">
    <AppHero
      :title="state.hero?.title || 'Contact Us'"
      :description="state.hero?.description || 'We are always ready to talk about your next project. Feel free to contact us.'"
      mode="text" alignment="center" size="medium" class="pt-40 pb-20 lg:pt-60"
    />
    <LayoutPageSection class="flex flex-col max-w-screen-sm font-light text-black dark:text-white w-full mx-auto justify-center align-center">
      <div v-if="state.useEmbed" class="flex flex-wrap gap-20 mt-0 w-full max-md:mt-10 max-md:max-w-full h-[max-content] mx-auto">
        <HubspotForm v-if="state.useHubspotForm && state.hubspotFormOptions" :options="state.hubspotFormOptions" portal-id="12345" form-id="abcde-12345" class="w-full" />
        <UiAlert v-else title="No form specified!" text="You specified an embedded form but didn't configure a supported one.">No form specified!</UiAlert>
      </div>
      <div v-else class="flex flex-wrap gap-20 mt-0 w-full max-w-screen-sm mx-auto">
        <AppContactForm :categories="state.category">
          <template #success>
            <AppCard
              class="flex flex-col gap-6 w-full max-w-screen-sm text-center justify-center align-center h-[300px] transition-all transition-fade"
              :style="state.successMessageStyle || { backgroundColor: '#D7EFF9' }"
            >
              <Icon name="mdi:thumbs-up" size="64" class="text-6xl animate-bounce mx-auto text-primary-300" :style="{ color: state.successMessageStyle?.iconColor }" />
              <h3 class="text-2xl">Thank you for your message!</h3>
              <p class="text-lg">We will get back to you shortly.</p>
            </AppCard>
          </template>
        </AppContactForm>
      </div>
    </LayoutPageSection>
  </div>
</template>
