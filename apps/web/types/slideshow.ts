// Adapted from ninjasitm/nitm-marketing @ da649f7. Copyright (c) 2025 Ninjas In The Machine. MIT: docs/reference/NITM_MARKETING_LICENSE.md.
import type { BackgroundEffectName, BackgroundEffectOptions } from './background-effect';
export type SlideshowNavigationStyle = 'icons' | 'text' | 'dots';
export type SlideshowSlideType = string;
export type SlideshowAlignment = 'top-left' | 'top-center' | 'top-right' | 'left' | 'center' | 'right' | 'center-left' | 'center-right';
export type SlideshowTextAlignment = 'left' | 'center' | 'right';
export interface SlideshowSlide {
  type: SlideshowSlideType;
  contentId?: string;
  postRef?: string;
  workRef?: string;
  serviceRef?: string;
  teamMemberRef?: string;
  testimonialRef?: string;
  courseRef?: string;
  collabRef?: string;
  partnerRef?: string;
  title?: string;
  description?: string;
  image?: string;
  link?: string;
  cta?: { text: string; url: string; type?: 'link' | 'button' };
  backgroundClass?: string;
  textColor?: string;
  alignment?: SlideshowAlignment;
  textAlignment?: SlideshowTextAlignment;
  imagePosition?: 'left' | 'right';
}
export interface Slideshow {
  active?: boolean;
  layout: 'hero' | 'scroll-slide';
  slides: SlideshowSlide[];
  scrollFreeze?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number;
  size?: 'small' | 'medium' | 'large' | 'full';
  alignment?: SlideshowAlignment;
  showNavigation?: boolean;
  navigationStyle?: SlideshowNavigationStyle;
  backgroundEffect?: BackgroundEffectName;
  backgroundEffectOptions?: BackgroundEffectOptions;
  backgroundEffectFade?: 'none' | 'linear' | 'step';
  backgroundEffectMode?: 'section' | 'fixed';
}
