<!-- Adapted from ninjasitm/nitm-marketing @ da649f7. Copyright (c) 2025 Ninjas In The Machine. MIT: docs/reference/NITM_MARKETING_LICENSE.md. -->
<script lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import type { BackgroundEffectName, BackgroundEffectOptions, BackgroundEffectInstance } from '@/types/background-effect';
let dotsModule: Promise<typeof import('vanta/dist/vanta.dots.min')> | undefined;
function loadDots(three: unknown) {
  // Vanta 0.5.24 DOTS captures window.THREE at module evaluation, unlike NET/WAVES.
  // Share the import so concurrent components cannot overlap temporary globals.
  return dotsModule ??= (async () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'THREE');
    Object.defineProperty(window, 'THREE', { configurable: true, writable: true, value: three });
    try { return await import('vanta/dist/vanta.dots.min'); }
    finally {
      if (descriptor) Object.defineProperty(window, 'THREE', descriptor);
      else Reflect.deleteProperty(window, 'THREE');
    }
  })().catch(error => { dotsModule = undefined; throw error; });
}
</script>
<script setup lang="ts">
type ActiveBackgroundEffectName = Exclude<BackgroundEffectName, 'none'>;
type ThemeMode = 'light' | 'dark';
type VantaEffectInstance = BackgroundEffectInstance;
type RuntimeInstance = VantaEffectInstance & {
  renderer?: { domElement?: HTMLCanvasElement; dispose?(): void; forceContextLoss?(): void };
  camera?: unknown;
  p5renderer?: { canvas?: HTMLCanvasElement };
};
type VantaEffectModule = {
  default: (options: Record<string, unknown>) => VantaEffectInstance;
};

const props = withDefaults(defineProps<{
  effect?: BackgroundEffectName;
  options?: BackgroundEffectOptions;
  fade?: 'none' | 'linear' | 'step';
  mode?: 'section' | 'fixed';
  disabled?: boolean;
}>(), {
  effect: 'none',
  fade: 'none',
  mode: 'section',
});

const emit = defineEmits<{ 'active-change': [active: boolean] }>();
const target = ref<HTMLElement | null>(null);
const active = ref(false);
const themeMode = ref<ThemeMode>('light');
let instance: RuntimeInstance | null = null;
let resizeHandler: (() => void) | null = null;
let themeObserver: MutationObserver | null = null;
let motionQuery: MediaQueryList | null = null;
let generation = 0;
let initializing = false;
let mounted = false;
const visible = ref(true);
let visibilityObserver: IntersectionObserver | null = null;

const hasEffect = computed(() => !props.disabled && visible.value && ['waves', 'net', 'dots', 'topology'].includes(props.effect));
const effectName = computed<ActiveBackgroundEffectName | null>(() =>
  hasEffect.value ? props.effect as ActiveBackgroundEffectName : null,
);
const loaders: Record<ActiveBackgroundEffectName, () => Promise<VantaEffectModule>> = {
  dots: () => import('vanta/dist/vanta.dots.min'),
  net: () => import('vanta/dist/vanta.net.min'),
  topology: () => import('vanta/dist/vanta.topology.min'),
  waves: () => import('vanta/dist/vanta.waves.min'),
};
const presets: Record<ThemeMode, Record<ActiveBackgroundEffectName, BackgroundEffectOptions>> = {
  dark: {
    waves: { backgroundColor: 0x11192e, color: 0x0e1723, gyroControls: false, mouseControls: true, shininess: 12, touchControls: true, waveHeight: 10, waveSpeed: 0.85, zoom: 0.85, scale: 1, scaleMobile: 1 },
    net: { backgroundColor: 0x020617, color: 0x475569, maxDistance: 20, mouseControls: true, points: 10, scale: 1, scaleMobile: 1, showDots: true, spacing: 18, touchControls: true },
    dots: { backgroundColor: 0x020617, color: 0x64748b, color2: 0x334155, mouseControls: true, scale: 1, scaleMobile: 1, showLines: false, size: 3, spacing: 24, touchControls: true },
    topology: { backgroundColor: 0x020617, color: 0x475569, mouseControls: true, scale: 1, scaleMobile: 1, touchControls: true },
  },
  light: {
    waves: { backgroundColor: 0xffffff, color: 0x9ca3af, gyroControls: false, mouseControls: true, shininess: 15, touchControls: true, waveHeight: 12, waveSpeed: 0.75, zoom: 0.92, scale: 1, scaleMobile: 1 },
    net: { backgroundColor: 0xf8fafc, color: 0x94a3b8, maxDistance: 18, mouseControls: true, points: 9, scale: 1, scaleMobile: 1, showDots: true, spacing: 20, touchControls: true },
    dots: { backgroundColor: 0xf8fafc, color: 0x94a3b8, color2: 0xcbd5e1, mouseControls: true, scale: 1, scaleMobile: 1, showLines: false, size: 2.8, spacing: 26, touchControls: true },
    topology: { backgroundColor: 0xf8fafc, color: 0x94a3b8, mouseControls: true, scale: 1, scaleMobile: 1, touchControls: true },
  },
};
const options = computed(() => {
  if (!effectName.value) return {};
  const effectOptions = { ...props.options };
  delete effectOptions.respectReducedMotion;
  return { ...presets[themeMode.value][effectName.value], ...effectOptions };
});
const maskStyle = computed(() => props.fade === 'linear'
  ? { WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 88%)', maskImage: 'linear-gradient(to bottom, black 40%, transparent 88%)' }
  : {});
const stepStyle = computed(() => {
  if (props.fade !== 'step') return {};
  const [r, g, b] = themeMode.value === 'dark' ? [25, 25, 25] : [179, 179, 179];
  return { height: '40%', background: `linear-gradient(to bottom, transparent 0%, transparent 30%, rgba(${r},${g},${b},0.35) 30%, rgba(${r},${g},${b},0.35) 60%, rgba(${r},${g},${b},0.7) 60%, rgba(${r},${g},${b},0.7) 85%, rgb(${r},${g},${b}) 85%)` };
});

function destroy() {
  if (typeof window !== 'undefined' && resizeHandler) window.removeEventListener('resize', resizeHandler);
  resizeHandler = null;
  const renderer = instance?.renderer;
  // Vanta's swallowed init failure detaches the canvas but destroy removes it again.
  if (renderer?.domElement && !renderer.domElement.parentNode && target.value) target.value.appendChild(renderer.domElement);
  try { instance?.destroy(); }
  catch (error) { console.warn('[AppBackgroundEffect]: Cleanup failed.', error); }
  finally { renderer?.dispose?.(); renderer?.forceContextLoss?.(); }
  instance = null;
  active.value = false;
  emit('active-change', false);
  if (target.value) target.value.innerHTML = '';
}

function webGLAvailable() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

async function initialize(currentGeneration: number) {
  if (initializing || !effectName.value || !target.value || typeof window === 'undefined') return;
  initializing = true;
  const name = effectName.value;
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      destroy();
      return;
    }
    if (name !== 'topology' && !webGLAvailable()) {
      destroy();
      return;
    }
    const runtime = name === 'topology' ? { p5: (await import('p5')).default } : { THREE: await import('three') };
    const effectModule = name === 'dots' ? await loadDots(runtime.THREE) : await loaders[name]();
    if (!mounted || currentGeneration !== generation || !target.value || name !== effectName.value || motionQuery?.matches) return;
    destroy();
    const effect = effectModule.default;
    instance = effect({ ...options.value, el: target.value, ...runtime, minHeight: 200, minWidth: 200 });
    const canvas = name === 'topology' ? instance.p5renderer?.canvas : instance.renderer?.domElement;
    if (!canvas || canvas.parentNode !== target.value || !canvas.width || !canvas.height || (name !== 'topology' && !instance.camera)) {
      throw new Error('Vanta returned an uninitialized renderer');
    }
    active.value = true;
    emit('active-change', true);
    resizeHandler = () => instance ? instance.resize?.() : void initialize(generation);
    window.addEventListener('resize', resizeHandler);
  } catch (error) {
    console.warn(`[AppBackgroundEffect]: Failed to initialize ${name} background.`, error);
    if (currentGeneration === generation) destroy();
  } finally {
    initializing = false;
    if (mounted && currentGeneration !== generation && effectName.value) requestInitialize();
  }
}

function requestInitialize() {
  const currentGeneration = ++generation;
  destroy();
  if (effectName.value) void initialize(currentGeneration);
}

function observeTheme() {
  if (typeof window === 'undefined') return;
  themeMode.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  themeObserver = new MutationObserver(() => {
    themeMode.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
}

function onMotionPreferenceChange(event: MediaQueryListEvent) {
  if (event.matches) {
    generation++;
    destroy();
  } else if (mounted && effectName.value) {
    requestInitialize();
  }
}

function observeReducedMotion() {
  if (typeof window === 'undefined') return;
  motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null;
  motionQuery?.addEventListener('change', onMotionPreferenceChange);
}

watch([effectName, () => JSON.stringify(props.options ?? {}), themeMode], () => {
  if (mounted) requestInitialize();
});
watch(target, () => {
  if (mounted && target.value && effectName.value && !active.value) requestInitialize();
});
onMounted(() => {
  mounted = true; observeTheme(); observeReducedMotion();
  if (target.value && typeof IntersectionObserver !== 'undefined') {
    visible.value = false;
    visibilityObserver = new IntersectionObserver(entries => { visible.value = Boolean(entries[0]?.isIntersecting); });
    visibilityObserver.observe(target.value);
  }
  requestInitialize();
});
onUnmounted(() => {
  mounted = false;
  generation++;
  themeObserver?.disconnect();
  visibilityObserver?.disconnect();
  motionQuery?.removeEventListener('change', onMotionPreferenceChange);
  motionQuery = null;
  destroy();
});
</script>

<template>
  <div
    class="pointer-events-none bg-gradient-to-b from-background to-muted"
    :class="mode === 'fixed' ? 'fixed inset-0' : 'absolute inset-0'"
    aria-hidden="true"
  >
    <div
      ref="target"
      class="absolute inset-0 overflow-hidden pointer-events-none"
      :style="maskStyle"
      aria-hidden="true"
    />
    <div
      v-if="fade === 'step'"
      class="absolute bottom-0 left-0 right-0 pointer-events-none z-[5]"
      :style="stepStyle"
      aria-hidden="true"
    />
  </div>
</template>
