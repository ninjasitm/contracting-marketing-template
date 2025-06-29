import type { NuxtApp } from 'nuxt/schema';
import type { RouteLocationRaw } from '#vue-router';

export interface AwesomeLayoutPageNavbarMenuDropdownItem {
  type?: 'link';
  title?: string | ((_nuxt: NuxtApp) => string);
  to?: RouteLocationRaw | ((_nuxt: NuxtApp) => RouteLocationRaw);
}

export interface AwesomeLayoutPageNavbarMenu {
  type?: 'link' | 'button' | 'dropdown';
  title?: string | ((_nuxt: NuxtApp) => string);
  to?: RouteLocationRaw | ((_nuxt: NuxtApp) => RouteLocationRaw);
  children?: AwesomeLayoutPageNavbarMenuDropdownItem[];
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
  type?: string;
  logo?: string;
  description?: string;
  website?: string;
  heroImage?: string;
}

interface ProcessItem {
  imgSrc: string;
  alt: string;
  title?: string;
  description: string;
}

interface DesignItem {
  imgSrc: string;
  alt: string;
}

interface ResultItem {
  imgSrc?: string;
  alt?: string;
  title: string;
  description: string;
  value?: string;
  label?: string;
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
  heroImage?: string;
  categories?: string[];
  backgroundColors?: {
    background: string;
    text: string;
  };
  problem?: {
    title: string;
    image: string;
    description: string;
    items?: {
      title: string;
      description: string;
    }[];
  };
  solution?: {
    title: string;
    image: string;
    description: string;
    features?: {
      title: string;
      description: string;
    }[];
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
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    company?: string;
    avatar?: string;
  };
  stats?: {
    value: string;
    label: string;
  }[];
}

export interface Service {
  title: string;
  icon: string;
  description: string;
  features: string[];
  image?: string;
  projectsUrl?: string;
}

export interface ServiceCategory {
  title: string;
  services: Service[];
}

export interface Testimonial {
  quote: string;
  author: string;
  position: string;
  avatar?: string;
}

export interface FeaturedProject {
  title: string;
  category: string;
  description: string;
  image: string;
  url: string;
}

export interface FeaturedWork {
  title: string;
  projects: FeaturedProject[];
}

export interface CallToAction {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface HeroActions {
  text: string;
  url: string;
  type: 'link' | 'button'; // 'link' for NuxtLink, 'button' for AppButton
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'full'; // Updated to match pages.yml
  class?: string; // Additional classes for styling (renamed from class)
}

export interface Hero {
  title: string;
  description: string;
  overlayClass?: string;
  subtitle?: string;
  highlightText?: string;
  suffix?: string;
  featuredType?: string;
  featuredItems?: string[];
  backgroundClass?: string; // 'bg-green-50' | 'bg-blue-50' | 'bg-gray-50'
  backgroundImage?: string | Array<string>;
  overlayColor?: string;
  size?: string; // 'small' | 'medium' | 'large' | 'extra-large'
  alignment?: string; // 'left' | 'center' | 'right'
  textColor?: string;
  mode?: string; // 'typer' | 'static'
  typerBegin?: string; // Optional, used in 'typer' mode
  typerText?: string | Array<string>; // Optional, used in 'typer' mode
  typerEnd?: string; // Optional, used in 'typer' mode
  actions?: HeroActions[]; // Optional, used for buttons or links in the banner
}

export interface BasePageState {
  hero?: Hero;
  callToAction?: CallToAction;
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
