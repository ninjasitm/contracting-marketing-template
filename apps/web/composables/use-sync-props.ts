import type { WritableComputedRef } from 'vue';
import { computed } from 'vue';

export const useSyncProps = <T>(
  props: Record<string, any>,
  key: string,
  emit: (
    _event: 'update:modelValue' | `update:${string}`,
    ..._args: any[]
  ) => void,
): WritableComputedRef<T> => {
  return computed({
    get() {
      return props[key];
    },
    set(value: T) {
      emit(`update:${key}` as any, value);
    },
  });
};
