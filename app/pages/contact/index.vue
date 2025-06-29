<script lang="ts" setup>
import { reactive } from 'vue';
import HubspotForm from '@jagaad/vue-hubspot-form';
import _config from '@content/_pages/contact.json';
import type { BasePageState } from '@/types/types';

export interface ContactPageState extends BasePageState {
  sections?: {
    title: string;
    items: string[];
  }[];
  category?: string[];
  useEmbed?: boolean;
  useHubspotForm?: boolean;
  hubspotFormOptions?: {
    portalId: string;
    formId: string;
  };
  successMessageStyle?: {
    backgroundColor: string;
    textColor: string;
    iconColor: string;
  };
}

definePageMeta({ layout: 'page' });

const config = _config as ContactPageState;

// Removed unused enhancedConfig

// Create reactive state using proper types
const state: ContactPageState = reactive({
  hero: config.hero,
  sections: config.sections,
  category: config.category || [
    'General Inquiry',
    'Start a Project',
    'Request a Quote',
    'Partnership',
    'Other',
  ],
  useEmbed: config.useEmbed || false,
  hubspotFormOptions: config.hubspotFormOptions,
  useHubspotForm: config.useHubspotForm || false,
  successMessageStyle: config.successMessageStyle,
  callToAction: config.callToAction,
});

// Form state
const formState = reactive({
  isValid: false,
  isFormSubmitted: false,
  isLoading: false,
  form: {
    name: '',
    email: '',
    category: 'General Inquiry',
    message: '',
  },
});

const onSubmitForm = (event: Event) => {
  if (
    !formState.form.name ||
    !formState.form.email ||
    !formState.form.category ||
    !formState.form.message
  ) {
    formState.isValid = false;
    return;
  }
  formState.isValid = true;
  formState.isLoading = true;
  event.preventDefault();
  console.log(formState.form);
  formState.isFormSubmitted = true;
  formState.isLoading = false;
};

// watch(embed, (value: HTMLDivElement | undefined): void => {
//   console.log(config);
//   if (!value) return;
//   if (config.useEmbed && config.embed?.length > 0) {
//     // Split a string with multiple scripts in config.embed into an array of scripts
//     // const dom = new DOMParser().parseFromString(
//     //   config.embed.replace(/\\"/g, '"'),
//     //   'text/html',
//     // );
//     // const scripts = dom.querySelectorAll('script');
//     // if (!scripts) return;
//     // console.log(scripts);
//     // for (const script of scripts) {
//     //   embed.value?.appendChild(script);
//     // }
//     const div = document.createElement('div');
//     div.innerHTML = config.embed
//       .replace(/\\"/g, '"')
//       .replace(/<c/g, '<component :is="\'script\'"')
//       .replace(/<\/script>/, '</component>');
//     embed.value?.appendChild(div.firstChild as Node);
//     console.log(embed.value, div.innerHTML);
//   }
// });
</script>
<template>
  <div class="flex relative flex-col pb-24 w-full md:min-h-[800px] max-md:max-w-full px-4 lg:px-10">
    <!-- Hero Section using AppHero -->
    <AppHero
      :title="state.hero?.title || 'Contact Us'"
      :description="state.hero?.description || 'We are always ready to talk about your next project. Feel free to contact us.'"
      mode="text"
      alignment="center"
      size="medium"
      class="pt-40 pb-20 lg:pt-60"
    />

    <!-- Contact Form Section -->
    <LayoutPageSection class="flex flex-col max-w-screen-sm font-light text-black w-full mx-auto justify-center align-center">
      <div
        v-if="state.useEmbed"
        class="flex flex-wrap gap-20 mt-0 w-full max-md:mt-10 max-md:max-w-full h-[max-content] mx-auto"
      >
        <HubspotForm
          v-if="state.useHubspotForm && state.hubspotFormOptions"
          :options="state.hubspotFormOptions"
          portal-id="12345"
          form-id="abcde-12345"
          class="w-full"
        />
        <UiAlert
          v-else
          title="No form specified!"
          text="You specified an embedded form but didn't configure a supported one."
        >
          No form specified!
        </UiAlert>
      </div>
      <div
        v-else
        class="flex flex-wrap gap-20 mt-0 w-full max-w-screen-sm mx-auto"
      >
        <form
          v-if="!formState.isFormSubmitted"
          class="flex flex-col gap-6 w-full max-md:max-w-full"
          @submit.prevent="onSubmitForm"
        >
          <div class="flex flex-col gap-2">
            <UiLabel
              for="name"
              class="text-sm"
            >
              Name
            </UiLabel>
            <UiInput
              id="name"
              v-model="formState.form.name"
              type="text"
              name="name"
              placeholder="Your name"
            />
          </div>
          <div class="flex flex-col gap-2">
            <UiLabel
              for="email"
              class="text-sm"
            >
              Your Email
            </UiLabel>
            <UiInput
              id="email"
              v-model="formState.form.email"
              type="email"
              name="_replyto"
              placeholder="your.email@example.com"
            />
          </div>
          <div class="flex flex-col gap-2">
            <UiLabel
              for="subject"
              class="text-sm"
            >
              What is your inquiry about?
            </UiLabel>
            <select
              id="subject"
              v-model="formState.form.category"
              name="subject"
              class="p-2 border border-gray-300 rounded"
            >
              <option
                v-for="option in state.category"
                :key="option"
                :value="option"
              >
                {{ option }}
              </option>
            </select>
          </div>
          <div class="flex flex-col gap-2">
            <UiLabel
              for="message"
              class="text-sm"
            >
              Message
            </UiLabel>
            <UiTextarea
              id="message"
              v-model="formState.form.message"
              name="message"
              placeholder="Tell us about your project..."
            />
          </div>
          <AppButton
            type="submit"
            class="self-start w-full uppercase"
            variant="default"
            size="lg"
            :disabled="formState.isLoading || !formState.isValid"
          >
            Submit
          </AppButton>
        </form>
        <AppCard
          v-else
          class="flex flex-col gap-6 w-full max-w-screen-sm text-center justify-center align-center h-[300px] transition-all transition-fade"
          :style="state.successMessageStyle || {
            backgroundColor: '#D7EFF9',
          }
          "
        >
          <Icon
            name="mdi:thumbs-up"
            size="64"
            class="text-6xl animate-bounce mx-auto text-primary-300"
            :style="{
              color: state.successMessageStyle?.iconColor,
            }"
          />
          <h3 class="text-2xl">
            Thank you for your message!
          </h3>
          <p class="text-lg">
            We will get back to you shortly.
          </p>
        </AppCard>
      </div>
    </LayoutPageSection>
  </div>
</template>