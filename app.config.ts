import type { RouteLocationRaw } from 'vue-router';
import { type NuxtApp } from '#app';
import { type AwesomeLayoutPageNavbarMenu } from './utils/types';
import appConfig from './content/config.json';
export interface NuxtAwesomeAppConfig {
  /** title name */
  title?: string;
  /** description */
  description?: string;
  /** logo */
  logo?: string;

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
    name: appConfig.title,
    logo: appConfig.logo,
    description: appConfig.description,
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
        ...appConfig.footer,
        naicsCodes: appConfig.naicsCodes,
        year: new Date().getFullYear(),
      },
      welcome: {
        title: appConfig.title,
        disableInfoReplaceIndexInWelcomePage: true,
      },
    },
    author: {
      name: appConfig.companyName,
    },
  } as NuxtAwesomeAppConfig,
  nuxtIcon: {
    aliases: {},
    class: '',
    size: '1em',
  }
});
