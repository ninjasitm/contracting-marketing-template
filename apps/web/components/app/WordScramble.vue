<script setup lang="ts">
// Adapted from ninjasitm/nitm-marketing da649f7. MIT © 2025 NinjasInTheMachine.
// License: docs/reference/NITM_MARKETING_LICENSE.md
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { usePreferredReducedMotion } from '@vueuse/core';

const props = withDefaults(defineProps<{
  text?: string; init?: string; speed?: number; delay?: number;
  characterPool?: string; animationType?: 'random' | 'linear';
  tag?: string; loop?: boolean; animate?: boolean;
}>(), {
  text: 'Word-Scrambler', init: '', speed: 50, delay: 5,
  characterPool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#+;-',
  animationType: 'random', tag: 'span', loop: true, animate: true,
});
const reduced = usePreferredReducedMotion();
const word = ref(props.text);
let mounted = false;
let timer: ReturnType<typeof setTimeout> | undefined;
function stop() { clearTimeout(timer); timer = undefined; }
function restart() {
  stop();
  word.value = props.text;
  if (!mounted || !props.animate || reduced.value === 'reduce' || !props.text) return;
  const speed = Number.isFinite(props.speed) && props.speed > 0 ? Math.max(16, props.speed) : 50;
  const delay = Number.isFinite(props.delay) ? Math.min(1000, Math.max(0, Math.floor(props.delay))) : 5;
  const chars = Array.from(props.text);
  const pool = Array.from(props.characterPool || props.text);
  const order = chars.map((_, i) => i);
  if (props.animationType === 'random') {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j]!, order[i]!];
    }
  }
  const revealed = new Set<number>();
  let tick = 0;
  word.value = props.init || props.text;
  function step() {
    if (++tick > delay) revealed.add(order[tick - delay - 1]!);
    word.value = chars.map((char, i) => revealed.has(i) || /\s/.test(char) ? char : pool[Math.floor(Math.random() * pool.length)]).join('');
    if (revealed.size >= chars.length) {
      word.value = props.text;
      if (props.loop) timer = setTimeout(restart, 1000);
    } else timer = setTimeout(step, speed);
  }
  timer = setTimeout(step, speed);
}
watch([() => ({ ...props }), reduced], restart, { deep: true });
onMounted(() => { mounted = true; restart(); });
onBeforeUnmount(() => { mounted = false; stop(); });
</script>

<template>
  <component :is="tag">
    <span class="sr-only">{{ text }}</span><span aria-hidden="true">{{ word }}</span>
  </component>
</template>
