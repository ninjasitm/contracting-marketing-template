import {
  getHubspotLeadFormDefinition,
  toLeadFormResponse,
} from '~/server/utils/lead-forms/hubspot';

// Optional HubSpot lead-form adapter: returns the public definition for a configured alias.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store');

  try {
    return await getHubspotLeadFormDefinition({
      formKey: getRouterParam(event, 'formKey'),
      config: useRuntimeConfig(event).leadForms,
      fetch: (url, init) => fetch(url, init),
    });
  } catch (error) {
    const { status, body } = toLeadFormResponse(error);
    setResponseStatus(event, status);
    return body;
  }
});
