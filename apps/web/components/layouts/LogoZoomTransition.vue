<script setup lang="ts">
// Adapted from ninjasitm/nitm-marketing da649f7. MIT © 2025 NinjasInTheMachine.
// License: docs/reference/NITM_MARKETING_LICENSE.md
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { usePreferredReducedMotion } from '@vueuse/core';
const props = withDefaults(defineProps<{
  show: boolean; logoSrc?: string; label?: string; duration?: number;
}>(), { logoSrc: '', label: 'Loading…', duration: 700 });
const emit = defineEmits<{ loaded: []; complete: [] }>();
const reduced = usePreferredReducedMotion();
const active = ref(false);
const durationMs = computed(() => Number.isFinite(props.duration) ? Math.min(5000, Math.max(0, props.duration)) : 700);
const durationCss = computed(() => `${durationMs.value}ms`);
let mounted = false;
let timer: ReturnType<typeof setTimeout> | undefined;
function finish() {
  if (!active.value) return;
  clearTimeout(timer);
  active.value = false;
  emit('loaded'); emit('complete');
}
function restart() {
  clearTimeout(timer);
  active.value = mounted && props.show;
  if (!active.value) return;
  if (reduced.value === 'reduce' || durationMs.value === 0) finish();
  else timer = setTimeout(finish, durationMs.value);
}
watch([() => props.show, durationMs, reduced], restart);
onMounted(() => { mounted = true; restart(); });
onBeforeUnmount(() => { mounted = false; clearTimeout(timer); });
</script>

<template>
  <div
    v-if="active"
    role="status"
    class="brand-transition pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background text-foreground"
  >
    <img
      v-if="logoSrc"
      :src="logoSrc"
      alt=""
      class="brand-logo h-32 w-32 object-contain"
    >
    <span>{{ label }}</span>
  </div>
</template>

<style scoped>
.brand-transition { animation: brand-fade v-bind(durationCss) ease-in both; }
.brand-logo { animation: brand-zoom v-bind(durationCss) ease-in both; }
@keyframes brand-fade { 0%, 50% { opacity: 1; } 100% { opacity: 0; } }
@keyframes brand-zoom { from { transform: scale(1); } to { transform: scale(2); } }
@media (prefers-reduced-motion: reduce) { .brand-transition { display: none; } }
</style>
