<template>
  <LayoutPageSection :class="cn(ctaStyles({ variant, size }), $attrs.class as string)">
    <div class="container mx-auto px-4">
      <div :class="cn('text-center', contentAlignment)">
        <!-- Main Heading -->
        <h2
          v-if="title"
          :class="cn(titleStyles({ size }))"
        >
          {{ title }}
        </h2>

        <!-- Subtitle/Description -->
        <p
          v-if="description"
          :class="cn(descriptionStyles({ size }))"
        >
          {{ description }}
        </p>

        <!-- Custom content slot -->
        <div
          v-if="$slots.content"
          class="my-6"
        >
          <slot name="content" />
        </div>

        <!-- Action buttons -->
        <div
          v-if="$slots.actions || primaryAction || secondaryAction"
          :class="cn('flex flex-wrap gap-4', actionAlignment)"
        >
          <slot name="actions">
            <AppButton
              v-if="primaryAction"
              variant="default"
              :size="buttonSize"
              :class="primaryActionClass"
              @click="$emit('primary-action')"
            >
              {{ primaryAction }}
            </AppButton>

            <AppButton
              v-if="secondaryAction"
              variant="outline"
              :size="buttonSize"
              :class="secondaryActionClass"
              @click="$emit('secondary-action')"
            >
              {{ secondaryAction }}
            </AppButton>
          </slot>
        </div>
      </div>
    </div>
  </LayoutPageSection>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import AppButton from './Button.vue';
import { LayoutPageSection } from '#components';

const ctaStyles = cva(
  'relative py-16 md:py-20 lg:py-24',
  {
    variants: {
      variant: {
        default: 'bg-cta text-white',
        primary: 'bg-primary-500 text-white',
        dark: 'bg-gray-900 text-gray-100',
        gradient: 'bg-gradient-to-br from-primary-500/10 via-background to-primary-500/5',
        bordered: 'border-y border-border bg-background-card',
        'blue-gradient': 'bg-cta text-white',
      },
      size: {
        sm: 'py-12 md:py-16',
        default: 'py-16 md:py-20 lg:py-24',
        lg: 'py-20 md:py-28 lg:py-32',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const titleStyles = cva(
  'font-heading font-bold text-text-primary mb-4',
  {
    variants: {
      size: {
        sm: 'text-2xl md:text-3xl',
        default: 'text-3xl md:text-4xl lg:text-5xl',
        lg: 'text-4xl md:text-5xl lg:text-6xl',
      },
    },
  }
);

const descriptionStyles = cva(
  'text-text-secondary mb-8 max-w-2xl mx-auto',
  {
    variants: {
      size: {
        sm: 'text-base md:text-lg',
        default: 'text-lg md:text-xl',
        lg: 'text-xl md:text-2xl',
      },
    },
  }
);

interface Props {
  title?: string
  description?: string
  primaryAction?: string
  secondaryAction?: string
  primaryActionClass?: string
  secondaryActionClass?: string
  variant?: 'default' | 'primary' | 'dark' | 'gradient' | 'bordered' | 'blue-gradient'
  size?: 'sm' | 'default' | 'lg'
  alignment?: 'left' | 'center' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  alignment: 'center',
});

defineEmits<{
  'primary-action': []
  'secondary-action': []
}>();

const contentAlignment = computed(() => {
  switch (props.alignment) {
    case 'left': return 'text-left';
    case 'right': return 'text-right';
    default: return 'text-center';
  }
});

const actionAlignment = computed(() => {
  switch (props.alignment) {
    case 'left': return 'justify-start';
    case 'right': return 'justify-end';
    default: return 'justify-center';
  }
});

const buttonSize = computed(() => {
  switch (props.size) {
    case 'sm': return 'sm';
    case 'lg': return 'lg';
    default: return 'default';
  }
});
</script>