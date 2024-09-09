<script lang="ts" setup>
import { reactive } from 'vue';
import config from '@@/app/content/_pages/contact.json';
definePageMeta({ layout: 'page' });

const state = reactive({
  isFormSubmitted: false,
  isLoading: false,
  embed: config.embed,
  title: config.title,
  description: config.description,
  sections: config.sections,
  categoryOptions: [
    'General Inquiry',
    'Feedback',
    'Support',
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
  state.isLoading = true;
  event.preventDefault();
  console.log(state.form);
  state.isFormSubmitted = true;
  state.isLoading = false;
};
</script>
<template>
  <div
    class="flex relative flex-col pb-24 w-full md:min-h-[800px] max-md:max-w-full px-4"
  >
    <section
      class="h-[450px] flex flex-col justify-center max-w-screen-xl mx-auto"
    >
      <h2
        class="self-center mt-40 max-w-screen-sm text-6xl font-light tracking-tighter text-center text-black uppercase whitespace-nowrap max-md:mt-10 max-md:max-w-full max-md:text-4xl mx-auto"
        v-html="state.title || 'Contact Us'"
      ></h2>
      <p
        class="mt-6 text-xl leading-8 max-w-screen-sm text-center"
        v-html="
          state.description ||
          'We are always ready to talk about your next project. Feel free to contact us.'
        "
      ></p>
    </section>
    <section
      class="flex flex-col max-w-screen-sm font-light text-black w-full max-w-screen-xl mx-auto justify-center align-center"
    >
      <div
        v-if="config.useEmbed"
        class="flex flex-wrap gap-20 mt-10 w-full max-md:mt-10 max-md:max-w-full"
        v-html="state.embed"
      ></div>
      <div
        v-else
        class="flex flex-wrap gap-20 mt-10 w-full mt-10 max-w-screen-sm mx-auto"
      >
        <form
          v-if="!state.isFormSubmitted"
          class="flex flex-col gap-6 w-full max-md:max-w-full"
          @submit.prevent="onSubmitForm"
        >
          <div class="flex flex-col gap-2">
            <label for="name" class="text-sm">Name</label>
            <input
              id="name"
              v-model="state.form.name"
              type="text"
              name="name"
              class="p-2 border border-gray-300 rounded"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="email" class="text-sm">Your Email</label>
            <input
              id="email"
              v-model="state.form.email"
              type="email"
              name="_replyto"
              class="p-2 border border-gray-300 rounded"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="subject" class="text-sm"
              >What is your inquiry about?</label
            >
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
            <label for="message" class="text-sm">Message</label>
            <textarea
              id="message"
              v-model="state.form.message"
              name="message"
              class="p-2 border border-gray-300 rounded"
            ></textarea>
          </div>
          <button
            type="submit"
            class="self-start px-4 py-2 text-white bg-black rounded"
          >
            Submit
          </button>
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
          <h3 class="text-2xl">Thank you for your message!</h3>
          <p class="text-lg">We will get back to you shortly.</p>
        </div>
      </div>
    </section>
  </div>
</template>
