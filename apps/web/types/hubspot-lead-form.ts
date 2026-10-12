import type { LeadAnswers, LeadField } from '~/types/lead-form';

/**
 * Public contract of the optional HubSpot lead-form adapter.
 * Private bindings (portal/form IDs, objectTypeIds, hidden defaults, tokens) live only in
 * `server/utils/lead-forms/hubspot.ts` and never appear in these types.
 */

/** Reserved: the initial adapter supports legal consent type NONE only and never returns this. */
export interface HubspotConsentDefinition {
  required: boolean;
  consentToProcessText: string;
  communications: readonly {
    key: string; // Stable server-issued choice key, not a subscription ID.
    required: boolean;
    text: string;
  }[];
}

/** Reserved with {@link HubspotConsentDefinition}; the server rejects any submitted `consent`. */
export interface HubspotConsentAnswers {
  consentToProcess: boolean;
  communications: Record<string, boolean>;
}

export interface HubspotDefinition {
  formKey: string;
  schemaRevision: string;
  fields: readonly LeadField[];
  consent?: HubspotConsentDefinition;
  protection:
    | { enabled: false }
    | { enabled: true; siteKey: string; action?: string };
}

export interface HubspotSubmitBody {
  schemaRevision: string;
  answers: LeadAnswers;
  consent?: HubspotConsentAnswers;
  turnstileToken?: string;
}

/** Stable, sanitized failure codes. Error responses carry exactly `{ code }`. */
export type HubspotLeadFormErrorCode =
  | 'NOT_CONFIGURED'
  | 'FORM_CHANGED'
  | 'UNSUPPORTED_FORM'
  | 'INVALID_SUBMISSION'
  | 'VERIFICATION_FAILED'
  | 'UPSTREAM_UNAVAILABLE'
  | 'DELIVERY_UNKNOWN';

export interface HubspotLeadFormErrorBody {
  code: HubspotLeadFormErrorCode;
}
