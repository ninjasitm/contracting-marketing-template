<!-- Adapted from ninjasitm/nitm-marketing @ da649f7e374da848aac277d202a49942d708fc92. MIT: docs/reference/NITM_MARKETING_LICENSE.md. -->
<script setup lang="ts">
import { computed, ref, useId, onBeforeUnmount } from 'vue';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import type { UnwrapRefCarouselApi } from '@/components/ui/carousel/interface';
import AppButton from './Button.vue';
import type { PricingPlan, PricingTextAlign } from '@/types/pricing';
import { isSafeHref } from '@/utils/safe-link';
const props = withDefaults(defineProps<{ plans: PricingPlan[]; textAlign?: PricingTextAlign }>(), { textAlign: 'left' });
const plans = computed(() => props.plans.filter(plan => plan.title && plan.price));
const id = useId();
const api = ref<UnwrapRefCarouselApi>();
const current = ref(0);
const count = ref(0);
function sync() { current.value = api.value?.selectedScrollSnap() ?? 0; count.value = api.value?.scrollSnapList().length ?? 0; }
function cleanup() { api.value?.off('select', sync); api.value?.off('reInit', sync); }
function init(value: UnwrapRefCarouselApi) { cleanup(); api.value = value; value?.on('select', sync); value?.on('reInit', sync); sync(); }
onBeforeUnmount(cleanup);
</script>

<template>
  <div
    v-if="plans.length"
    class="w-full"
  >
    <p
      :id="id"
      class="sr-only"
    >
      Drag or focus the carousel and use arrow keys to browse pricing plans.
    </p>
    <Carousel
      aria-label="Pricing plans"
      :aria-describedby="id"
      :opts="{ align: 'start', containScroll: 'trimSnaps' }"
      @init-api="init"
    >
      <CarouselContent>
        <CarouselItem
          v-for="(plan, index) in plans"
          :key="index"
          :class="plans.length === 1 ? 'basis-full' : plans.length === 2 ? 'basis-full md:basis-1/2' : 'basis-full md:basis-1/2 lg:basis-1/3'"
        >
          <Card
            class="h-full flex flex-col rounded-2xl"
            :class="[plan.featured ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-card-foreground', { left: 'text-left', center: 'text-center', right: 'text-right' }[plan.textAlign ?? textAlign]]"
            :data-featured="!!plan.featured"
          >
            <CardHeader>
              <CardTitle class="text-2xl">
                {{ plan.title }}
              </CardTitle>
              <p class="text-4xl font-semibold">
                {{ plan.price }}
              </p>
              <p v-if="plan.unit || plan.unitAmount">
                {{ plan.unitAmount }} {{ plan.unit }}
              </p>
              <p
                v-if="plan.description"
                class="leading-relaxed"
              >
                {{ plan.description }}
              </p>
            </CardHeader>
            <CardContent class="flex-1">
              <ul
                v-if="plan.features?.length"
                class="space-y-3 list-disc pl-5"
              >
                <li
                  v-for="(feature, featureIndex) in plan.features"
                  :key="featureIndex"
                >
                  {{ feature }}
                </li>
              </ul>
            </CardContent>
            <CardFooter v-if="plan.actionButton?.label && isSafeHref(plan.actionButton.url)">
              <AppButton
                as-child
                :variant="plan.featured ? 'secondary' : 'default'"
              >
                <a :href="plan.actionButton.url">{{ plan.actionButton.label }}</a>
              </AppButton>
            </CardFooter>
          </Card>
        </CarouselItem>
      </CarouselContent>
      <div
        v-if="count > 1"
        class="flex justify-center gap-3 mt-6"
      >
        <CarouselPrevious class="static translate-x-0 translate-y-0" />
        <button
          v-for="dot in count"
          :key="dot"
          type="button"
          :aria-label="`Go to pricing slide ${dot}`"
          :aria-current="current === dot - 1 ? 'true' : undefined"
          class="rounded-full w-8 h-8 border border-border focus-visible:ring-2 focus-visible:ring-ring"
          :class="current === dot - 1 ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'"
          @click="api?.scrollTo(dot - 1)"
        >
          {{ dot }}
        </button>
        <CarouselNext class="static translate-x-0 translate-y-0" />
      </div>
      <p
        class="sr-only"
        aria-live="polite"
      >
        {{ count ? `Pricing slide ${current + 1} of ${count}` : '' }}
      </p>
    </Carousel>
  </div>
</template>
