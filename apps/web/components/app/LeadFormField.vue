<script setup lang="ts">
import { computed } from 'vue';
import type { LeadField, LeadValue } from '~/types/lead-form';

const props = defineProps<{
  field: LeadField;
  value?: LeadValue | readonly string[];
  id: string;
  error?: string;
  disabled?: boolean;
}>();
const emit = defineEmits<{ 'update:value': [value: LeadValue] }>();
const describedBy = computed(() => [props.field.description && `${props.id}-description`, props.error && `${props.id}-error`].filter(Boolean).join(' ') || undefined);
const grouped = computed(() => props.field.type === 'radio' || props.field.type === 'checkbox-group');
const controlClass = 'w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60';
function input(event: Event) {
  const target = event.target as HTMLInputElement;
  if (props.field.type === 'number') {
    // A native incomplete number must remain invalid rather than becoming zero.
    emit('update:value', target.validity.badInput ? 'invalid-number' : target.value === '' ? '' : Number.isFinite(target.valueAsNumber) ? target.valueAsNumber : target.value);
  } else emit('update:value', target.value);
}
function toggle(value: string, event: Event) {
  const selected = Array.isArray(props.value) ? props.value : [];
  emit('update:value', (event.target as HTMLInputElement).checked ? [...selected, value] : selected.filter((entry) => entry !== value));
}
</script>

<template>
  <div class="min-w-0 space-y-2">
    <fieldset
      v-if="grouped"
      :disabled="disabled"
      :aria-describedby="describedBy"
      :aria-invalid="!!error"
      class="min-w-0 space-y-3"
    >
      <legend class="mb-2 text-sm font-medium">
        {{ field.label }}<span
          v-if="field.required"
          aria-hidden="true"
        > *</span><span
          v-if="field.required"
          class="sr-only"
        > (required)</span>
      </legend>
      <label
        v-for="(option, index) in field.options"
        :key="option.value"
        :for="`${id}-${index}`"
        class="flex items-start gap-3 text-sm"
      >
        <input
          :id="`${id}-${index}`"
          :type="field.type === 'radio' ? 'radio' : 'checkbox'"
          :name="id"
          :value="option.value"
          :checked="field.type === 'radio' ? value === option.value : Array.isArray(value) && value.includes(option.value)"
          :required="field.type === 'radio' && field.required"
          :aria-invalid="!!error"
          :aria-describedby="describedBy"
          class="mt-1 accent-primary focus-visible:ring-2 focus-visible:ring-ring"
          @change="field.type === 'radio' ? emit('update:value', option.value) : toggle(option.value, $event)"
        >
        <span class="min-w-0 break-words">{{ option.label }}</span>
      </label>
    </fieldset>
    <label
      v-else-if="field.type === 'checkbox'"
      :for="id"
      class="flex items-start gap-3 text-sm font-medium"
    >
      <input
        :id="id"
        type="checkbox"
        :name="field.name"
        :checked="value === true"
        :required="field.required"
        :disabled="disabled"
        :aria-invalid="!!error"
        :aria-describedby="describedBy"
        class="mt-1 accent-primary focus-visible:ring-2 focus-visible:ring-ring"
        @change="emit('update:value', ($event.target as HTMLInputElement).checked)"
      >
      <span class="min-w-0 break-words">{{ field.label }}<span
        v-if="field.required"
        aria-hidden="true"
      > *</span><span
        v-if="field.required"
        class="sr-only"
      > (required)</span></span>
    </label>
    <template v-else>
      <label
        :for="id"
        class="block text-sm font-medium"
      >{{ field.label }}<span
        v-if="field.required"
        aria-hidden="true"
      > *</span><span
        v-if="field.required"
        class="sr-only"
      > (required)</span></label>
      <textarea
        v-if="field.type === 'textarea'"
        :id="id"
        :name="field.name"
        :value="typeof value === 'string' || typeof value === 'number' ? value : ''"
        :placeholder="field.placeholder"
        :required="field.required"
        :disabled="disabled"
        :aria-invalid="!!error"
        :aria-describedby="describedBy"
        :class="controlClass"
        rows="4"
        @input="input"
      />
      <select
        v-else-if="field.type === 'dropdown'"
        :id="id"
        :name="field.name"
        :value="value ?? ''"
        :required="field.required"
        :disabled="disabled"
        :aria-invalid="!!error"
        :aria-describedby="describedBy"
        :class="controlClass"
        @change="input"
      >
        <option value="">
          {{ field.placeholder || 'Choose an option' }}
        </option>
        <option
          v-for="option in field.options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <input
        v-else
        :id="id"
        :name="field.name"
        :type="field.type === 'phone' ? 'tel' : field.type"
        :value="value ?? ''"
        :placeholder="field.placeholder"
        :required="field.required"
        :disabled="disabled"
        :min="field.type === 'number' ? field.validation?.min : undefined"
        :max="field.type === 'number' ? field.validation?.max : undefined"
        :step="field.type === 'number' ? 'any' : undefined"
        :aria-invalid="!!error"
        :aria-describedby="describedBy"
        :class="controlClass"
        @input="input"
      >
    </template>
    <p
      v-if="field.description"
      :id="`${id}-description`"
      class="break-words text-sm text-muted-foreground"
    >
      {{ field.description }}
    </p>
    <p
      v-if="error"
      :id="`${id}-error`"
      role="alert"
      class="break-words text-sm text-destructive"
    >
      {{ error }}
    </p>
  </div>
</template>
