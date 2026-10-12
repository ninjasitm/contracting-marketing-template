import { describe, expect, it } from 'vitest';
import type { LeadAnswers, LeadField } from '@/types/lead-form';
import { validateLeadAnswers, validateLeadFields } from '@/utils/lead-form';

const fields: LeadField[] = [
  { name: 'email', type: 'email', label: 'Email', required: true },
  {
    name: 'quantity',
    type: 'number',
    label: 'Quantity',
    defaultValue: 0,
    validation: { min: 0 },
  },
  {
    name: 'interests',
    type: 'checkbox-group',
    label: 'Interests',
    options: [
      { label: 'Repair', value: 'repair' },
      { label: 'Installation', value: 'install' },
    ],
  },
  { name: 'terms', type: 'checkbox', label: 'Terms', required: true },
];

describe('validateLeadFields', () => {
  it('accepts the supported generic field types and valid constraints', () => {
    const supported: LeadField[] = [
      { name: 'text', type: 'text', label: 'Text', validation: { maxLength: 20 } },
      { name: 'email', type: 'email', label: 'Email' },
      { name: 'phone', type: 'phone', label: 'Phone' },
      { name: 'number', type: 'number', label: 'Number', validation: { min: 0, max: 10 } },
      { name: 'textarea', type: 'textarea', label: 'Message', validation: { minLength: 2 } },
      { name: 'dropdown', type: 'dropdown', label: 'Select', options: [{ label: 'One', value: 'one' }] },
      { name: 'radio', type: 'radio', label: 'Radio', options: [{ label: 'One', value: 'one' }] },
      { name: 'group', type: 'checkbox-group', label: 'Group', options: [{ label: 'One', value: 'one' }] },
      { name: 'checkbox', type: 'checkbox', label: 'Checkbox' },
    ];

    expect(() => validateLeadFields(supported)).not.toThrow();
    expect(() => validateLeadFields([fields[0]!, fields[0]!])).toThrow();
    expect(() => validateLeadFields([{ ...fields[0]!, name: 'constructor' }])).toThrow();
    expect(() => validateLeadFields([{ ...fields[0]!, name: '__proto__' }])).toThrow();
    expect(() => validateLeadFields([{ ...fields[0]!, type: 'unknown' as LeadField['type'] }])).toThrow();
    expect(() => validateLeadFields([{ ...fields[0]!, options: [{ label: 'A', value: 'a' }] }])).toThrow();
    expect(() => validateLeadFields([{ ...fields[2]!, options: [{ label: 'A', value: 'a' }, { label: 'Again', value: 'a' }] }])).toThrow();
    expect(() => validateLeadFields([{ ...fields[1]!, validation: { min: 2, max: 1 } }])).toThrow();
    expect(() => validateLeadFields([{ ...fields[0]!, validation: { min: 1 } }])).toThrow();
  });

  it('uses checkbox-group length bounds for integer selection counts', () => {
    const group: LeadField = {
      name: 'interests',
      type: 'checkbox-group',
      label: 'Interests',
      options: [
        { label: 'Repair', value: 'repair' },
        { label: 'Install', value: 'install' },
        { label: 'Inspect', value: 'inspect' },
      ],
      validation: { minLength: 2, maxLength: 2 },
    };

    expect(() => validateLeadFields([group])).not.toThrow();
    expect(() => validateLeadFields([{ ...group, validation: { minLength: 1.5 } }])).toThrow();
    expect(() => validateLeadFields([{ ...group, validation: { minLength: -1 } }])).toThrow();
    expect(() => validateLeadFields([{ ...group, validation: { maxLength: 101 } }])).toThrow();
    expect(() => validateLeadFields([{ ...group, validation: { minLength: 101 } }])).toThrow();
    expect(() => validateLeadFields([{ ...group, validation: { minLength: 3, maxLength: 2 } }])).toThrow();
    expect(() => validateLeadFields([{ ...group, validation: { minLength: 4 } }])).toThrow();
    expect(() => validateLeadFields([{ ...group, validation: { min: 1 } }])).toThrow();
    expect(() => validateLeadFields([{ ...group, required: true, validation: { maxLength: 0 } }])).toThrow();
    expect(() => validateLeadFields([{ ...group, validation: { minLength: 0, maxLength: 0 } }])).not.toThrow();
    expect(() => validateLeadFields([{ ...group, defaultValue: ['repair'] }])).toThrow();
    expect(() => validateLeadFields([{ ...group, validation: { maxLength: 1 }, defaultValue: ['repair', 'install'] }])).toThrow();
  });
});

describe('validateLeadAnswers', () => {
  it('accepts required email, numeric zero, allowed choices, and checked required boolean', () => {
    const sourceInterests = ['repair'];
    const result = validateLeadAnswers(fields, {
      email: 'person@example.com',
      quantity: 0,
      interests: sourceInterests,
      terms: true,
    });

    expect(result.errors).toEqual({});
    expect(result.answers).toEqual({
      email: 'person@example.com',
      quantity: 0,
      interests: ['repair'],
      terms: true,
    });
    expect(result.answers.interests).not.toBe(sourceInterests);
  });

  it('rejects unsafe answer keys, wrong types, invalid options, and duplicate selections', () => {
    const unsafeAnswers = JSON.parse('{"__proto__":"bad","email":"ok@example.com","terms":true,"interests":["unknown"],"quantity":"3","extra":"value"}') as Record<string, unknown>;
    const result = validateLeadAnswers(fields, unsafeAnswers as unknown as LeadAnswers);

    expect(Object.hasOwn(result.errors, '__proto__')).toBe(true);
    expect(result.errors.extra).toBeDefined();
    expect(result.errors.quantity).toBeDefined();
    expect(result.errors.interests).toBeDefined();
    expect(Object.getPrototypeOf(result.errors)).toBeNull();
    expect(() => validateLeadFields([{ ...fields[0]!, name: 'prototype' }])).toThrow();
    expect(validateLeadAnswers(fields, { ...unsafeAnswers, interests: ['repair', 'repair'] } as unknown as LeadAnswers).errors.interests).toBeDefined();
  });

  it('distinguishes optional empty email from required, whitespace-only, and malformed email', () => {
    const optionalEmail: LeadField[] = [{ name: 'email', type: 'email', label: 'Email' }];

    expect(validateLeadAnswers(optionalEmail, { email: '' }).errors).toEqual({});
    expect(validateLeadAnswers(fields, { email: '   ', terms: true }).errors.email).toBeDefined();
    expect(validateLeadAnswers(fields, { email: 'bad-email', terms: true }).errors.email).toBeDefined();
    expect(validateLeadAnswers(fields, { terms: true }).errors.email).toBeDefined();
    expect(validateLeadAnswers(fields, { email: 'person@example.com', terms: false }).errors.terms).toBeDefined();
  });

  it('treats blank numbers as blank, keeps zero valid, and clones selected arrays', () => {
    const source = ['repair'];
    const valid = validateLeadAnswers(fields, {
      email: 'person@example.com',
      quantity: 0,
      interests: source,
      terms: true,
    });
    const blank = validateLeadAnswers(fields, {
      email: 'person@example.com',
      quantity: '',
      terms: true,
    });

    expect(valid.errors).toEqual({});
    expect(valid.answers.interests).not.toBe(source);
    source.push('install');
    expect(valid.answers.interests).toEqual(['repair']);
    expect(blank.errors.quantity).toBeUndefined();
    expect(validateLeadAnswers(fields, { email: 'person@example.com', quantity: Number.NaN, terms: true }).errors.quantity).toBeDefined();
  });

  it('validates only the selected field while accepting other known draft keys', () => {
    const result = validateLeadAnswers(fields, { quantity: 'in progress', extra: 'no' } as unknown as LeadAnswers, 'email');

    expect(result.errors.email).toBeDefined();
    expect(result.errors.extra).toBeDefined();
    expect(result.errors.quantity).toBeUndefined();
  });

  it('applies checkbox-group selection bounds while allowing optional empty answers', () => {
    const optionalGroup: LeadField = {
      name: 'interests',
      type: 'checkbox-group',
      label: 'Interests',
      options: [
        { label: 'Repair', value: 'repair' },
        { label: 'Install', value: 'install' },
        { label: 'Inspect', value: 'inspect' },
      ],
      validation: { minLength: 2, maxLength: 2 },
    };
    const requiredGroup = { ...optionalGroup, required: true, validation: { minLength: 0, maxLength: 2 } };

    expect(validateLeadAnswers([optionalGroup], {}).errors).toEqual({});
    expect(validateLeadAnswers([optionalGroup], { interests: [] }).errors).toEqual({});
    expect(validateLeadAnswers([optionalGroup], { interests: ['repair'] }).errors.interests).toBeDefined();
    expect(validateLeadAnswers([optionalGroup], { interests: ['repair', 'install'] }).errors).toEqual({});
    expect(validateLeadAnswers([optionalGroup], { interests: ['repair', 'install', 'inspect'] }).errors.interests).toBeDefined();
    expect(validateLeadAnswers([requiredGroup], {}).errors.interests).toBeDefined();
    expect(validateLeadAnswers([requiredGroup], { interests: [] }).errors.interests).toBeDefined();
    expect(validateLeadAnswers([requiredGroup], { interests: ['repair'] }).errors.interests).toBeUndefined();
  });

  it('rejects sparse checkbox selections in required, optional, default, and unknown answers', () => {
    const sparse = new Array<string>(1);
    const optionalGroup: LeadField = {
      name: 'interests',
      type: 'checkbox-group',
      label: 'Interests',
      options: [{ label: 'Repair', value: 'repair' }],
    };
    const requiredGroup = { ...optionalGroup, required: true };
    const requiredResult = validateLeadAnswers([requiredGroup], { interests: sparse });
    const optionalResult = validateLeadAnswers([optionalGroup], { interests: sparse });
    const unknownResult = validateLeadAnswers([optionalGroup], { extra: sparse } as unknown as LeadAnswers);
    const oversizedResult = validateLeadAnswers([optionalGroup], {
      interests: Array.from({ length: 101 }, () => 'repair'),
    });

    expect(requiredResult.errors.interests).toBeDefined();
    expect(Object.hasOwn(requiredResult.answers, 'interests')).toBe(false);
    expect(optionalResult.errors.interests).toBeDefined();
    expect(Object.hasOwn(optionalResult.answers, 'interests')).toBe(false);
    expect(unknownResult.errors.extra).toBeDefined();
    expect(Object.hasOwn(unknownResult.answers, 'extra')).toBe(false);
    expect(oversizedResult.errors.interests).toBeDefined();
    expect(Object.hasOwn(oversizedResult.answers, 'interests')).toBe(false);
    expect(() => validateLeadFields([{ ...optionalGroup, defaultValue: sparse }])).toThrow();
  });
});
