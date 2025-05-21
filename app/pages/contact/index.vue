<script lang="ts" setup>
import { reactive } from 'vue';
import HubspotForm from '@jagaad/vue-hubspot-form';
import config from '@@/content/_pages/contact.json';

// Add missing properties to make TypeScript happy
const enhancedConfig = {
  ...config,
  hubspotFormOptions: config.hubspotFormOptions || {
    portalId: '12345',
    formId: 'abcde-12345',
  },
  successMessage: config.successMessage || {
    iconColor: '#009900',
    title: 'Thank you!',
    description: 'We will get back to you shortly.',
  },
};

definePageMeta({ layout: 'page' });

// Prefix unused ref with underscore to satisfy linter
const state = reactive({
  isValid: false,
  isFormSubmitted: false,
  isLoading: false,
  title: enhancedConfig.title,
  description: enhancedConfig.description,
  sections: config.sections,
  categoryOptions: config.category || [
    'General Inquiry',
    'Start a Project',
    'Request a Quote',
    'Partnership',
    'Other',
  ],
  form: {
    name: '',
    email: '',
    category: 'General Inquiry',
    message: '',
  },
});

const onSubmitForm = (event: Event) => {
  if (
    !state.form.name ||
    !state.form.email ||
    !state.form.category ||
    !state.form.message
  ) {
    state.isValid = false;
    return;
  }
  state.isValid = true;
  state.isLoading = true;
  event.preventDefault();
  console.log(state.form);
  state.isFormSubmitted = true;
  state.isLoading = false;
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
  <div
    class="flex relative flex-col pb-24 w-full md:min-h-[800px] max-md:max-w-full px-4 lg:px-10"
  >
    <section
      class="min-h-[450px] flex flex-col justify-center max-w-screen-xl mx-auto"
    >
      <h2
        class="self-center mt-40 max-w-screen-sm text-6xl font-light tracking-tighter text-center text-black uppercase whitespace-nowrap max-md:mt-10 max-md:max-w-full max-md:text-4xl mx-auto"
        v-html="state.title || 'Contact Us'"
      />
      <p
        class="mt-6 text-xl leading-8 max-w-screen-sm text-center"
        v-html="
          state.description ||
            'We are always ready to talk about your next project. Feel free to contact us.'
        "
      />
    </section>
    <section
      class="flex flex-col max-w-screen-sm font-light text-black w-full mx-auto justify-center align-center"
    >
      <div
        v-if="config.useEmbed"
        class="flex flex-wrap gap-20 mt-0 w-full max-md:mt-10 max-md:max-w-full h-[max-content] mx-auto"
      >
        <HubspotForm
          v-if="config.useHubspotForm && config.hubspotFormOptions"
          :options="config.hubspotFormOptions"
          portal-id="12345"
          form-id="abcde-12345"
          class="w-full"
        />
        <AwesomeAlertBanner
          v-else
          title="No form specified!"
          text="You specified an embedded form but didn't configure a supported one."
        >
          No form specified!
        </AwesomeAlertBanner>
      </div>
      <div
        v-else
        class="flex flex-wrap gap-20 mt-0 w-full max-w-screen-sm mx-auto"
      >
        <form
          v-if="!state.isFormSubmitted"
          class="flex flex-col gap-6 w-full max-md:max-w-full"
          @submit.prevent="onSubmitForm"
        >
          <div class="flex flex-col gap-2">
            <label
              for="name"
              class="text-sm"
            >Name</label>
            <input
              id="name"
              v-model="state.form.name"
              type="text"
              name="name"
              class="p-2 border border-gray-300 rounded"
            >
          </div>
          <div class="flex flex-col gap-2">
            <label
              for="email"
              class="text-sm"
            >Your Email</label>
            <input
              id="email"
              v-model="state.form.email"
              type="email"
              name="_replyto"
              class="p-2 border border-gray-300 rounded"
            >
          </div>
          <div class="flex flex-col gap-2">
            <label
              for="subject"
              class="text-sm"
            >What is your inquiry about?</label>
            <select
              id="subject"
              v-model="state.form.category"
              name="subject"
              class="p-2 border border-gray-300 rounded"
            >
              <option
                v-for="option in state.categoryOptions"
                :key="option"
                :value="option"
              >
                {{ option }}
              </option>
            </select>
          </div>
          <div class="flex flex-col gap-2">
            <label
              for="message"
              class="text-sm"
            >Message</label>
            <textarea
              id="message"
              v-model="state.form.message"
              name="message"
              class="p-2 border border-gray-300 rounded"
            />
          </div>
          <AwesomeButton
            type="submit"
            class="self-start px-4 lg:px-10 py-2 gap-2 text-white rounded-lg w-full uppercase"
            :disabled="state.isLoading || !state.isValid"
          >
            Submit
          </AwesomeButton>
        </form>
        <div
          v-else
          class="flex flex-col gap-6 w-full max-w-screen-sm text-center justify-center align-center h-[300px] transition-all transition-fade rounded-lg"
          :style="
            config.successMessageStyle || {
              backgroundColor: '#D7EFF9',
            }
          "
        >
          <Icon
            name="mdi:thumbs-up"
            size="64"
            class="text-6xl animate-bounce mx-auto text-primary-300"
            :style="{
              color: config.successMessage?.iconColor,
            }"
          />
          <h3 class="text-2xl">
            Thank you for your message!
          </h3>
          <p class="text-lg">
            We will get back to you shortly.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
