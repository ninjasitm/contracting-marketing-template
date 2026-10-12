<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import type { LeadAnswers, LeadField, LeadSubmit, LeadSubmitResult } from '~/types/lead-form';
import type { HubspotDefinition, HubspotSubmitBody } from '~/types/hubspot-lead-form';
import { LeadSubmitError } from '~/composables/useLeadForm';
import { validateLeadFields } from '~/utils/lead-form';
import LeadForm from './LeadForm.vue';
import ConversationalForm from './ConversationalForm.vue';
import LeadFormTurnstile from './LeadFormTurnstile.vue';

const props = withDefaults(defineProps<{
  formKey: string;
  variant?: 'form' | 'conversational';
}>(), { variant: 'conversational' });
const emit = defineEmits<{ success: [result: LeadSubmitResult] }>();

const MESSAGES: Record<string, string> = {
  NOT_CONFIGURED: 'This form is not available right now. Please try again later.',
  UNSUPPORTED_FORM: 'This form cannot be displayed. Please contact us another way.',
  INVALID_SUBMISSION: 'Some answers could not be accepted. Please review them and try again.',
  FORM_CHANGED: 'This form was just updated. We kept your answers where we could. Please review them and submit again.',
  VERIFICATION_FAILED: 'We could not verify the security check. Please complete it again and resubmit.',
  UPSTREAM_UNAVAILABLE: 'We could not reach our form service. Your answers are kept; please try again shortly.',
  DELIVERY_UNKNOWN: 'Your submission may have been received, but we could not confirm it. Please do not resubmit right away; contact us to check first.',
  TOKEN_REQUIRED: 'Please complete the security check before submitting.',
};
const FALLBACK = 'Something went wrong. Please try again.';

const definition = shallowRef<HubspotDefinition | null>(null);
const loading = ref(true);
const loadError = ref('');
// Only for the FORM_CHANGED notice: the reload resets the form, which clears its own submit error.
const notice = ref('');
const token = ref('');
const form = ref<InstanceType<typeof LeadForm> | InstanceType<typeof ConversationalForm> | null>(null);
const turnstile = ref<InstanceType<typeof LeadFormTurnstile> | null>(null);
let loadVersion = 0;
const contextVersion = ref(0);
const widgetVersion = ref(0);
let disposed = false;

const endpoint = computed(() => `/api/lead-forms/hubspot/${encodeURIComponent(props.formKey)}`);
const protection = computed(() => {
  const value = definition.value?.protection;
  return value && value.enabled ? value : null;
});

function codeOf(error: unknown): string {
  const e = error as { data?: { code?: string }; response?: { _data?: { code?: string } }; code?: string } | undefined;
  return e?.data?.code ?? e?.response?._data?.code ?? e?.code ?? '';
}

function invalidateContext() {
  contextVersion.value += 1;
  token.value = '';
  notice.value = '';
}

function assertRecord(value: unknown, allowed: readonly string[], required: readonly string[] = []): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value) ||
    ![Object.prototype, null].includes(Object.getPrototypeOf(value)) ||
    Object.keys(value).some((key) => !allowed.includes(key)) ||
    required.some((key) => !Object.prototype.hasOwnProperty.call(value, key))) {
    throw new TypeError('Invalid form definition.');
  }
}

async function fetchDefinition(url: string, formKey: string): Promise<HubspotDefinition> {
  const value = await $fetch<unknown>(url);
  const envelopeKeys = ['formKey', 'schemaRevision', 'fields', 'protection'];
  assertRecord(value, envelopeKeys, envelopeKeys);
  if (value.formKey !== formKey || typeof value.schemaRevision !== 'string' ||
    !/^[A-Za-z0-9_-]{1,128}$/.test(value.schemaRevision) || !Array.isArray(value.fields)) {
    throw new TypeError('Invalid form definition.');
  }
  validateLeadFields(value.fields as LeadField[]);
  for (const field of value.fields) {
    assertRecord(field, ['name', 'type', 'label', 'description', 'placeholder', 'required', 'options', 'defaultValue', 'validation'], ['name', 'type', 'label']);
    if (Array.isArray(field.options)) {
      for (const option of field.options) assertRecord(option, ['label', 'value'], ['label', 'value']);
    }
    if (field.validation !== undefined) assertRecord(field.validation, ['min', 'max', 'minLength', 'maxLength']);
  }
  const policy = value.protection;
  assertRecord(policy, ['enabled', 'siteKey', 'action'], ['enabled']);
  if (policy.enabled === false) {
    assertRecord(policy, ['enabled']);
  } else if (policy.enabled !== true || typeof policy.siteKey !== 'string' ||
    !/^[\x21-\x7e]{1,128}$/.test(policy.siteKey) || typeof policy.action !== 'string' ||
    !/^[A-Za-z0-9_-]{1,32}$/.test(policy.action)) {
    throw new TypeError('Invalid form protection.');
  }
  return value as unknown as HubspotDefinition;
}

async function load() {
  invalidateContext();
  const version = ++loadVersion;
  const url = endpoint.value;
  const formKey = props.formKey;
  loading.value = true;
  loadError.value = '';
  definition.value = null;
  try {
    const value = await fetchDefinition(url, formKey);
    if (!disposed && version === loadVersion) definition.value = value;
  } catch (error) {
    if (!disposed && version === loadVersion) {
      loadError.value = MESSAGES[codeOf(error)] ?? 'We could not load this form. Please try again.';
    }
  } finally {
    if (!disposed && version === loadVersion) loading.value = false;
  }
}

// FORM_CHANGED: refresh the definition in place; the user must submit again themselves.
const submit: LeadSubmit = async (answers: Readonly<LeadAnswers>) => {
  const current = definition.value;
  if (!current) throw new Error('Form not loaded.');
  const version = contextVersion.value;
  const url = endpoint.value;
  const formKey = props.formKey;
  const instance = form.value;
  const widget = turnstile.value;
  const widgetEpoch = widgetVersion.value;
  const active = () => !disposed && contextVersion.value === version && form.value === instance;
  notice.value = '';
  if (protection.value && !token.value) throw new LeadSubmitError(MESSAGES.TOKEN_REQUIRED!);
  const body: HubspotSubmitBody = {
    schemaRevision: current.schemaRevision,
    answers: { ...answers },
    ...(protection.value ? { turnstileToken: token.value } : {}),
  };
  try {
    const response = await $fetch<{ success?: boolean; code?: string }>(url, { method: 'POST', body });
    if (!active()) throw new LeadSubmitError(FALLBACK);
    if (response?.success !== true) throw Object.assign(new Error('rejected'), { code: response?.code });
    return { success: true };
  } catch (error) {
    if (!active()) throw new LeadSubmitError(FALLBACK);
    const code = codeOf(error);
    if (code === 'FORM_CHANGED') {
      try {
        const next = await fetchDefinition(url, formKey);
        if (!active()) throw new LeadSubmitError(FALLBACK);
        instance?.replaceFieldsPreservingCompatibleAnswers(next.fields);
        definition.value = next;
        notice.value = MESSAGES.FORM_CHANGED!;
      } catch {
        throw new LeadSubmitError(MESSAGES.UPSTREAM_UNAVAILABLE!);
      }
    }
    throw new LeadSubmitError(MESSAGES[code] ?? FALLBACK);
  } finally {
    // Turnstile tokens are single-use, so every attempt needs a fresh one.
    if (active() && current.protection.enabled && widgetVersion.value === widgetEpoch) {
      token.value = '';
      widget?.reset();
    }
  }
};

onMounted(load);
watch(() => props.formKey, load, { flush: 'sync' });
watch(() => props.variant, invalidateContext, { flush: 'sync' });
watch(() => JSON.stringify(protection.value), () => {
  token.value = '';
  widgetVersion.value += 1;
}, { flush: 'sync' });
onBeforeUnmount(() => { disposed = true; invalidateContext(); });

const widgetBinding = computed(() => {
  const context = contextVersion.value;
  const epoch = widgetVersion.value;
  const active = () => !disposed && context === contextVersion.value && epoch === widgetVersion.value;
  return {
    key: `${context}-${epoch}`,
    handlers: {
      token: (value: string) => { if (active()) token.value = value; },
      expired: () => { if (active()) token.value = ''; },
      reset: () => { if (active()) token.value = ''; },
    },
  };
});
const successHandler = computed(() => {
  const version = contextVersion.value;
  return (result: LeadSubmitResult) => {
    if (!disposed && version === contextVersion.value) { notice.value = ''; emit('success', result); }
  };
});
</script>

<template>
  <div class="min-w-0">
    <p
      v-if="loading"
      role="status"
      class="text-sm text-muted-foreground"
    >
      Loading form…
    </p>
    <div
      v-else-if="loadError"
      role="alert"
      class="space-y-3"
    >
      <p class="text-sm text-destructive">
        {{ loadError }}
      </p>
      <button
        type="button"
        class="text-sm underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring"
        @click="load"
      >
        Try again
      </button>
    </div>
    <template v-else-if="definition">
      <p
        v-if="notice"
        role="status"
        class="mb-4 text-sm text-muted-foreground"
      >
        {{ notice }}
      </p>
      <component
        :is="variant === 'form' ? LeadForm : ConversationalForm"
        :key="formKey"
        ref="form"
        :fields="definition.fields"
        :submit="submit"
        @success="successHandler"
      >
        <template #before-submit>
          <LeadFormTurnstile
            v-if="protection"
            :key="widgetBinding.key"
            ref="turnstile"
            :site-key="protection.siteKey"
            :action="protection.action"
            v-on="widgetBinding.handlers"
          />
        </template>
        <template
          v-if="$slots.success"
          #success="slotProps"
        >
          <slot
            name="success"
            v-bind="slotProps"
          />
        </template>
      </component>
    </template>
  </div>
</template>
