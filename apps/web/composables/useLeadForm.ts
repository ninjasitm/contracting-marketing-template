import {
  computed,
  getCurrentScope,
  onScopeDispose,
  reactive,
  readonly,
  ref,
  shallowRef,
  watch,
} from 'vue';
import type { LeadAnswers, LeadField, LeadSubmit, LeadSubmitResult, LeadValue } from '~/types/lead-form';
import { validateLeadAnswers, validateLeadFields } from '~/utils/lead-form';

export interface UseLeadFormOptions {
  fields: () => readonly LeadField[];
  submit: () => LeadSubmit;
}

function copyValue(value: LeadValue): LeadValue {
  return Array.isArray(value) ? [...value] : value;
}

function copyFields(fields: readonly LeadField[]): LeadField[] {
  return fields.map((field) => ({
    name: field.name,
    type: field.type,
    label: field.label,
    ...(field.description !== undefined ? { description: field.description } : {}),
    ...(field.placeholder !== undefined ? { placeholder: field.placeholder } : {}),
    ...(field.required !== undefined ? { required: field.required } : {}),
    ...(field.options !== undefined ? { options: field.options.map((option) => ({ ...option })) } : {}),
    ...(field.defaultValue !== undefined ? { defaultValue: copyValue(field.defaultValue) } : {}),
    ...(field.validation !== undefined ? { validation: { ...field.validation } } : {}),
  }));
}

function makeAnswers(fields: readonly LeadField[]): LeadAnswers {
  const answers = Object.create(null) as LeadAnswers;
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(field, 'defaultValue')) {
      answers[field.name] = copyValue(field.defaultValue!);
    }
  }
  return answers;
}

function makeErrors(): Record<string, string> {
  return Object.create(null) as Record<string, string>;
}

function schemaSignature(fields: readonly LeadField[]): string {
  return JSON.stringify(fields);
}

function validSubmitResult(value: unknown): value is LeadSubmitResult {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  if (!Object.prototype.hasOwnProperty.call(value, 'success') || Reflect.get(value, 'success') !== true) {
    return false;
  }
  return (
    !Object.prototype.hasOwnProperty.call(value, 'message') ||
    typeof Reflect.get(value, 'message') === 'string'
  );
}

/** Throw from a submit callback to show this (user-safe) message instead of the generic one. */
export class LeadSubmitError extends Error {}

const GENERIC_SUBMIT_ERROR = "We couldn't submit your information. Please try again.";

export function useLeadForm(options: UseLeadFormOptions) {
  const initialDefinitions = options.fields();
  validateLeadFields(initialDefinitions);
  const initialFields = copyFields(initialDefinitions);
  const initialSubmit = options.submit();
  if (typeof initialSubmit !== 'function') throw new TypeError('A lead form submit callback is required.');

  const activeFields = shallowRef<readonly LeadField[]>(initialFields);
  const answersState = reactive<LeadAnswers>(makeAnswers(initialFields));
  const publicAnswers = readonly(answersState);
  const errors = ref<Record<string, string>>(makeErrors());
  const pending = ref(false);
  const result = shallowRef<LeadSubmitResult | null>(null);
  const submitError = ref('');
  const currentIndex = ref(0);
  const fields = computed(() => activeFields.value);
  const currentField = computed(() => fields.value[currentIndex.value]);
  const progress = computed(() => fields.value.length === 0 ? 0 : (currentIndex.value + 1) / fields.value.length);
  const canBack = computed(() => currentIndex.value > 0);
  const canNext = computed(() => currentIndex.value < fields.value.length - 1);

  let activeSignature = schemaSignature(initialFields);
  let activeSubmit = initialSubmit;
  let requestVersion = 0;
  let disposed = false;

  function replaceAnswers(nextAnswers: Readonly<LeadAnswers>): void {
    for (const key of Object.keys(answersState)) Reflect.deleteProperty(answersState, key);
    for (const key of Object.keys(nextAnswers)) {
      answersState[key] = copyValue(nextAnswers[key]!);
    }
  }

  function clearErrors(): void {
    errors.value = makeErrors();
  }

  function invalidateAndReset(
    nextFields = activeFields.value,
    nextAnswers: Readonly<LeadAnswers> = makeAnswers(nextFields),
  ): void {
    requestVersion += 1;
    pending.value = false;
    result.value = null;
    submitError.value = '';
    currentIndex.value = 0;
    clearErrors();
    replaceAnswers(nextAnswers);
  }

  const stopWatching = watch(
    [() => options.fields(), () => options.submit()],
    ([nextFields, nextSubmit]) => {
      validateLeadFields(nextFields);
      const nextSnapshot = copyFields(nextFields);
      if (typeof nextSubmit !== 'function') throw new TypeError('A lead form submit callback is required.');
      const nextSignature = schemaSignature(nextSnapshot);
      if (nextSignature === activeSignature && nextSubmit === activeSubmit) return;

      activeFields.value = nextSnapshot;
      activeSignature = nextSignature;
      activeSubmit = nextSubmit;
      invalidateAndReset(nextSnapshot);
    },
    { deep: true, flush: 'sync' },
  );

  function setAnswer(name: string, value: LeadValue): void {
    if (pending.value || result.value || !fields.value.some((field) => field.name === name)) return;
    answersState[name] = copyValue(value);
    if (Object.prototype.hasOwnProperty.call(errors.value, name)) {
      const remaining = makeErrors();
      for (const key of Object.keys(errors.value)) {
        if (key !== name) remaining[key] = errors.value[key]!;
      }
      errors.value = remaining;
    }
    submitError.value = '';
  }

  function next(): boolean {
    if (pending.value || result.value || currentIndex.value >= fields.value.length - 1) return false;
    const field = currentField.value;
    if (!field) return false;
    const validation = validateLeadAnswers(fields.value, answersState, field.name);
    errors.value = validation.errors;
    if (Object.keys(validation.errors).length > 0) return false;
    currentIndex.value += 1;
    submitError.value = '';
    return true;
  }

  function back(): boolean {
    if (pending.value || result.value || currentIndex.value <= 0) return false;
    currentIndex.value -= 1;
    return true;
  }

  async function submitForm(): Promise<boolean> {
    if (pending.value || result.value || disposed) return false;

    const validation = validateLeadAnswers(fields.value, answersState);
    errors.value = validation.errors;
    if (Object.keys(validation.errors).length > 0) {
      const firstInvalidIndex = fields.value.findIndex((field) =>
        Object.prototype.hasOwnProperty.call(validation.errors, field.name),
      );
      currentIndex.value = firstInvalidIndex < 0 ? 0 : firstInvalidIndex;
      return false;
    }

    const snapshot = validation.answers;
    const submit = activeSubmit;
    const version = ++requestVersion;
    pending.value = true;
    submitError.value = '';

    try {
      const submitted = await submit(snapshot);
      if (disposed || version !== requestVersion) return false;
      if (!validSubmitResult(submitted)) throw new TypeError('Invalid lead submit result.');

      result.value = {
        success: true,
        ...(submitted.message !== undefined ? { message: submitted.message } : {}),
      };
      replaceAnswers(makeAnswers(fields.value));
      clearErrors();
      return true;
    } catch (error) {
      if (disposed || version !== requestVersion) return false;
      submitError.value = error instanceof LeadSubmitError ? error.message : GENERIC_SUBMIT_ERROR;
      return false;
    } finally {
      if (!disposed && version === requestVersion) pending.value = false;
    }
  }

  function reset(): void {
    if (disposed) return;
    invalidateAndReset(fields.value);
  }

  function replaceFieldsPreservingCompatibleAnswers(nextFields: readonly LeadField[]): void {
    validateLeadFields(nextFields);
    const nextSnapshot = copyFields(nextFields);
    const previousAnswers = validateLeadAnswers(fields.value, answersState).answers;
    const migrated = makeAnswers(nextSnapshot);

    for (const nextField of nextSnapshot) {
      const previousField = fields.value.find((field) => field.name === nextField.name);
      if (!previousField || previousField.type !== nextField.type ||
        !Object.prototype.hasOwnProperty.call(previousAnswers, nextField.name)) {
        continue;
      }

      const candidate = previousAnswers[nextField.name]!;
      const candidateResult = validateLeadAnswers([nextField], { [nextField.name]: copyValue(candidate) });
      if (Object.keys(candidateResult.errors).length === 0) {
        migrated[nextField.name] = copyValue(candidateResult.answers[nextField.name]!);
      }
    }

    activeFields.value = nextSnapshot;
    activeSignature = schemaSignature(nextSnapshot);
    invalidateAndReset(nextSnapshot, migrated);
  }

  if (getCurrentScope()) {
    onScopeDispose(() => {
      disposed = true;
      requestVersion += 1;
      pending.value = false;
      stopWatching();
    });
  }

  return {
    answers: publicAnswers,
    errors,
    pending,
    result,
    submitError,
    currentIndex,
    progress,
    fields,
    currentField,
    canBack,
    canNext,
    setAnswer,
    next,
    back,
    submitForm,
    reset,
    replaceFieldsPreservingCompatibleAnswers,
  };
}

export type LeadFormState = ReturnType<typeof useLeadForm>;
