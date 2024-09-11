import type { RouteLocationRaw } from 'vue-router';
import { type NuxtApp } from '#app';
import { type AwesomeLayoutPageNavbarMenu } from './utils/types';
import appConfig from './app/content/config.json';
export interface NuxtAwesomeAppConfig {
  /** title name */
  title?: string;
  /** description */
  description?: string;
  /** company name */
  companyName?: string;
  /** naics codes title */
  naicsCodesTitle?: string;
  /** naics codes */
  naicsCodes?: string[];
  /** url */
  url?: string;
  /** address */
  address?: string;
  /** email */
  email?: string;
  /** phone */
  phone?: string;
  /** logo */
  logo?: string;
  /** company info */
  companyInfo: {
    title: string;
    value: string;
  }[];
  /** social links */
  socialLinks?: {
    /** social link name */
    title: string;
    /** social link url */
    url: string;
  }[];
  /** style */
  style?: {
    /** primary color */
    primaryColor?: string;
    /** secondary color */
    secondaryColor?: string;
    /** background color */
    backgroundColor?: string;
    /** text color */
    textColor?: string;
  };
  /** layout config */
  layout?: {
    /** page layout */
    page?: {
      /** navbar */
      navbar?: {
        /** menus in navbar */
        menus?: AwesomeLayoutPageNavbarMenu[];
        links: Record<string, string>;
      };
    };
    /** footer */
    footer?: {
      /** footer year */
      year?: number;
      /** naics codes title */
      naicsCodesTitle?: string;
      /** footer container style */
      containerStyle?: Record<string, string>;
      /** footer company info style */
      companyInfoStyle?: Record<string, string>;
      /** footer style */
      footerStyle?: Record<string, string>;
    };
    /** welcome component page */
    welcome?: {
      title?: string;
      disableInfoReplaceIndexInWelcomePage?: boolean;
      primaryActionButton?: {
        title?: string;
        to?: RouteLocationRaw | ((nuxt: NuxtApp) => RouteLocationRaw);
      };
      secondaryActionButton?: {
        title?: string;
        to?: RouteLocationRaw | ((nuxt: NuxtApp) => RouteLocationRaw);
      };
    };
  };

  /** author config */
  author?: {
    /** author name */
    name?: string;
    /** author links */
    links?: {
      /** author github link */
      github?: string;
      /** author medium link */
      medium?: string;
      /** author website link */
      website?: string;
    };
  };

  /** author config */
  disableInfoReplaceIndexInWelcomePage?: boolean;
}

declare module '@nuxt/schema' {
  interface AppConfigInput {
    config?: NuxtAwesomeAppConfig;
  }
}

export default defineAppConfig({
  config: {
    logo: appConfig.logo,
    title: appConfig.title,
    companyName: appConfig.companyName,
    url: appConfig.url,
    email: appConfig.email,
    phone: appConfig.phone,
    address: appConfig.address,
    description: appConfig.description,
    naicsCodes: appConfig.naicsCodes,
    companyInfo: appConfig.companyInfo,
    socialLinks: appConfig.socialLinks,
    author: {
      name: appConfig.companyName,
    },
    style: appConfig.style || {},
    layout: {
      page: {
        navbar: {
          menus: [
            { type: 'link', title: 'Work', to: { name: 'work' } },
            { type: 'link', title: 'About', to: { name: 'about' } },
            { type: 'link', title: 'Process', to: { name: 'process' } },
          ],
          links: appConfig.navbar.links || {},
        },
      },
      footer: {
        naicsCodesTitle: appConfig.footer?.naicsCodesTitle as string,
        containerStyle: appConfig.footer?.containerStyle || {},
        companyInfoStyle: appConfig.footer?.companyInfoStyle || {},
        footerStyle: appConfig.footer?.footerStyle || {},
        year: new Date().getFullYear(),
      },
      welcome: {
        title: appConfig.title,
        disableInfoReplaceIndexInWelcomePage: true,
      },
    },
  } as NuxtAwesomeAppConfig,
  nuxtIcon: {
    aliases: {},
    class: '',
    size: '1em',
  },
});
