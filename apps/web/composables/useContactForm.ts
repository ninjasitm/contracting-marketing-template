import { reactive, ref } from 'vue';

/** Instance-owned state; pass to a remountable ContactForm to retain drafts and pending results. */
export function useContactForm(category = '') {
  return {
    values: reactive({ fullName: '', email: '', phone: '', message: '', category }),
    errors: ref<Record<string, string>>({}),
    submitting: ref(false),
    submitted: ref(false),
    submitError: ref(''),
  };
}

export type ContactFormState = ReturnType<typeof useContactForm>;
