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
  <div class="overflow-x-hidden scroll-smooth mx-auto" :style="state.style">
    <div class="mx-auto max-w-screen-xl">
      <LayoutPageNavbar />
      <LayoutPageContent>
        <slot />
      </LayoutPageContent>
    </div>
    <LayoutPageFooter />
  </div>
</template>
