// Adapted from ninjasitm/nitm-marketing @ da649f7. Copyright (c) 2025 Ninjas In The Machine. MIT: docs/reference/NITM_MARKETING_LICENSE.md.
export { default as Carousel } from './Carousel.vue';
export { default as CarouselContent } from './CarouselContent.vue';
export { default as CarouselItem } from './CarouselItem.vue';
export { default as CarouselNext } from './CarouselNext.vue';
export { default as CarouselPrevious } from './CarouselPrevious.vue';
export type {
  UnwrapRefCarouselApi as CarouselApi,
} from './interface';

export { useCarousel } from './useCarousel';
