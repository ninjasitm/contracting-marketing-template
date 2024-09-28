<script lang="ts" setup>
import { reactive } from 'vue';
import Item from './Item.vue';
import Separator from './Separator.vue';

type InfoItem = {
  id: number;
  label: string;
  value: string;
};

type InfoBarState = {
  items: InfoItem[];
};

const state: InfoBarState = reactive({
  items: [],
});
</script>

<template>
  <header
    class="flex relative flex-wrap gap-5 justify-center items-center px-4 lg:px-10 py-4 w-full text-xs bg-sky-950 max-md:px-5 max-md:max-w-full"
  >
    <template v-for="(item, index) in state.items" :key="item.id">
      <Item :label="item.label" :value="item.value" />
      <Separator v-if="index < state.items.length" />
    </template>
  </header>
</template>
