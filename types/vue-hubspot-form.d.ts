// A quick type declaration for @jagaad/vue-hubspot-form
declare module '@jagaad/vue-hubspot-form' {
  import type { DefineComponent } from 'vue';

  // Define the component props according to actual usage
  export interface HubspotFormProps {
    portalId: string;
    formId: string;
    options?: Record<string, any>;
  }

  const HubspotForm: DefineComponent<HubspotFormProps>;
  export default HubspotForm;
}
