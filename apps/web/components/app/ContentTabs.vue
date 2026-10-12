<!-- Adapted from ninjasitm/nitm-marketing courses/CourseSessionTabs @ da649f7. MIT: docs/reference/NITM_MARKETING_LICENSE.md. -->
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ContentTabDetail from './ContentTabDetail.vue';
import type { ContentTabItem } from '@/types/content-tabs';
const props = withDefaults(defineProps<{ items: ContentTabItem[]; modelValue?: string; defaultValue?: string; title?: string; description?: string; label?: string }>(), { label: 'Content sections' });
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
const local = ref(props.defaultValue);
const selected = computed(() => props.modelValue !== undefined ? props.modelValue : props.items.some(item => item.id === local.value) ? local.value : props.items[0]?.id);
const desktop = useMediaQuery('(min-width: 1024px)');
function select(value: string | number) { local.value = String(value); emit('update:modelValue', String(value)); }
</script>
<template>
  <Tabs
    v-if="items.length"
    :model-value="selected"
    :orientation="desktop ? 'vertical' : 'horizontal'"
    class="flex flex-col lg:flex-row gap-8"
    @update:model-value="select"
  >
    <div class="lg:w-1/3 min-w-0">
      <h2
        v-if="title"
        class="text-3xl text-foreground"
      >
        {{ title }}
      </h2>
      <p
        v-if="description"
        class="mt-4 text-muted-foreground"
      >
        {{ description }}
      </p>
      <TabsList
        :aria-label="label"
        class="mt-6 h-auto w-full justify-start overflow-x-auto lg:flex-col bg-muted p-2"
      >
        <TabsTrigger
          v-for="item in items"
          :key="item.id"
          :value="item.id"
          class="lg:w-full lg:justify-start whitespace-nowrap"
        >
          {{ item.title }}
        </TabsTrigger>
      </TabsList>
    </div>
    <div class="flex-1 min-w-0">
      <TabsContent
        v-for="item in items"
        :key="item.id"
        :value="item.id"
      >
        <ContentTabDetail :item="item" /><slot
          name="detail"
          :item="item"
        />
      </TabsContent>
    </div>
  </Tabs>
  <slot
    v-else
    name="empty"
  />
</template>
