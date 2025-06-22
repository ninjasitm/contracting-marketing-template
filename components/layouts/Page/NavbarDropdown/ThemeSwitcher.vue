<script lang="ts" setup>
import { toRef } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'dropdown-right-top',
  },
  horizontal: {
    type: Boolean,
    default: false,
  },
});
const currentStyle = toRef(props, 'type');

const availableThemes = [
  {
    key: 'light',
    text: 'Light',
  },
  {
    key: 'dark',
    text: 'Dark',
  },
  {
    key: 'system',
    text: 'System',
  },
];
</script>

<template>
  <div class="flex items-center">
    <HeadlessListbox
      v-if="currentStyle === 'dropdown-right-top'"
      v-model="$colorMode.preference"
      as="div"
      class="relative flex items-center"
    >
      <HeadlessListboxLabel class="sr-only"> Theme </HeadlessListboxLabel>
      <HeadlessListboxButton type="template">
        <button
          type="button"
          class="dark:text-gray-400 text-gray-600 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
        >
          <span class="flex justify-center items-center dark:hidden">
            <Icon name="uil:sun" />
          </span>
          <span class="justify-center items-center hidden dark:flex">
            <Icon name="uil:moon" />
          </span>
        </button>
      </HeadlessListboxButton>
      <HeadlessListboxOptions
        class="p-1 absolute z-50 origin-top-right top-full right-0 outline-none bg-white rounded-lg ring-1 ring-gray-900/10 shadow-lg overflow-hidden w-36 py-1 text-sm text-gray-700 font-semibold dark:bg-gray-800 dark:ring-0 dark:highlight-white/5 dark:text-gray-300"
        :class="{
          'flex flex-row mt-[-30px] mr-[60px]': props.horizontal,
        }"
      >
        <HeadlessListboxOption
          v-for="theme in availableThemes"
          :key="theme.key"
          :value="theme.key"
          :class="{
            'py-2 px-2 flex items-center cursor-pointer': true,
            'text-sky-500 bg-gray-100 dark:bg-gray-600/30':
              $colorMode.preference === theme.key,
            'hover:bg-gray-50 dark:hover:bg-gray-700/30':
              $colorMode.preference !== theme.key,
          }"
        >
          <span class="text-sm mr-2 flex items-center">
            <Icon v-if="theme.key === 'light'" name="uil:sun" />
            <Icon v-else-if="theme.key === 'dark'" name="uil:moon" />
            <Icon v-else-if="theme.key === 'system'" name="uil:laptop" />
          </span>
          {{ theme.text }}
        </HeadlessListboxOption>
      </HeadlessListboxOptions>
    </HeadlessListbox>
    <select
      v-if="currentStyle === 'select-box'"
      v-model="$colorMode.preference"
      class="w-full px-2 pr-3 py-1 outline-none rounded border bg-transparent text-gray-700 dark:text-gray-300 border-gray-900/10 dark:border-gray-50/[0.2]"
    >
      <option
        v-for="theme in availableThemes"
        :key="theme.key"
        :value="theme.key"
      >
        {{ theme.text }}
      </option>
    </select>
  </div>
</template>
