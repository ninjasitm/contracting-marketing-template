<template>
  <Card :class="cn(cardStyles({ variant }), $attrs.class as string)">
    <CardHeader v-if="title || description || $slots.header">
      <slot name="header">
        <CardTitle
          v-if="title"
          class="text-text-primary font-heading"
        >
          {{ title }}
        </CardTitle>
        <CardDescription
          v-if="description"
          class="text-text-secondary"
        >
          {{ description }}
        </CardDescription>
      </slot>
    </CardHeader>

    <CardContent class="text-text-primary">
      <slot />
    </CardContent>

    <CardFooter
      v-if="$slots.footer"
      class="border-t border-border"
    >
      <slot name="footer" />
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

const cardStyles = cva(
  'bg-background-card border border-border shadow-sm transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'hover:shadow-md',
        elevated: 'shadow-lg hover:shadow-xl',
        flat: 'shadow-none border-border/50',
        interactive: 'hover:shadow-md hover:border-border-light cursor-pointer transition-transform hover:scale-[1.02]',
        dark: 'bg-gray-800 border border-gray-700 shadow-sm hover:shadow-md',
        tertiary: 'bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface Props {
  title?: string
  description?: string
  variant?: 'default' | 'elevated' | 'flat' | 'interactive' | 'dark' | 'tertiary'
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
});
</script>