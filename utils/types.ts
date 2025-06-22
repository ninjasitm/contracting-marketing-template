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

export interface Client {
  slug: string;
  name: string;
  logo?: string;
  description?: string;
  website?: string;
}

interface ProcessItem {
  imgSrc: string;
  alt: string;
  description: string;
}

interface DesignItem {
  imgSrc: string;
  alt: string;
}

interface ResultItem {
  imgSrc: string;
  alt: string;
  title: string;
  description: string;
}

export interface Project {
  id?: string;
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

export interface Service {
  title: string;
  icon: string;
  description: string;
  features: string[];
}

export interface CallToAction {
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
}

export interface ServicesPageState {
  title: string;
  description: string;
  services: Service[];
  callToAction: CallToAction;
}

interface _SingleProjectState {
  project: Project;
  nextProject?: {
    id: string;
    title: string;
    description: string;
  };
  previousProject?: {
    id: string;
    title: string;
    description: string;
  };
}
