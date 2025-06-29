<script lang="ts" setup>
import { reactive } from 'vue';
import { useForm, Field } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import HubspotForm from '@jagaad/vue-hubspot-form';
import _config from '@content/_pages/contact.json';
import type { BasePageState } from '@/types/types';

// Import shadcn/ui form components
import UiFormItem from '@/components/ui/form/FormItem.vue';
import UiFormLabel from '@/components/ui/form/FormLabel.vue';
import UiFormControl from '@/components/ui/form/FormControl.vue';
import UiFormMessage from '@/components/ui/form/FormMessage.vue';

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

// Form validation schema using Zod
const contactFormSchema = toTypedSchema(z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  category: z.string().min(1, 'Please select a category'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be less than 1000 characters'),
}));

// Form state using vee-validate
const { handleSubmit, isSubmitting } = useForm({
  validationSchema: contactFormSchema,
  initialValues: {
    name: '',
    email: '',
    category: 'General Inquiry',
    message: '',
  },
});

// Form submission state
const formState = reactive({
  isFormSubmitted: false,
});

const onSubmitForm = handleSubmit(async (formValues) => {
  console.log('[ContactForm]: Submitting form with values:', formValues);

  // Here you would typically send the form data to your backend
  // For now, we'll just simulate the submission
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('[ContactForm]: Form submitted successfully');
    formState.isFormSubmitted = true;
  } catch (error) {
    console.error('[ContactForm]: Error submitting form:', error);
    // Handle error (show error message, etc.)
  }
});

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
      <!-- Local Form using shadcn/ui Form Components -->
      <div
        v-else
        class="flex flex-wrap gap-20 mt-0 w-full max-w-screen-sm mx-auto"
      >
        <form
          v-if="!formState.isFormSubmitted"
          class="flex flex-col gap-6 w-full max-md:max-w-full"
          @submit="onSubmitForm"
        >
          <!-- Name Field -->
          <Field
            v-slot="{ componentField, errorMessage }"
            name="name"
          >
            <UiFormItem>
              <UiFormLabel for="name">
                Name
              </UiFormLabel>
              <UiFormControl>
                <UiInput
                  id="name"
                  v-bind="componentField"
                  type="text"
                  placeholder="Your name"
                  :class="errorMessage ? 'border-destructive focus-visible:ring-destructive' : ''"
                />
              </UiFormControl>
              <UiFormMessage />
            </UiFormItem>
          </Field>

          <!-- Email Field -->
          <Field
            v-slot="{ componentField, errorMessage }"
            name="email"
          >
            <UiFormItem>
              <UiFormLabel for="email">
                Your Email
              </UiFormLabel>
              <UiFormControl>
                <UiInput
                  id="email"
                  v-bind="componentField"
                  type="email"
                  placeholder="your.email@example.com"
                  :class="errorMessage ? 'border-destructive focus-visible:ring-destructive' : ''"
                />
              </UiFormControl>
              <UiFormMessage />
            </UiFormItem>
          </Field>

          <!-- Category Field -->
          <Field
            v-slot="{ componentField, errorMessage }"
            name="category"
          >
            <UiFormItem>
              <UiFormLabel for="category">
                What is your inquiry about?
              </UiFormLabel>
              <UiFormControl>
                <select
                  id="category"
                  v-bind="componentField"
                  :class="[
                    'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                    errorMessage ? 'border-destructive focus-visible:ring-destructive' : ''
                  ]"
                >
                  <option
                    v-for="option in state.category"
                    :key="option"
                    :value="option"
                  >
                    {{ option }}
                  </option>
                </select>
              </UiFormControl>
              <UiFormMessage />
            </UiFormItem>
          </Field>

          <!-- Message Field -->
          <Field
            v-slot="{ componentField, errorMessage }"
            name="message"
          >
            <UiFormItem>
              <UiFormLabel for="message">
                Message
              </UiFormLabel>
              <UiFormControl>
                <UiTextarea
                  id="message"
                  v-bind="componentField"
                  placeholder="Tell us about your project..."
                  :class="errorMessage ? 'border-destructive focus-visible:ring-destructive' : ''"
                />
              </UiFormControl>
              <UiFormMessage />
            </UiFormItem>
          </Field>

          <!-- Submit Button -->
          <AppButton
            type="submit"
            class="self-start w-full uppercase"
            variant="default"
            size="lg"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">Submitting...</span>
            <span v-else>Submit</span>
          </AppButton>
        </form>

        <!-- Success Message -->
        <AppCard
          v-else
          class="flex flex-col gap-6 w-full max-w-screen-sm text-center justify-center align-center h-[300px] transition-all transition-fade"
          :style="state.successMessageStyle || {
            backgroundColor: '#D7EFF9',
          }"
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