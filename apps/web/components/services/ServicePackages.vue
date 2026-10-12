<script setup lang="ts">
// Adapted from ninjasitm/nitm-marketing da649f7. MIT © 2025 NinjasInTheMachine.
// License: docs/reference/NITM_MARKETING_LICENSE.md
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isSafeHref } from '@/utils/safe-link';

interface ServicePackage {
  name?: string;
  hours?: string;
  price?: string;
  features?: string[];
  bestFor?: string;
  recommended?: boolean;
  href?: string;
  cta?: string;
}
withDefaults(defineProps<{
  packages?: ServicePackage[];
  title?: string;
  recommendedLabel?: string;
  href?: string;
  cta?: string;
}>(), {
  packages: () => [], title: 'Engagement Packages',
  recommendedLabel: 'Recommended', cta: 'Get Started', href: undefined,
});
</script>

<template>
  <section class="py-12">
    <h2
      v-if="title"
      class="mb-8 text-3xl font-heading text-foreground md:text-4xl"
    >
      {{ title }}
    </h2>
    <div
      class="grid gap-6"
      :class="packages.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'"
    >
      <Card
        v-for="(pkg, index) in packages"
        :key="index"
        class="relative flex flex-col gap-4 p-6"
        :class="pkg.recommended ? 'border-primary ring-1 ring-primary' : ''"
      >
        <p
          v-if="pkg.recommended"
          class="text-sm font-semibold text-primary"
        >
          {{ recommendedLabel }}
        </p>
        <h3 class="text-xl font-heading">
          {{ pkg.name }}
        </h3>
        <p
          v-if="pkg.hours"
          class="text-sm text-muted-foreground"
        >
          {{ pkg.hours }}
        </p>
        <p
          v-if="pkg.price"
          class="text-3xl font-semibold"
        >
          {{ pkg.price }}
        </p>
        <ul
          v-if="pkg.features?.length"
          class="flex-1 space-y-3"
        >
          <li
            v-for="(feature, i) in pkg.features"
            :key="i"
            class="flex gap-3"
          >
            <span
              aria-hidden="true"
              class="text-primary"
            >✓</span>{{ feature }}
          </li>
        </ul>
        <p
          v-if="pkg.bestFor"
          class="text-sm text-muted-foreground"
        >
          Best for: {{ pkg.bestFor }}
        </p>
        <Button
          v-if="isSafeHref(pkg.href ?? href)"
          as="a"
          :href="pkg.href ?? href"
          class="mt-auto"
        >
          {{ pkg.cta ?? cta }}
        </Button>
      </Card>
    </div>
  </section>
</template>
