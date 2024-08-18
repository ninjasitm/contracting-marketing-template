import type { RouteLocationRaw } from 'vue-router';
import { NuxtApp } from '#app';
import { AwesomeLayoutPageNavbarMenu } from './types';
import Logo from '~/assets/images/demo/logo.png';

export interface NuxtAwesomeAppConfig {
  /** title name */
  name?: string;
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
  config: {},
});
