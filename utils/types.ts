import type { NuxtApp } from 'nuxt/schema';
import type { RouteLocationRaw } from '#vue-router';

export interface LayoutPageNavbarMenuDropdownItem {
  type?: 'link';
  title?: string | ((_nuxt: NuxtApp) => string);
  to?: RouteLocationRaw | ((_nuxt: NuxtApp) => RouteLocationRaw);
}

export interface LayoutPageNavbarMenu {
  type?: 'link' | 'button' | 'dropdown';
  title?: string | ((_nuxt: NuxtApp) => string);
  to?: RouteLocationRaw | ((_nuxt: NuxtApp) => RouteLocationRaw);
  children?: LayoutPageNavbarMenuDropdownItem[];
}

export type LinkItem = {
  icon: string;
  url: string;
  title: string;
  to?: string;
};

export type GenericItem = {
  label: string;
  value: string;
  title?: string;
};

export type StyleObject = {
  [key: string]: string;
};
