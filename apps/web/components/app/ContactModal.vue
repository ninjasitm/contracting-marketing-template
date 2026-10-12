<script setup lang="ts">
import { computed, watch } from 'vue';
import { useContactForm } from '@/composables/useContactForm';
import { Dialog as UiDialog, DialogContent as UiDialogContent, DialogHeader as UiDialogHeader, DialogTitle as UiDialogTitle, DialogDescription as UiDialogDescription, DialogTrigger as UiDialogTrigger } from '@/components/ui/dialog';
import ContactForm from './ContactForm.vue';
import AppButton from './Button.vue';

const props = withDefaults(defineProps<{
  open?: boolean;
  title?: string;
  description?: string;
  triggerText?: string;
  formProps?: InstanceType<typeof ContactForm>['$props'];
}>(), {
  open: false, title: 'Get in touch', description: 'Send us a message and we will get back to you.', triggerText: 'Contact us',
});
const emit = defineEmits<{ 'update:open': [value: boolean]; close: []; success: [] }>();
const formState = useContactForm(props.formProps?.categories?.[0] || '');
// The request may finish after ContactForm unmounts; emit from the persistent owner.
watch(formState.submitted, submitted => { if (submitted) emit('success'); });
const isOpen = computed({ get: () => props.open, set: (value: boolean) => {
  emit('update:open', value);
  if (!value) emit('close');
} });
</script>

<template>
  <UiDialog v-model:open="isOpen">
    <UiDialogTrigger as-child>
      <slot name="trigger">
        <AppButton type="button">
          {{ triggerText }}
        </AppButton>
      </slot>
    </UiDialogTrigger>
    <!-- Only form state persists; the modal layer must unmount to release Reka's side effects. -->
    <UiDialogContent
      v-if="open"
      class="max-h-[90dvh] overflow-y-auto"
    >
      <UiDialogHeader class="pr-6">
        <UiDialogTitle>{{ title }}</UiDialogTitle>
        <UiDialogDescription>{{ description }}</UiDialogDescription>
      </UiDialogHeader>
      <ContactForm
        v-bind="formProps"
        :state="formState"
      />
    </UiDialogContent>
  </UiDialog>
</template>
