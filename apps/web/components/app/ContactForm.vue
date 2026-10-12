<script setup lang="ts">
import { nextTick, ref, useId } from 'vue';
import { useContactForm, type ContactFormState } from '@/composables/useContactForm';
import { z } from 'zod';
import UiInput from '@/components/ui/input/Input.vue';
import UiTextarea from '@/components/ui/textarea/Textarea.vue';
import UiLabel from '@/components/ui/label/Label.vue';
import UiAlert from '@/components/ui/alert/Alert.vue';
import AppButton from './Button.vue';

const props = withDefaults(defineProps<{
  heading?: string;
  description?: string;
  labels?: Partial<Record<'fullName' | 'email' | 'phone' | 'category' | 'message', string>>;
  categories?: string[];
  submitText?: string;
  successText?: string;
  /** Stable instance-owned controller; retain it outside a remountable form's lifetime. */
  state?: ContactFormState;
}>(), {
  heading: '', description: '', submitText: 'Submit',
  successText: 'Thank you for your message! We will get back to you shortly.',
});
const emit = defineEmits<{ success: [] }>();
const id = useId();
const formElement = ref<HTMLFormElement>();
const feedback = ref<HTMLElement>();
const { values, errors, submitting, submitted, submitError } = props.state ?? useContactForm(props.categories?.[0] || '');
// Mirrors the existing Nitro boundary; category is included in the message, not an unsupported API field.
const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500, 'Message including inquiry category must be at most 500 characters'),
});
const fields = ['fullName', 'email', 'phone'] as const;
const defaults = { fullName: 'Name', email: 'Your Email', phone: 'Phone (optional)', category: 'What is your inquiry about?', message: 'Message' };

async function submit() {
  if (submitting.value || submitted.value) return;
  submitError.value = '';
  errors.value = {};
  const message = props.categories?.length ? `${values.category}:\n${values.message}` : values.message;
  const result = schema.safeParse({ fullName: values.fullName, email: values.email, phone: values.phone, message });
  // Validate the user's message independently so a category cannot satisfy its minimum length.
  if (values.message.length < 10) errors.value.message = 'Message must be at least 10 characters';
  if (props.categories?.length && !props.categories.includes(values.category)) errors.value.category = 'Please select a category';
  if (!result.success) for (const issue of result.error.issues) errors.value[String(issue.path[0])] = issue.message;
  if (Object.keys(errors.value).length) {
    await nextTick();
    formElement.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    return;
  }
  if (!result.success) return;
  submitting.value = true;
  try {
    const response = await $fetch<{ success: boolean }>('/api/contact/send-email', { method: 'POST', body: result.data });
    if (response?.success !== true) throw new Error('Unsuccessful submission');
    submitted.value = true;
    // Clear personal data only after confirmed delivery. Errors and dialog dismissal retain it.
    Object.assign(values, { fullName: '', email: '', phone: '', message: '', category: props.categories?.[0] || '' });
    emit('success');
  } catch {
    submitError.value = 'Your message could not be sent. Please try again later.';
  } finally {
    submitting.value = false;
    await nextTick();
    feedback.value?.focus();
  }
}
</script>

<template>
  <div class="w-full space-y-6">
    <div
      v-if="heading || description"
      class="space-y-2"
    >
      <h2
        v-if="heading"
        class="text-2xl font-semibold"
      >
        {{ heading }}
      </h2>
      <p
        v-if="description"
        class="text-muted-foreground"
      >
        {{ description }}
      </p>
    </div>
    <div
      v-if="submitted"
      ref="feedback"
      role="status"
      aria-live="polite"
      tabindex="-1"
    >
      <slot name="success">
        <UiAlert>{{ successText }}</UiAlert>
      </slot>
    </div>
    <form
      v-else
      ref="formElement"
      class="flex flex-col gap-6 w-full"
      novalidate
      :aria-busy="submitting"
      @submit.prevent="submit"
    >
      <p
        :id="`${id}-instructions`"
        class="text-sm text-muted-foreground"
      >
        Name, email and message are required. Message: 10–500 characters including inquiry category.
      </p>
      <fieldset
        :disabled="submitting"
        class="space-y-6"
      >
        <div
          v-for="field in fields"
          :key="field"
          class="space-y-2"
        >
          <UiLabel :for="`${id}-${field}`">
            {{ labels?.[field] || defaults[field] }}
          </UiLabel>
          <UiInput
            :id="`${id}-${field}`"
            v-model="values[field]"
            :name="field"
            :type="field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'"
            :autocomplete="field === 'fullName' ? 'name' : field === 'phone' ? 'tel' : 'email'"
            :required="field !== 'phone'"
            :maxlength="field === 'fullName' ? 50 : undefined"
            :aria-invalid="!!errors[field]"
            :aria-describedby="errors[field] ? `${id}-${field}-error` : `${id}-instructions`"
          />
          <p
            v-if="errors[field]"
            :id="`${id}-${field}-error`"
            class="text-sm text-destructive"
          >
            {{ errors[field] }}
          </p>
        </div>
        <div
          v-if="categories?.length"
          class="space-y-2"
        >
          <UiLabel :for="`${id}-category`">
            {{ labels?.category || defaults.category }}
          </UiLabel>
          <select
            :id="`${id}-category`"
            v-model="values.category"
            name="category"
            required
            :aria-invalid="!!errors.category"
            :aria-describedby="errors.category ? `${id}-category-error` : undefined"
            class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option
              v-for="category in categories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
          <p
            v-if="errors.category"
            :id="`${id}-category-error`"
            class="text-sm text-destructive"
          >
            {{ errors.category }}
          </p>
        </div>
        <div class="space-y-2">
          <UiLabel :for="`${id}-message`">
            {{ labels?.message || defaults.message }}
          </UiLabel>
          <UiTextarea
            :id="`${id}-message`"
            v-model="values.message"
            name="message"
            required
            :rows="5"
            maxlength="500"
            placeholder="Tell us about your project..."
            :aria-invalid="!!errors.message"
            :aria-describedby="errors.message ? `${id}-message-error` : `${id}-instructions`"
          />
          <p
            v-if="errors.message"
            :id="`${id}-message-error`"
            class="text-sm text-destructive"
          >
            {{ errors.message }}
          </p>
        </div>
      </fieldset>
      <div
        v-if="submitError"
        ref="feedback"
        role="alert"
        aria-live="assertive"
        tabindex="-1"
      >
        <UiAlert variant="destructive">
          {{ submitError }}
        </UiAlert>
      </div>
      <AppButton
        type="submit"
        size="lg"
        class="w-full uppercase"
        :disabled="submitting"
      >
        {{ submitting ? 'Submitting...' : submitText }}
      </AppButton>
    </form>
  </div>
</template>
