import type { RouteLocationRaw } from '#vue-router';
import { useNuxtApp } from '#app';

export function useNavbarParser() {
  return {
    parseMenuTitle: function parseMenuTitle(
      title?: string | ((_nuxt: any) => string),
    ) {
      return typeof title === 'function' ? title(useNuxtApp()) : title || '';
    },
    parseMenuRoute: function parseMenuRoute(
      to?: RouteLocationRaw | ((_nuxt: any) => RouteLocationRaw),
    ) {
      return typeof to === 'function' ? to(useNuxtApp()) : to;
    },
  };
}
