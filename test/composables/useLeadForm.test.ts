import { effectScope, nextTick, reactive, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import type { LeadField, LeadSubmit } from '@/types/lead-form';
import { LeadSubmitError, useLeadForm } from '@/composables/useLeadForm';

const fields: LeadField[] = [
  { name: 'email', type: 'email', label: 'Email', required: true },
  { name: 'interest', type: 'text', label: 'Interest', required: true },
];

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe('useLeadForm', () => {
  it('validates each step, preserves answers when navigating back, and derives progress from position', async () => {
    const form = useLeadForm({ fields: () => fields, submit: () => vi.fn<LeadSubmit>() });

    expect(form.progress.value).toBe(0.5);
    expect(await form.next()).toBe(false);
    expect(form.errors.value.email).toBeDefined();
    form.setAnswer('email', 'person@example.com');
    expect(await form.next()).toBe(true);
    expect(form.currentIndex.value).toBe(1);
    expect(form.progress.value).toBe(1);
    form.setAnswer('interest', 'repair');
    expect(form.back()).toBe(true);
    expect(form.answers.email).toBe('person@example.com');
    expect(form.currentIndex.value).toBe(0);
  });

  it('deduplicates pending submission and sends an isolated snapshot', async () => {
    const response = deferred<{ success: true }>();
    const submit = vi.fn<LeadSubmit>(() => response.promise);
    const form = useLeadForm({ fields: () => [
      { name: 'email', type: 'email', label: 'Email', required: true },
      { name: 'interests', type: 'checkbox-group', label: 'Interests', options: [{ label: 'Repair', value: 'repair' }] },
    ], submit: () => submit });
    form.setAnswer('email', 'person@example.com');
    form.setAnswer('interests', ['repair']);

    const firstSubmission = form.submitForm();
    const duplicateSubmission = await form.submitForm();
    expect(form.pending.value).toBe(true);
    expect(duplicateSubmission).toBe(false);
    expect(submit).toHaveBeenCalledTimes(1);
    const snapshot = submit.mock.calls[0]![0];
    expect(snapshot).not.toBe(form.answers);
    expect(snapshot.interests).not.toBe(form.answers.interests);
    form.setAnswer('email', 'changed@example.com');
    expect(form.answers.email).toBe('person@example.com');

    response.resolve({ success: true });
    expect(await firstSubmission).toBe(true);
  });

  it('retains draft on callback failure and only clears it after verified success', async () => {
    const submit = vi.fn<LeadSubmit>()
      .mockRejectedValueOnce(new Error('private provider detail'))
      .mockResolvedValueOnce({ success: true, message: 'Received' });
    const form = useLeadForm({ fields: () => fields, submit: () => submit });
    form.setAnswer('email', 'person@example.com');
    form.setAnswer('interest', 'repair');

    expect(await form.submitForm()).toBe(false);
    expect(form.answers.email).toBe('person@example.com');
    expect(form.submitError.value).not.toContain('private provider detail');
    expect(await form.submitForm()).toBe(true);
    expect(form.result.value).toEqual({ success: true, message: 'Received' });
    expect(form.answers.email).toBeUndefined();
    expect(await form.submitForm()).toBe(false);
  });

  it('shows LeadSubmitError messages but never leaks other thrown messages', async () => {
    const submit = vi.fn<LeadSubmit>()
      .mockRejectedValueOnce(new LeadSubmitError('Please check your phone number.'))
      .mockRejectedValueOnce(new Error('private provider detail'));
    const form = useLeadForm({ fields: () => fields, submit: () => submit });
    form.setAnswer('email', 'person@example.com');
    form.setAnswer('interest', 'repair');

    expect(await form.submitForm()).toBe(false);
    expect(form.submitError.value).toBe('Please check your phone number.');
    expect(await form.submitForm()).toBe(false);
    expect(form.submitError.value).toBe("We couldn't submit your information. Please try again.");
  });

  it('rejects malformed success values without clearing the draft', async () => {
    const submit = vi.fn<LeadSubmit>(() => Promise.resolve({ success: false } as never));
    const form = useLeadForm({ fields: () => fields, submit: () => submit });
    form.setAnswer('email', 'person@example.com');
    form.setAnswer('interest', 'repair');

    expect(await form.submitForm()).toBe(false);
    expect(form.result.value).toBeNull();
    expect(form.answers.email).toBe('person@example.com');
    expect(form.submitError.value).toBeTruthy();
  });

  it('keeps instances independent', () => {
    const first = useLeadForm({ fields: () => fields, submit: () => vi.fn<LeadSubmit>() });
    const second = useLeadForm({ fields: () => fields, submit: () => vi.fn<LeadSubmit>() });
    first.setAnswer('email', 'private@example.com');

    expect(second.answers.email).toBeUndefined();
  });

  it('migrates only compatible answers and ignores stale completion after schema replacement', async () => {
    const response = deferred<{ success: true }>();
    const schema = reactive<LeadField[]>([
      { name: 'email', type: 'email', label: 'Email', required: true },
      { name: 'interest', type: 'text', label: 'Interest' },
      { name: 'note', type: 'text', label: 'Note' },
      {
        name: 'topics',
        type: 'checkbox-group',
        label: 'Topics',
        options: [{ label: 'Repair', value: 'repair' }, { label: 'Install', value: 'install' }],
      },
      {
        name: 'services',
        type: 'checkbox-group',
        label: 'Services',
        options: [{ label: 'Repair', value: 'repair' }, { label: 'Install', value: 'install' }],
      },
    ]);
    const submit = vi.fn<LeadSubmit>(() => response.promise);
    const form = useLeadForm({ fields: () => schema, submit: () => submit });
    form.setAnswer('email', 'person@example.com');
    form.setAnswer('interest', 'repair');
    form.setAnswer('note', 'too long');
    form.setAnswer('topics', ['repair']);
    form.setAnswer('services', ['repair']);
    const inFlight = form.submitForm();

    form.replaceFieldsPreservingCompatibleAnswers([
      { name: 'email', type: 'email', label: 'Email', required: true },
      { name: 'interest', type: 'dropdown', label: 'Interest', options: [{ label: 'Install', value: 'install' }], defaultValue: 'install' },
      { name: 'note', type: 'text', label: 'Note', defaultValue: 'new', validation: { maxLength: 3 } },
      {
        name: 'topics',
        type: 'checkbox-group',
        label: 'Topics',
        options: [{ label: 'Install', value: 'install' }],
        defaultValue: ['install'],
      },
      {
        name: 'services',
        type: 'checkbox-group',
        label: 'Services',
        options: [{ label: 'Repair', value: 'repair' }, { label: 'Install', value: 'install' }],
        validation: { minLength: 2, maxLength: 2 },
        defaultValue: ['repair', 'install'],
      },
    ]);
    schema.splice(0, schema.length,
      { name: 'email', type: 'email', label: 'Email', required: true },
      { name: 'interest', type: 'dropdown', label: 'Interest', options: [{ label: 'Install', value: 'install' }], defaultValue: 'install' },
      { name: 'note', type: 'text', label: 'Note', defaultValue: 'new', validation: { maxLength: 3 } },
      {
        name: 'topics',
        type: 'checkbox-group',
        label: 'Topics',
        options: [{ label: 'Install', value: 'install' }],
        defaultValue: ['install'],
      },
      {
        name: 'services',
        type: 'checkbox-group',
        label: 'Services',
        options: [{ label: 'Repair', value: 'repair' }, { label: 'Install', value: 'install' }],
        validation: { minLength: 2, maxLength: 2 },
        defaultValue: ['repair', 'install'],
      },
    );
    await nextTick();

    expect(form.answers.email).toBe('person@example.com');
    expect(form.answers.interest).toBe('install');
    expect(form.answers.note).toBe('new');
    expect(form.answers.topics).toEqual(['install']);
    expect(form.answers.services).toEqual(['repair', 'install']);
    expect(form.result.value).toBeNull();
    response.resolve({ success: true });
    expect(await inFlight).toBe(false);
    expect(form.answers.email).toBe('person@example.com');
    expect(form.result.value).toBeNull();
  });

  it('resets draft and invalidates old work when schema or submit context changes', async () => {
    const firstResponse = deferred<{ success: true }>();
    const secondResponse = deferred<{ success: true }>();
    const schema = reactive<LeadField[]>(fields.map((field) => ({ ...field })));
    const firstSubmit = vi.fn<LeadSubmit>(() => firstResponse.promise);
    const secondSubmit = vi.fn<LeadSubmit>(() => secondResponse.promise);
    const submit = ref<LeadSubmit>(firstSubmit);
    const form = useLeadForm({ fields: () => schema, submit: () => submit.value });
    form.setAnswer('email', 'person@example.com');
    form.setAnswer('interest', 'repair');
    const firstRequest = form.submitForm();

    submit.value = secondSubmit;
    expect(form.pending.value).toBe(false);
    expect(form.answers.email).toBeUndefined();
    firstResponse.resolve({ success: true });
    expect(await firstRequest).toBe(false);

    form.setAnswer('email', 'second@example.com');
    form.setAnswer('interest', 'install');
    const secondRequest = form.submitForm();
    schema[0] = { ...schema[0]!, label: 'Updated email' };
    expect(form.pending.value).toBe(false);
    expect(form.answers.email).toBeUndefined();
    secondResponse.resolve({ success: true });
    expect(await secondRequest).toBe(false);
    expect(form.result.value).toBeNull();
  });

  it('clears to field defaults on success and reset invalidates pending work', async () => {
    const response = deferred<{ success: true }>();
    const form = useLeadForm({
      fields: () => [
        { name: 'quantity', type: 'number', label: 'Quantity', defaultValue: 0 },
        { name: 'message', type: 'text', label: 'Message' },
      ],
      submit: () => vi.fn<LeadSubmit>(() => response.promise),
    });
    form.setAnswer('quantity', 4);
    form.setAnswer('message', 'Keep me until confirmed');
    const request = form.submitForm();
    form.reset();

    expect(form.pending.value).toBe(false);
    expect(form.answers.quantity).toBe(0);
    expect(form.answers.message).toBeUndefined();
    response.resolve({ success: true });
    expect(await request).toBe(false);
    expect(form.result.value).toBeNull();
  });

  it('rejects undefined defaults before copying initial, migrated, or watched schemas', () => {
    const invalidField: LeadField = {
      name: 'quantity',
      type: 'number',
      label: 'Quantity',
      defaultValue: undefined,
    };

    expect(() => useLeadForm({ fields: () => [invalidField], submit: () => vi.fn<LeadSubmit>() })).toThrow();

    const schema = reactive<LeadField[]>([
      { name: 'quantity', type: 'number', label: 'Quantity', defaultValue: 0 },
    ]);
    const form = useLeadForm({ fields: () => schema, submit: () => vi.fn<LeadSubmit>() });
    form.setAnswer('quantity', 4);
    expect(() => form.replaceFieldsPreservingCompatibleAnswers([invalidField])).toThrow();
    expect(form.answers.quantity).toBe(4);

    const messages: string[] = [];
    const warn = vi.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
      messages.push(args.map(String).join(' '));
    });
    const error = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      messages.push(args.map(String).join(' '));
    });
    try {
      expect(() => {
        schema[0]!.defaultValue = undefined;
      }).toThrow('Invalid lead field definition');
      expect(messages.join(' ')).toContain('watcher callback');
      expect(form.answers.quantity).toBe(4);
      expect(form.fields.value[0]?.defaultValue).toBe(0);
    } finally {
      warn.mockRestore();
      error.mockRestore();
    }
  });

  it('invalidates completion on scope disposal', async () => {
    const response = deferred<{ success: true }>();
    const submit = vi.fn<LeadSubmit>(() => response.promise);
    let form!: ReturnType<typeof useLeadForm>;
    const scope = effectScope();
    scope.run(() => {
      form = useLeadForm({ fields: () => fields, submit: () => submit });
      form.setAnswer('email', 'person@example.com');
      form.setAnswer('interest', 'repair');
    });
    const pending = form.submitForm();

    scope.stop();
    response.resolve({ success: true });

    expect(await pending).toBe(false);
    expect(form.result.value).toBeNull();
  });
});
