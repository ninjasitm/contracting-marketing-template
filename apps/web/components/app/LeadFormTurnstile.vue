<script lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

/* eslint-disable no-unused-vars -- function type parameters */
interface TurnstileApi {
  render: (...args: [HTMLElement, Record<string, unknown>]) => string;
  reset: (...args: [string?]) => void;
  remove: (...args: [string?]) => void;
}
/* eslint-enable no-unused-vars */
declare global { interface Window { turnstile?: TurnstileApi } }

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let scriptPromise: Promise<TurnstileApi> | undefined;

// Loaded once, and only when a protected form actually mounts this component.
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  scriptPromise ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    const fail = () => { script.remove(); reject(new Error('Verification unavailable.')); };
    script.onload = () => {
      if (window.turnstile) resolve(window.turnstile);
      else fail();
    };
    script.onerror = fail;
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    scriptPromise = undefined;
    throw error;
  });
  return scriptPromise;
}
</script>

<script setup lang="ts">
const props = defineProps<{ siteKey: string; action?: string }>();
const emit = defineEmits<{ token: [token: string]; expired: []; reset: [] }>();

const container = ref<HTMLElement>();
const unavailable = ref(false);
let api: TurnstileApi | undefined;
let widgetId: string | undefined;
let unmounted = false;
let generation = 0;

function removeWidget() {
  const id = widgetId;
  widgetId = undefined;
  if (api && id !== undefined) {
    try { api.remove(id); } catch {
      container.value?.replaceChildren();
      unavailable.value = true;
    }
  }
}

function reset() {
  if (unmounted) return;
  if (api && widgetId !== undefined) {
    try { api.reset(widgetId); } catch {
      generation += 1;
      removeWidget();
      unavailable.value = true;
    }
  }
  emit('reset');
}

async function renderWidget() {
  const version = ++generation;
  removeWidget();
  unavailable.value = false;
  emit('reset');
  const siteKey = props.siteKey;
  const action = props.action;
  const active = () => !unmounted && version === generation;
  try {
    const loaded = await loadTurnstile();
    if (!active() || !container.value) return;
    api = loaded;
    widgetId = api.render(container.value, {
      sitekey: siteKey,
      ...(action ? { action } : {}),
      callback: (token: string) => { if (active()) emit('token', token); },
      'expired-callback': () => { if (active()) emit('expired'); },
      'error-callback': () => { if (active()) emit('expired'); },
    });
  } catch {
    if (active()) {
      generation += 1;
      container.value?.replaceChildren();
      unavailable.value = true;
      emit('reset');
    }
  }
}

onMounted(renderWidget);
watch(() => [props.siteKey, props.action], renderWidget, { flush: 'sync' });

onBeforeUnmount(() => {
  unmounted = true;
  generation += 1;
  removeWidget();
});

defineExpose({ reset });
</script>

<template>
  <div>
    <div ref="container" />
    <p
      v-if="unavailable"
      role="alert"
      class="text-sm text-destructive"
    >
      The verification check could not load. Please reload the page and try again.
    </p>
  </div>
</template>
