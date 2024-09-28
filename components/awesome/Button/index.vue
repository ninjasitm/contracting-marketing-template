<script lang="ts" setup>
const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  uppercase: {
    type: Boolean,
    default: true,
  },
  rounded: {
    type: Boolean,
    default: true,
  },
  outline: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'none',
  },
  size: {
    type: String,
    default: 'md',
  },
  to: {
    type: [String, Object],
    default: undefined,
  },
  href: {
    type: String,
    default: undefined,
  },
});
// state:styles
const defaultStyle = `
  cursor-pointer
  ${props.uppercase && 'uppercase'}
  ${props.outline && 'outline outline-1 outline-black'}
  ${props.rounded && 'rounded-full'}
  transition-color duration-300
  focus:outline-none focus:ring-1 focus:ring-offset-1 focus:dark:ring-offset-gray-50 focus:dark:ring-gray-400 focus:ring-gray-600/[0.6] focus:ring-offset-gray-800/[0.6]
  flex items-center justify-center font-semibold
`;
const styles = reactive<{
  [key: string]: string;
}>({
  none: 'hover:opacity-80 hover:scale-[105%] transform duration-300',
  primary: 'text-white bg-primary-500 hover:bg-primary-400 border-primary-500',
  secondary:
    'text-gray-800 bg-gray-200 border-gray-200 hover:bg-gray-300 dark:text-white dark:border-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700',
  opposite:
    'text-white bg-gray-800 hover:bg-white hover:text-gray-800 hover:border-gray-900 dark:text-gray-800 dark:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:border-white',
  danger: 'text-white bg-red-500 hover:bg-red-400 border-red-500',
});
const sizes = reactive<{
  [key: string]: string;
}>({
  lg: 'h-12 px-4 lg:px-10 text-md rounded-lg',
  md: 'h-10 px-3 text-base rounded',
  sm: 'h-8 px-2 text-sm rounded',
  xs: 'h-6 px-1 text-xs rounded',
});
// state
const selectedStyle = computed(() =>
  props.type in styles ? styles[props.type] : styles.primary,
);
const selectedSize = computed(() => sizes[props.size] || sizes.lg);
// methods
const onClick = (event: MouseEvent) => {
  const router = useRouter();
  if (props.to) {
    router.push(props.to);
  }
  if (!props.href) {
    event.preventDefault();
  }
};
</script>

<template>
  <NuxtLink
    v-if="to"
    tag="a"
    :to="to"
    :class="`${defaultStyle} ${selectedStyle} ${selectedSize}`"
  >
    <slot>{{ text }}</slot>
  </NuxtLink>
  <a
    v-else
    :class="`${defaultStyle} ${selectedStyle} ${selectedSize}`"
    :href="href"
    @click="onClick"
  >
    <slot>{{ text }}</slot>
  </a>
</template>
