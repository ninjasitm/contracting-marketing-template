<script lang="ts" setup>
import { useNavbarParser } from '~/composables/use-navbar-parser';
import type {
  LayoutPageNavbarMenu,
  LayoutPageNavbarMenuDropdownItem,
} from '~/utils/types';

const { parseMenuRoute, parseMenuTitle } = useNavbarParser();

const _props = defineProps({
  menu: {
    type: Object as () =>
      | LayoutPageNavbarMenu
      | LayoutPageNavbarMenuDropdownItem,
    required: true,
  },
  isDropdown: {
    type: Boolean,
    default: false,
  },
});

const { menu } = _props;
</script>

<template>
  <template v-if="menu?.type === 'link' && isDropdown">
    <NuxtLink
      :to="parseMenuRoute(menu?.to)"
      #="{ isActive }"
    >
      <div
        :class="[
          'transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 lg:px-10 py-2 rounded-lg w-full',
          isActive
            ? 'text-gray-900 dark:text-gray-100 font-bold'
            : 'text-gray-700 dark:text-gray-300',
        ]"
      >
        {{ parseMenuTitle(menu?.title) }}
      </div>
    </NuxtLink>
  </template>
  <template v-else-if="menu?.type === 'link'">
    <NuxtLink
      :to="parseMenuRoute(menu?.to)"
      #="{ isActive }"
    >
      <span
        :class="{
          'text-gray-900 dark:text-gray-100 font-bold': isActive,
          'text-gray-700 dark:text-gray-300': !isActive,
        }"
      >{{ parseMenuTitle(menu?.title) }}</span>
    </NuxtLink>
  </template>
  <template v-else-if="menu?.type === 'button'">
    <NuxtLink
      :to="parseMenuRoute(menu.to)"
      class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 px-3"
    >
      {{ parseMenuTitle(menu?.title) }}
    </NuxtLink>
  </template>
</template>
