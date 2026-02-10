import type { Ref } from 'vue';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function valueUpdater<T>(
  updaterOrValue: T | ((oldValue: T) => T),
  ref: Ref<T>,
) {
  ref.value =
    typeof updaterOrValue === 'function'
      ? (updaterOrValue as (oldValue: T) => T)(ref.value)
      : updaterOrValue;
}
