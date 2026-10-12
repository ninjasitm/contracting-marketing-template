<script setup lang="ts">
import { computed, ref, useSlots, watch } from 'vue';
import type { LeadSalesSource, LeadSubmitResult } from '~/types/lead-form';
import { validateLeadFields } from '~/utils/lead-form';
import HubspotLeadForm from './HubspotLeadForm.vue';
import LeadForm from './LeadForm.vue';
import ConversationalForm from './ConversationalForm.vue';

const props = defineProps<{
  source: LeadSalesSource;
  variant?: 'form' | 'conversational';
  /** HTTPS HubSpot Meetings link with a path and no query string; never includes visitor details. */
  meetingsUrl?: string;
}>();
const emit = defineEmits<{ 'lead-success': [result: LeadSubmitResult] }>();
const slots = useSlots();

const optedIn = ref(false);
const generation = ref(0);
const sourceSignature = computed(() => {
  try {
    if (props.source?.kind === 'hubspot') return props.source.formKey.trim() ? `hubspot:${props.source.formKey}` : '';
    if (props.source?.kind !== 'generic' || typeof props.source.submit !== 'function') return '';
    validateLeadFields(props.source.fields);
    return `generic:${JSON.stringify(props.source.fields)}`;
  } catch { return ''; }
});
const child = computed(() => props.source?.kind === 'hubspot' ? HubspotLeadForm : props.variant === 'form' ? LeadForm : ConversationalForm);
const childProps = computed(() => props.source.kind === 'hubspot'
  ? { formKey: props.source.formKey, variant: props.variant }
  : { fields: props.source.fields, submit: props.source.submit });
watch([sourceSignature, () => props.source?.kind === 'generic' ? props.source.submit : undefined, () => props.variant, () => props.meetingsUrl], () => {
  generation.value += 1;
  optedIn.value = false;
}, { flush: 'sync' });
const successHandler = computed(() => {
  const current = generation.value;
  return (result: LeadSubmitResult) => {
    if (current !== generation.value || !sourceSignature.value || result?.success !== true) return;
    optedIn.value = false;
    emit('lead-success', result);
  };
});

const embedUrl = computed(() => {
  if (!props.meetingsUrl) return '';
  try {
    const url = new URL(props.meetingsUrl);
    const ok = url.protocol === 'https:' && url.hostname === 'meetings.hubspot.com' && !url.port &&
      !url.username && !url.password && !url.search && !url.hash && url.pathname.length > 1;
    if (!ok) return '';
    url.searchParams.set('embed', 'true');
    return url.toString();
  } catch {
    return '';
  }
});
const canSchedule = computed(() => Boolean(slots.scheduling) || Boolean(embedUrl.value));

</script>

<template>
  <p
    v-if="!sourceSignature"
    role="alert"
  >
    The form configuration is unavailable.
  </p>
  <component
    :is="child"
    v-else
    :key="generation"
    v-bind="childProps"
    @success="successHandler"
  >
    <template #success="{ result, reset }">
      <p class="break-words font-medium">
        {{ result.message || 'Thank you. Your information has been submitted.' }}
      </p>
      <div
        v-if="canSchedule"
        class="space-y-4"
      >
        <button
          v-if="!optedIn"
          type="button"
          class="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          @click="optedIn = true"
        >
          Choose a meeting time
        </button>
        <div v-else>
          <slot
            name="scheduling"
            :result="result"
          >
            <iframe
              :src="embedUrl"
              title="Schedule a meeting"
              loading="lazy"
              referrerpolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              class="h-[640px] w-full rounded-md border border-border"
            />
          </slot>
        </div>
      </div>
      <button
        type="button"
        class="text-sm underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring"
        @click="() => { optedIn = false; reset(); }"
      >
        Start again
      </button>
    </template>
  </component>
</template>
