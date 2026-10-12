<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue';
import type { LeadFormProps, LeadSubmitResult } from '~/types/lead-form';
import { useLeadForm, type LeadFormState } from '~/composables/useLeadForm';
import LeadFormField from './LeadFormField.vue';

interface Props extends LeadFormProps { state?: LeadFormState }
const props = defineProps<Props>();
const emit = defineEmits<{ success: [result: LeadSubmitResult] }>();
// shortcut: `state` is read once at setup; to swap controllers, change the component `:key`.
const state = props.state ?? useLeadForm({ fields: () => props.fields, submit: () => props.submit });
const initialBinding = props.state;
const validBinding = ref(true);
watch(() => props.state, (value) => { if (value !== initialBinding) validBinding.value = false; }, { flush: 'sync' });
let mounted = true;
onBeforeUnmount(() => { mounted = false; });
const { fields, answers, errors, pending, result, submitError } = state;
const id = useId();
const fieldId = (index: number) => `${id}-field-${index}`;
async function focusField(index: number) {
  await nextTick();
  if (!mounted || !validBinding.value) return;
  document.getElementById(fieldId(index))?.focus();
  document.getElementById(`${fieldId(index)}-0`)?.focus();
}
async function submit() {
  if (!validBinding.value) return;
  await state.submitForm();
  if (submitError.value) {
    await nextTick(); document.getElementById(`${id}-submit-error`)?.focus();
  } else if (!result.value) {
    const index = fields.value.findIndex((field) => errors.value[field.name]);
    if (index >= 0) await focusField(index);
  }
}
async function reset() { if (mounted && validBinding.value) { state.reset(); await focusField(0); } }
function replaceFieldsPreservingCompatibleAnswers(nextFields: LeadFormProps['fields']) {
  if (mounted && validBinding.value) state.replaceFieldsPreservingCompatibleAnswers(nextFields);
}
watch(result, (value) => { if (value && validBinding.value) emit('success', value); });
defineExpose({ state, replaceFieldsPreservingCompatibleAnswers });
</script>

<template>
  <div class="min-w-0 text-foreground">
    <div
      v-if="!validBinding"
      role="alert"
    >
      The form configuration changed. Please reload this form.
    </div>
    <div
      v-else-if="result"
      role="status"
      aria-live="polite"
      class="space-y-4 rounded-lg border border-border bg-muted/30 p-6"
    >
      <slot
        name="success"
        :result="result"
        :reset="reset"
      >
        <p class="break-words font-medium">
          {{ successMessage || result.message || 'Thank you. Your information has been submitted.' }}
        </p>
        <button
          type="button"
          class="text-sm underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring"
          @click="reset"
        >
          Start again
        </button>
      </slot>
    </div>
    <form
      v-else
      novalidate
      class="min-w-0 space-y-6"
      :aria-busy="pending"
      @submit.prevent="submit"
    >
      <LeadFormField
        v-for="(field, index) in fields"
        :id="fieldId(index)"
        :key="field.name"
        :field="field"
        :value="answers[field.name]"
        :error="errors[field.name]"
        :disabled="pending"
        @update:value="state.setAnswer(field.name, $event)"
      />
      <slot
        name="before-submit"
        :state="state"
        :pending="pending"
      />
      <p
        v-if="submitError"
        :id="`${id}-submit-error`"
        role="alert"
        tabindex="-1"
        class="text-sm text-destructive"
      >
        {{ submitError }}
      </p>
      <button
        type="submit"
        :disabled="pending"
        class="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ pending ? 'Submitting…' : submitLabel || 'Submit' }}
      </button>
      <span
        class="sr-only"
        role="status"
        aria-live="polite"
      >{{ pending ? 'Submitting your information' : '' }}</span>
    </form>
  </div>
</template>
