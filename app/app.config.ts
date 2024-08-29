import type { RouteLocationRaw } from 'vue-router';
import { NuxtApp } from '#app';
import { AwesomeLayoutPageNavbarMenu } from './types';

export interface NuxtAwesomeAppConfig {
  /** title name */
  title?: string;
  /** description */
  description?: string;
  /** logo */
  logo?: string;

  /** project config */
  project?: {
    /** links */
    links?: {
      /** project github link */
      github?: string;
    };
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
    name: 'Ninjas in the Machine',
    description:
      'a starter template for Nuxt 3 with minimalist themes design, built in components, drawer & menus, and more.',
    logo: '/public/images/demo/logo.png',
    project: {
      links: {
        github: 'https://github.com/viandwi24/nuxt3-awesome-starter',
      },
    },
    layout: {
      page: {
        navbar: {
          menus: [
            { type: 'link', title: 'Work', to: { name: 'work' } },
            { type: 'link', title: 'About', to: { name: 'about' } },
            { type: 'link', title: 'Process', to: { name: 'process' } },
            // dynamic title
            // {
            //   type: 'button',
            //   title: (nuxt) =>
            //     (nuxt._appConfig as AppConfigInput)?.awesome?.title || '',
            //   to: (nuxt) => (nuxt._appConfig as AppConfigInput)?.awesome?.title || '',
            // },
          ],
          links: {
            startProject: '/start-project',
            capabilities: '/assets/capabilities.pdf',
          },
        },
      },
      footer: {
        year: new Date().getFullYear(),
      },
      welcome: {
        title: 'Contracting Starter',
        disableInfoReplaceIndexInWelcomePage: true,
      },
    },
    author: {
      name: 'ninjasitm',
      links: {
        github: 'https://gitlab.com/ninjasitm',
        medium: 'https://nitm.medium.com',
        website: 'https://ninjasitm.com',
        capabilities: '/assets/capabilities.pdf',
      },
    },
  },
});
