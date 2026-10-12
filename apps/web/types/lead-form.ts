export type LeadFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'textarea'
  | 'dropdown'
  | 'radio'
  | 'checkbox-group'
  | 'checkbox';

export type LeadValue = string | number | boolean | string[];

export type LeadAnswers = Record<string, LeadValue>;

export interface LeadField {
  name: string;
  type: LeadFieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  defaultValue?: LeadValue;
  validation?: {
    min?: number;
    max?: number;
    /** For checkbox groups, minimum number of selected options; for text, minimum characters. */
    minLength?: number;
    /** For checkbox groups, maximum number of selected options; for text, maximum characters. */
    maxLength?: number;
  };
}

export interface LeadSubmitResult {
  success: true;
  message?: string;
}

export type LeadSubmit = (
  answers: Readonly<LeadAnswers>,
) => Promise<LeadSubmitResult>;

export type LeadSalesSource =
  | { kind: 'generic'; fields: readonly LeadField[]; submit: LeadSubmit }
  | { kind: 'hubspot'; formKey: string };

export interface LeadFormProps {
  fields: readonly LeadField[];
  submit: LeadSubmit;
  submitLabel?: string;
  successMessage?: string;
}
