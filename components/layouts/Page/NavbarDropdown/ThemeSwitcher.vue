<script lang="ts" setup>
import { toRef } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'button',
  },
  horizontal: {
    type: Boolean,
    default: false,
  },
});
const currentStyle = toRef(props, 'type');
const colorMode = useColorMode();

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

// Get current theme icon
const currentIcon = computed(() => {
  if (
    colorMode.preference === 'dark' ||
    (colorMode.preference === 'system' && colorMode.value === 'dark')
  ) {
    return 'uil:moon';
  }
  return 'uil:sun';
});

const toggleTheme = () => {
  colorMode.preference = colorMode.preference === 'light' ? 'dark' : 'light';
};
</script>

<template>
  <div class="flex items-center">
    <HeadlessListbox
      v-if="currentStyle === 'dropdown-right-top'"
      v-model="colorMode.preference"
      as="div"
      class="relative flex items-center"
    >
      <HeadlessListboxLabel class="sr-only"> Theme </HeadlessListboxLabel>
      <HeadlessListboxButton type="template">
        <AwesomeLink
          class="text-muted-foreground hover:text-foreground transition-colors dark:text-white"
        >
          <Icon :name="currentIcon" class="w-5 h-5" />
        </AwesomeLink>
      </HeadlessListboxButton>
      <HeadlessListboxOptions
        class="p-1 absolute z-50 origin-top-right top-full right-0 outline-none bg-popover rounded-lg ring-1 ring-border shadow-lg overflow-hidden w-36 py-1 text-sm text-popover-foreground font-semibold border border-border"
        :class="{
          'flex flex-row mt-[-30px] mr-[60px]': props.horizontal,
        }"
      >
        <HeadlessListboxOption
          v-for="theme in availableThemes"
          :key="theme.key"
          :value="theme.key"
          :class="{
            'py-2 px-2 flex items-center cursor-pointer transition-colors': true,
            'text-primary bg-accent': colorMode.preference === theme.key,
            'hover:bg-accent/50 text-muted-foreground':
              colorMode.preference !== theme.key,
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
      v-model="colorMode.preference"
      class="w-full px-2 pr-3 py-1 outline-none rounded border bg-background-secondary text-foreground border-border focus:border-primary transition-colors"
    >
      <option
        v-for="theme in availableThemes"
        :key="theme.key"
        :value="theme.key"
      >
        {{ theme.text }}
      </option>
    </select>
    <AppButton
      v-if="currentStyle === 'button'"
      variant="link"
      shadow="none"
      color="none"
      size="icon"
      @click="toggleTheme"
    >
      <Icon :name="currentIcon" class="w-5 h-5" />
    </AppButton>
  </div>
</template>
