<script lang="ts" setup>
import { reactive } from 'vue';
import type { StyleObject } from '@/utils/types';

const { config } = useAppConfig();

export type LayoutProps = {
  style: StyleObject;
};
const state: LayoutProps = reactive({
  style: config.style,
});
</script>

<template>
  <div class="overflow-x-hidden scroll-smooth" :style="state.style">
    <LayoutPageNavbar />
    <LayoutPageContent class="container mx-auto">
      <slot />
    </LayoutPageContent>
    <LayoutPageFooter />
  </div>
</template>
