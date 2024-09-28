import type { NuxtApp } from 'nuxt/schema';
import type { RouteLocationRaw } from '#vue-router';

export interface AwesomeLayoutPageNavbarMenuDropdownItem {
  type?: 'link';
  title?: string | ((nuxt: NuxtApp) => string);
  to?: RouteLocationRaw | ((nuxt: NuxtApp) => RouteLocationRaw);
}

export interface AwesomeLayoutPageNavbarMenu {
  type?: 'link' | 'button' | 'dropdown';
  title?: string | ((nuxt: NuxtApp) => string);
  to?: RouteLocationRaw | ((nuxt: NuxtApp) => RouteLocationRaw);
  children?: AwesomeLayoutPageNavbarMenuDropdownItem[];
}

export type LinkItem = {
  icon: string;
  url: string;
  title: string;
};

export type GenericItem = {
  label: string;
  value: string;
};

export type StyleObject = {
  [key: string]: string;
};

export interface Client {
  slug: string;
  name: string;
  logo?: string;
  description?: string;
  website?: string;
}

export interface Project {
  title: string;
  date: string;
  slug: string;
  isOngoing?: boolean;
  description?: string;
  client: string;
  url: string;
  bannerImage?: string;
  categories?: string[];
  problem?: {
    title: string;
    image: string;
    description: string;
  };
  solution?: {
    title: string;
    image: string;
    description: string;
  };
  process?: {
    title: string;
    image: string;
    description: string;
    items: ProcessItem[];
  };
  design?: {
    title: string;
    image: string;
    description: string;
    items: DesignItem[];
  };
  result?: {
    title: string;
    image: string;
    description: string;
    items: ResultItem[];
  };
}