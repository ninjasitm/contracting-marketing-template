<script setup lang="ts">
import type { LeadField, LeadSubmit } from '@/types/lead-form';

definePageMeta({ layout: 'page' });
useHead({ title: 'Lead form examples' });

const fields: LeadField[] = [
  { name: 'name', type: 'text', label: 'Name', required: true },
  { name: 'email', type: 'email', label: 'Email', required: true },
  { name: 'phone', type: 'phone', label: 'Phone' },
  { name: 'timing', type: 'radio', label: 'Timing', options: [{ label: 'Soon', value: 'soon' }, { label: 'Later', value: 'later' }] },
  { name: 'quantity', type: 'number', label: 'Number of units', defaultValue: 0, validation: { min: 0 } },
  { name: 'service', type: 'dropdown', label: 'Service', required: true, options: [
    { label: 'Repair', value: 'repair' }, { label: 'Installation', value: 'install' },
  ] },
  { name: 'interests', type: 'checkbox-group', label: 'Interests', options: [
    { label: 'Repair', value: 'repair' }, { label: 'Installation', value: 'install' }, { label: 'Maintenance', value: 'maintenance' },
  ] },
  { name: 'details', type: 'textarea', label: 'Project details' },
  { name: 'updates', type: 'checkbox', label: 'Send me occasional updates' },
];

// DEMO / LOCAL-ONLY: no network, nothing is stored or echoed. Production callbacks must throw on unsuccessful persistence.
const demoSubmit: LeadSubmit = () => Promise.resolve({ success: true });
</script>

<template>
  <div class="container mx-auto w-full min-w-0 space-y-12 px-4 pb-12 pt-28">
    <header class="max-w-2xl space-y-3">
      <h1 class="text-3xl font-bold">
        Lead form examples
      </h1>
      <p class="rounded-md border border-border bg-muted/30 p-3 text-sm">
        <strong>Demo only.</strong> These forms use a local stub that always succeeds. No data is sent anywhere or shown back to you.
      </p>
    </header>

    <section class="max-w-xl space-y-4">
      <h2 class="text-xl font-semibold">
        Conventional form
      </h2>
      <AppLeadForm
        :fields="fields"
        :submit="demoSubmit"
        submit-label="Send (demo)"
      />
    </section>

    <section class="max-w-xl space-y-4">
      <h2 class="text-xl font-semibold">
        Conversational form
      </h2>
      <AppConversationalForm
        :fields="fields"
        :submit="demoSubmit"
        submit-label="Send (demo)"
      />
    </section>

    <section class="max-w-xl space-y-4">
      <h2 class="text-xl font-semibold">
        Sales flow with optional scheduling
      </h2>
      <AppHubspotSalesLeadForm
        :source="{ kind: 'generic', fields, submit: demoSubmit }"
        variant="form"
      >
        <template #scheduling>
          <div class="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
            Scheduling placeholder. Embed your own scheduling tool here. Nothing is booked in this demo.
          </div>
        </template>
      </AppHubspotSalesLeadForm>
    </section>

    <section class="max-w-2xl space-y-3">
      <h2 class="text-xl font-semibold">
        HubSpot (opt-in, not rendered here)
      </h2>
      <p class="text-sm text-muted-foreground">
        HubSpot forms call the server API, so they are not shown live. Configure the server first, then render explicitly:
      </p>
      <pre class="overflow-x-auto rounded-md bg-muted p-4 text-xs"><code>&lt;AppHubspotLeadForm form-key="lead" /&gt;</code></pre>
    </section>
  </div>
</template>
