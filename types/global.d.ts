// Custom types for the Vue TypeScript compiler

// Declare missing modules
declare module '@nuxt/content/dist' {
  export interface QueryBuilderParams {
    path?: string;
    [key: string]: any;
  }
}

// Declare the config object type with all properties used in components
declare module '@@/content/_pages/contact.json' {
  const config: {
    title: string;
    description: string;
    sections: {
      title: string;
      items: string[];
    }[];
    category: string[];
    useEmbed: boolean;
    useHubspotForm: boolean;
    successMessageStyle: {
      backgroundColor: string;
      textColor: string;
      iconColor: string;
    };
    hubspotFormOptions?: Record<string, any>;
    successMessage?: {
      iconColor?: string;
      title?: string;
      description?: string;
    };
  };
  export default config;
}

// Add types for NavBar properties
declare module '@/app/app.config' {
  interface NuxtAwesomeAppConfig {
    style?: Record<string, string>;
    navbar?: {
      hasBanner?: boolean;
      bannerStyle?: Record<string, string>;
      [key: string]: any;
    };
  }
}
