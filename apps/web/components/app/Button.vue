<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs' | 'xxl' | 'xl' | 'md';
  theme?: 'primary' | 'outline' | 'ghost' | 'secondary';
  rounded?:
    | 'none'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl'
    | '4xl'
    | '5xl'
    | boolean;
  shadow?:
    | 'none'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl'
    | '4xl'
    | '5xl'
    | boolean;
  uppercase?: boolean;
  outline?: boolean;
  as?: 'button' | 'a' | 'div' | 'span';
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  theme: 'primary',
  outline: false,
  rounded: 'md',
  shadow: 'md',
  uppercase: false,
  as: 'button',
});
</script>

<template>
  <Button
    :variant="variant"
    :size="size"
    :class="
      cn($attrs.class as string, [
        'dark:text-foreground-dark',
        'dark:bg-background-dark',
      ])
    "
    v-bind="$attrs"
  >
    <slot />
  </Button>
</template>
