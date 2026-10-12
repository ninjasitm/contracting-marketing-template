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
const { fields, answers, errors, pending, result, submitError, currentField, currentIndex, canBack, canNext } = state;
const id = useId();
const fieldId = () => `${id}-field-${currentIndex.value}`;
async function focusField() {
  await nextTick();
  if (!mounted || !validBinding.value) return;
  document.getElementById(fieldId())?.focus();
  document.getElementById(`${fieldId()}-0`)?.focus();
}
async function advance() {
  if (!validBinding.value || pending.value || result.value) return;
  if (canNext.value) state.next();
  else await state.submitForm();
  if (submitError.value) {
    await nextTick(); document.getElementById(`${id}-submit-error`)?.focus();
  } else if (!result.value) await focusField();
}
async function back() { if (state.back()) await focusField(); }
function keydown(event: KeyboardEvent) {
  if (event.key !== 'Enter') return;
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.id !== fieldId()) return;
  if (event.isComposing || event.keyCode === 229) { event.preventDefault(); return; }
  if (target.tagName === 'TEXTAREA' && event.shiftKey) return;
  if (target.tagName === 'SELECT' || target.tagName === 'BUTTON' || (target instanceof HTMLInputElement && ['radio', 'checkbox'].includes(target.type))) return;
  if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT') return;
  event.preventDefault();
  // Keep native form submission as the single path for buttons and Enter.
  target.closest('form')?.requestSubmit();
}
async function reset() { if (mounted && validBinding.value) { state.reset(); await focusField(); } }
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
      @submit.prevent="advance"
      @keydown="keydown"
    >
      <div class="space-y-2">
        <p
          :id="`${id}-progress`"
          aria-live="polite"
          class="text-sm text-muted-foreground"
        >
          Question {{ currentIndex + 1 }} of {{ fields.length }}
        </p>
        <progress
          :value="currentIndex + 1"
          :max="fields.length"
          :aria-labelledby="`${id}-progress`"
          class="h-1.5 w-full accent-primary"
        />
      </div>
      <LeadFormField
        v-if="currentField"
        :id="fieldId()"
        :key="currentField.name"
        :field="currentField"
        :value="answers[currentField.name]"
        :error="errors[currentField.name]"
        :disabled="pending"
        @update:value="state.setAnswer(currentField.name, $event)"
      />
      <p
        v-if="currentField?.type === 'textarea'"
        class="text-xs text-muted-foreground"
      >
        Press Enter to continue. Use Shift + Enter for a new line.
      </p>
      <slot
        v-if="!canNext"
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
      <div class="flex flex-wrap items-center gap-3">
        <button
          v-if="canBack"
          type="button"
          :disabled="pending"
          class="min-h-11 rounded-md border border-input px-5 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          @click="back"
        >
          Back
        </button>
        <button
          type="submit"
          :disabled="pending"
          class="min-h-11 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ pending ? 'Submitting…' : canNext ? 'Next' : submitLabel || 'Submit' }}
        </button>
      </div>
      <span
        class="sr-only"
        role="status"
        aria-live="polite"
      >{{ pending ? 'Submitting your information' : '' }}</span>
    </form>
  </div>
</template>
