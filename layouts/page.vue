<script lang="ts" setup>
import { reactive } from 'vue';
import type { StyleObject } from '@/utils/types';

const { config } = useAppConfig();

export type LayoutProps = {
  style?: StyleObject;
};
const state: LayoutProps = reactive({
  style: config.style || {},
});
</script>

<template>
  <div
    class="overflow-x-hidden scroll-smooth mx-auto dark:bg-background-dark dark:text-foreground-dark text-foreground bg-background"
    :style="state.style"
  >
    <LayoutPageHeader />
    <div
      id="page-banner"
      class="w-full"
    />
    <div class="mx-auto max-w-screen-xl">
      <LayoutPageContent>
        <slot />
      </LayoutPageContent>
    </div>
    <LayoutPageFooter />
  </div>
</template>
