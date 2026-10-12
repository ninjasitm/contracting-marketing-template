import {
  submitHubspotLeadForm,
  toLeadFormResponse,
} from '~/server/utils/lead-forms/hubspot';

// Optional HubSpot lead-form adapter: validates and submits one lead for a configured alias.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store');

  try {
    return await submitHubspotLeadForm({
      formKey: getRouterParam(event, 'formKey'),
      config: useRuntimeConfig(event).leadForms,
      fetch: (url, init) => fetch(url, init),
      request: {
        contentType: getRequestHeader(event, 'content-type'),
        contentLength: getRequestHeader(event, 'content-length'),
        // Lazy, so a disabled or misconfigured adapter never touches the stream.
        get body() {
          return getRequestWebStream(event);
        },
      },
    });
  } catch (error) {
    const { status, body } = toLeadFormResponse(error);
    setResponseStatus(event, status);
    return body;
  }
});
