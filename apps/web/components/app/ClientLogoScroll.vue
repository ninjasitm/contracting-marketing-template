<script setup lang="ts">
import clients from '@content/clients.json';
import { ref } from 'vue';

const paused = ref(false);

// Concept reference: https://github.com/ninjasitm/nitm-marketing/blob/main/apps/web/components/app/ClientLogoScroll.vue
</script>

<template>
  <div>
    <button
      type="button"
      class="rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      @click="paused = !paused"
    >
      {{ paused ? 'Resume client logos' : 'Pause client logos' }}
    </button>
    <div
      class="client-logo-scroll flex w-full overflow-hidden py-8"
      :class="{ 'is-paused': paused }"
      aria-label="Clients"
    >
      <ul
        v-for="copy in 2"
        :key="copy"
        :aria-hidden="copy === 2 ? true : undefined"
        :inert="copy === 2 ? true : undefined"
        class="flex w-max min-w-full shrink-0 items-center justify-around gap-8 pr-8 animate-loop-scroll motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:w-full motion-reduce:gap-4 motion-reduce:pr-0"
        :class="{ 'motion-reduce:hidden': copy === 2 }"
      >
        <li
          v-for="client in clients"
          :key="client.slug"
          class="shrink-0"
        >
          <component
            :is="copy === 1 ? 'a' : 'span'"
            :href="copy === 1 ? client.url : undefined"
            class="flex h-24 w-40 items-center justify-center rounded-lg bg-white p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <img
              :src="client.logo"
              :alt="client.name"
              width="160"
              height="80"
              class="h-full w-full object-contain"
            >
          </component>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.client-logo-scroll.is-paused ul,
.client-logo-scroll:hover ul,
.client-logo-scroll:focus-within ul {
  animation-play-state: paused;
}
</style>
