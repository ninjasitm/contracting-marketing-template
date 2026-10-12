<!-- Adapted from ninjasitm/nitm-marketing courses/FilterSection @ da649f7. MIT: docs/reference/NITM_MARKETING_LICENSE.md. -->
<script setup lang="ts">
import { useId } from 'vue';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
interface Facet { key: string; label: string; placeholder?: string; options: { label: string; value: string }[] }
const props = withDefaults(defineProps<{ facets: Facet[]; modelValue: Record<string, string>; searchQuery?: string; searchPlaceholder?: string; searchLabel?: string; resetLabel?: string }>(), { searchQuery: '', searchPlaceholder: 'Search', searchLabel: 'Search', resetLabel: 'Reset filters' });
const emit = defineEmits<{ 'update:modelValue': [value: Record<string, string>]; 'update:searchQuery': [value: string]; reset: [] }>();
const id = useId();
function update(key: string, value: unknown) { if (typeof value === 'string' && props.facets.find(facet => facet.key === key)?.options.some(option => option.value === value)) emit('update:modelValue', { ...props.modelValue, [key]: value }); }
function reset() { emit('update:modelValue', {}); emit('update:searchQuery', ''); emit('reset'); }
</script>
<template>
  <div class="flex flex-wrap items-end gap-4 rounded-2xl bg-muted p-6">
    <div
      v-for="(facet, index) in facets"
      :key="facet.key"
      class="flex-1 min-w-[180px]"
    >
      <label
        :id="`${id}-label-${index}`"
        class="block text-sm mb-2 text-foreground"
      >{{ facet.label }}</label>
      <Select
        :model-value="modelValue[facet.key] || ''"
        @update:model-value="update(facet.key, $event)"
      >
        <SelectTrigger :aria-labelledby="`${id}-label-${index}`">
          <SelectValue :placeholder="facet.placeholder || `All ${facet.label}`" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in facet.options.filter(option => option.value)"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div class="flex-1 min-w-[180px]">
      <label
        :for="`${id}-search`"
        class="block text-sm mb-2 text-foreground"
      >{{ searchLabel }}</label>
      <Input
        :id="`${id}-search`"
        type="search"
        :model-value="searchQuery"
        :placeholder="searchPlaceholder"
        @update:model-value="emit('update:searchQuery', String($event))"
      />
    </div>
    <Button
      type="button"
      variant="outline"
      @click="reset"
    >
      {{ resetLabel }}
    </Button>
  </div>
</template>
