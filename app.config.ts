import type { RouteLocationRaw } from 'vue-router';
import type { NuxtApp } from '#app';
import type { LayoutPageNavbarMenu } from './utils/types';
import _config from './content/config.json';

// Define app config for Nuxt 3
export interface NuxtAppConfig {
  /** title name */
  title?: string;
  /** description */
  description?: string;
  enableColorMode?: boolean;
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
  /** Alt logo */
  logoAlt?: string;
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
        menus?: LayoutPageNavbarMenu[];
        links: Record<string, string>;
        hasBanner?: boolean;
        bannerStyle?: Record<string, string>;
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
        to?: RouteLocationRaw | ((_nuxt: NuxtApp) => RouteLocationRaw);
      };
      secondaryActionButton?: {
        title?: string;
        to?: RouteLocationRaw | ((_nuxt: NuxtApp) => RouteLocationRaw);
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
    config?: NuxtAppConfig;
  }
}

type FullAppConfig = NuxtAppConfig & typeof _config;

const appConfig: FullAppConfig = _config as FullAppConfig;

export default defineAppConfig({
  config: {
    logo: appConfig.logo,
    logoAlt: appConfig.logoAlt,
    enableColorMode: appConfig.enableColorMode || true,
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
            { type: 'link', title: 'Services', to: { name: 'services' } },
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
  } as NuxtAppConfig,
  nuxtIcon: {
    aliases: {},
    class: '',
    size: '1em',
  },
});
