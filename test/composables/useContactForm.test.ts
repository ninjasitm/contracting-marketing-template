import { describe, it, expect } from 'vitest';
import { useContactForm } from '@/composables/useContactForm';

describe('useContactForm', () => {
  it('owns private draft and request state per instance', () => {
    const first = useContactForm('Quote'); const second = useContactForm('Support');
    first.values.fullName = 'Private draft'; first.submitting.value = true;
    first.errors.value.email = 'Invalid'; first.submitted.value = true;
    expect(second.values.fullName).toBe('');
    expect(second.values.category).toBe('Support');
    expect(second.submitting.value).toBe(false);
    expect(second.submitted.value).toBe(false);
    expect(second.errors.value).toEqual({});
  });
});
