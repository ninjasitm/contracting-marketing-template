import { z } from 'zod';
import type { LeadAnswers, LeadField, LeadValue } from '~/types/lead-form';

const MAX_FIELDS = 100;
const MAX_OPTIONS = 100;
const MAX_SELECTED_VALUES = 100;
const MAX_TEXT_LENGTH = 4000;
const RESERVED_NAMES = new Set(['__proto__', 'constructor', 'prototype']);
const EMAIL_SCHEMA = z.string().email();

type ValidationErrors = Record<string, string>;

function fail(message: string): never {
  throw new TypeError(`Invalid lead field definition: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOwn(value: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isBoundedStringArray(value: unknown): value is string[] {
  if (!Array.isArray(value) || value.length > MAX_SELECTED_VALUES) return false;
  for (let index = 0; index < value.length; index += 1) {
    if (!hasOwn(value, index) || typeof value[index] !== 'string') return false;
  }
  return true;
}

function safeRecord<T>(): Record<string, T> {
  return Object.create(null) as Record<string, T>;
}

function textLength(value: string): number {
  return Array.from(value).length;
}

function isTextType(type: LeadField['type']): boolean {
  return type === 'text' || type === 'email' || type === 'phone' || type === 'textarea';
}

function isChoiceType(type: LeadField['type']): boolean {
  return type === 'dropdown' || type === 'radio' || type === 'checkbox-group';
}

function validateFieldAnswer(field: LeadField, value: unknown, present: boolean): string | undefined {
  const required = field.required === true;
  const validation = field.validation;

  if (!present) {
    return required ? 'This field is required.' : undefined;
  }

  if (field.type === 'checkbox') {
    if (typeof value !== 'boolean') return 'Choose a valid value.';
    return required && !value ? 'This field is required.' : undefined;
  }

  if (field.type === 'checkbox-group') {
    if (!isBoundedStringArray(value)) return 'Select valid options.';
    const allowedValues = new Set(field.options?.map((option) => option.value) ?? []);
    const selectedValues = new Set<string>();
    for (let index = 0; index < value.length; index += 1) {
      const entry = value[index];
      if (typeof entry !== 'string' || selectedValues.has(entry) || !allowedValues.has(entry)) {
        return 'Select valid options.';
      }
      selectedValues.add(entry);
    }
    if (required && value.length === 0) return 'This field is required.';
    const minSelections = Math.max(required ? 1 : 0, validation?.minLength ?? 0);
    if (value.length > 0 && value.length < minSelections) return 'Select more options.';
    if (value.length > (validation?.maxLength ?? MAX_SELECTED_VALUES)) return 'Select fewer options.';
    return undefined;
  }

  if (field.type === 'number') {
    if (value === '') return required ? 'This field is required.' : undefined;
    if (typeof value !== 'number' || !Number.isFinite(value)) return 'Enter a valid number.';
    if (validation?.min !== undefined && value < validation.min) return 'Enter a larger value.';
    if (validation?.max !== undefined && value > validation.max) return 'Enter a smaller value.';
    return undefined;
  }

  if (isChoiceType(field.type)) {
    if (typeof value !== 'string') return 'Choose a valid option.';
    if (value === '') return required ? 'This field is required.' : undefined;
    if (!field.options?.some((option) => option.value === value)) return 'Choose a valid option.';
    return undefined;
  }

  if (isTextType(field.type)) {
    if (typeof value !== 'string') return 'Enter text for this field.';
    if (required && value.trim().length === 0) return 'This field is required.';
    const length = textLength(value);
    if (length > MAX_TEXT_LENGTH || (validation?.maxLength !== undefined && length > validation.maxLength)) {
      return 'Enter a shorter value.';
    }
    if (validation?.minLength !== undefined && value.length > 0 && length < validation.minLength) {
      return 'Enter a longer value.';
    }
    if (field.type === 'email' && value !== '' && !EMAIL_SCHEMA.safeParse(value).success) {
      return 'Enter a valid email address.';
    }
    return undefined;
  }

  return 'Enter a valid value.';
}

function validateDefault(field: LeadField): void {
  if (!hasOwn(field, 'defaultValue')) return;

  const error = validateFieldAnswer(field, field.defaultValue, true);
  if (error) fail(`invalid default for "${field.name}"`);
}

/** Throws when a field definition is empty, unsafe, unsupported, or inconsistent. */
export function validateLeadFields(fields: readonly LeadField[]): void {
  if (!Array.isArray(fields) || fields.length === 0 || fields.length > MAX_FIELDS) {
    fail('provide between 1 and 100 fields');
  }

  const names = new Set<string>();
  for (const candidate of fields as readonly unknown[]) {
    if (!isRecord(candidate)) fail('each field must be an object');
    const field = candidate as unknown as LeadField;
    if (
      typeof field.name !== 'string' ||
      !/^[A-Za-z][A-Za-z0-9_.-]{0,99}$/.test(field.name) ||
      RESERVED_NAMES.has(field.name)
    ) {
      fail('field names must be safe identifiers');
    }
    if (names.has(field.name)) fail(`duplicate field name "${field.name}"`);
    names.add(field.name);
    if (typeof field.label !== 'string' || field.label.trim().length === 0 || textLength(field.label) > 200) {
      fail(`field "${field.name}" needs a bounded label`);
    }
    if (field.description !== undefined && (typeof field.description !== 'string' || textLength(field.description) > 1000)) {
      fail(`field "${field.name}" has an invalid description`);
    }
    if (field.placeholder !== undefined && (typeof field.placeholder !== 'string' || textLength(field.placeholder) > 500)) {
      fail(`field "${field.name}" has an invalid placeholder`);
    }
    if (field.required !== undefined && typeof field.required !== 'boolean') {
      fail(`field "${field.name}" has an invalid required flag`);
    }

    const supportedType =
      field.type === 'text' || field.type === 'email' || field.type === 'phone' ||
      field.type === 'number' || field.type === 'textarea' || field.type === 'dropdown' ||
      field.type === 'radio' || field.type === 'checkbox-group' || field.type === 'checkbox';
    if (!supportedType) fail(`field "${field.name}" has an unsupported type`);

    if (isChoiceType(field.type)) {
      if (!Array.isArray(field.options) || field.options.length === 0 || field.options.length > MAX_OPTIONS) {
        fail(`choice field "${field.name}" needs between 1 and 100 options`);
      }
      const optionValues = new Set<string>();
      for (const option of field.options) {
        if (
          !isRecord(option) ||
          typeof option.label !== 'string' || option.label.trim().length === 0 || textLength(option.label) > 200 ||
          typeof option.value !== 'string' || option.value.length === 0 || textLength(option.value) > 100 ||
          optionValues.has(option.value)
        ) {
          fail(`choice field "${field.name}" has invalid or duplicate options`);
        }
        optionValues.add(option.value);
      }
    } else if (field.options !== undefined) {
      fail(`non-choice field "${field.name}" cannot have options`);
    }

    if (field.validation !== undefined) {
      if (!isRecord(field.validation)) fail(`field "${field.name}" has invalid constraints`);
      const constraints = field.validation;
      const keys = Object.keys(constraints);
      if (keys.some((key) => !['min', 'max', 'minLength', 'maxLength'].includes(key))) {
        fail(`field "${field.name}" has unknown constraints`);
      }
      if (field.type === 'number') {
        if ('minLength' in constraints || 'maxLength' in constraints) {
          fail(`number field "${field.name}" cannot use length constraints`);
        }
        for (const key of ['min', 'max'] as const) {
          const bound = constraints[key];
          if (bound !== undefined && (typeof bound !== 'number' || !Number.isFinite(bound))) {
            fail(`number field "${field.name}" has an invalid bound`);
          }
        }
        if (constraints.min !== undefined && constraints.max !== undefined && constraints.min > constraints.max) {
          fail(`number field "${field.name}" has inverted bounds`);
        }
      } else if (isTextType(field.type)) {
        if ('min' in constraints || 'max' in constraints) {
          fail(`text field "${field.name}" cannot use numeric constraints`);
        }
        for (const key of ['minLength', 'maxLength'] as const) {
          const bound = constraints[key];
          if (bound !== undefined && (!Number.isInteger(bound) || bound < 0 || bound > MAX_TEXT_LENGTH)) {
            fail(`text field "${field.name}" has an invalid length bound`);
          }
        }
        if (
          constraints.minLength !== undefined && constraints.maxLength !== undefined &&
          constraints.minLength > constraints.maxLength
        ) {
          fail(`text field "${field.name}" has inverted length bounds`);
        }
      } else if (field.type === 'checkbox-group') {
        if ('min' in constraints || 'max' in constraints) {
          fail(`checkbox-group field "${field.name}" cannot use numeric bounds`);
        }
        for (const key of ['minLength', 'maxLength'] as const) {
          const bound = constraints[key];
          if (bound !== undefined && (!Number.isInteger(bound) || bound < 0 || bound > MAX_SELECTED_VALUES)) {
            fail(`checkbox-group field "${field.name}" has an invalid selection bound`);
          }
        }
        if (
          constraints.minLength !== undefined && constraints.maxLength !== undefined &&
          constraints.minLength > constraints.maxLength
        ) {
          fail(`checkbox-group field "${field.name}" has inverted selection bounds`);
        }
        if (constraints.minLength !== undefined && constraints.minLength > (field.options?.length ?? 0)) {
          fail(`checkbox-group field "${field.name}" has an impossible minimum`);
        }
        if (field.required && constraints.maxLength === 0) {
          fail(`required checkbox-group field "${field.name}" has an impossible maximum`);
        }
      } else {
        fail(`field "${field.name}" cannot use these constraints`);
      }
    }

    validateDefault(field);
  }
}

function cloneValue(value: LeadValue): LeadValue {
  return Array.isArray(value) ? [...value] : value;
}

function isLeadValue(value: unknown): value is LeadValue {
  return (
    typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number' ||
    isBoundedStringArray(value)
  );
}

/** Returns a detached answer snapshot and errors; unknown own keys remain errors. */
export function validateLeadAnswers(
  fields: readonly LeadField[],
  answers: Readonly<LeadAnswers>,
  onlyName?: string,
): { answers: LeadAnswers; errors: ValidationErrors } {
  validateLeadFields(fields);
  const selectedField = onlyName === undefined ? undefined : fields.find((field) => field.name === onlyName);
  if (onlyName !== undefined && !selectedField) throw new RangeError('Unknown lead field name.');
  if (!isRecord(answers)) throw new TypeError('Lead answers must be an object.');

  const byName = new Map(fields.map((field) => [field.name, field]));
  const normalized = safeRecord<LeadValue>();
  const errors = safeRecord<string>();

  for (const key of Reflect.ownKeys(answers)) {
    if (typeof key !== 'string') {
      errors.answers = 'Answers contain an unknown field.';
      continue;
    }
    const value = (answers as Record<string, unknown>)[key];
    if (!byName.has(key)) {
      errors[key] = 'Answers contain an unknown field.';
      if (isLeadValue(value)) normalized[key] = cloneValue(value);
      continue;
    }
    if (!isLeadValue(value)) {
      errors[key] = 'Enter a valid value.';
      continue;
    }
    normalized[key] = cloneValue(value);
  }

  for (const field of fields) {
    if (onlyName !== undefined && field.name !== onlyName) continue;
    const present = hasOwn(answers, field.name);
    const error = validateFieldAnswer(
      field,
      present ? (answers as Record<string, unknown>)[field.name] : undefined,
      present,
    );
    if (error) errors[field.name] = error;
  }

  return { answers: normalized, errors };
}
