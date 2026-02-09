---
applyTo: '**/*.vue'
description: 'Vue 3 Composition API patterns and conventions'
---

# Vue 3 Instructions

## Vue Version

**Vue:** 3.5.14
**API Style:** Composition API with `<script setup>`
**TypeScript:** Enabled and required

## Component Structure

### Single File Component (SFC) Format

```vue
<script setup lang="ts">
// TypeScript is required
// Imports, reactive state, lifecycle hooks, etc.
</script>

<template>
  <!-- Component template -->
</template>

<style scoped>
/* Component styles (prefer Tailwind classes) */
</style>
```

### Component Definition with Props & Emits

```vue
<script setup lang="ts">
// Define props with TypeScript
interface Props {
  title: string;
  count?: number;
  items: string[];
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
});

// Define emits with TypeScript
const emit = defineEmits<{
  update: [value: number];
  delete: [id: string];
  submit: [data: FormData];
}>();

// Use props and emits
console.log(props.title);
emit('update', props.count + 1);
</script>

<template>
  <div>
    <h2>{{ title }}</h2>
    <button @click="emit('update', count + 1)">Count: {{ count }}</button>
  </div>
</template>
```

## Reactivity

### Reactive State

```typescript
import { ref, reactive, computed, readonly } from 'vue';

// Primitive values - use ref
const count = ref(0);
const message = ref('Hello');
const isActive = ref(false);

// Access value with .value
console.log(count.value); // 0
count.value++;

// Objects - use reactive
const user = reactive({
  name: 'John',
  email: 'john@example.com',
  age: 30,
});

// Access directly (no .value)
console.log(user.name); // 'John'
user.age++;

// Computed values
const doubled = computed(() => count.value * 2);
const fullName = computed(() => `${user.name} (${user.age})`);

// Read-only state
const config = readonly(
  reactive({
    apiUrl: 'https://api.example.com',
  }),
);
```

### Reactive Destructuring

**❌ Don't - Loses reactivity:**

```typescript
const { name, email } = user; // Not reactive!
```

**✅ Do - Preserves reactivity:**

```typescript
import { toRefs } from 'vue';

const { name, email } = toRefs(user); // Reactive refs
// or
const nameRef = toRef(user, 'name'); // Single property ref
```

## Lifecycle Hooks

```typescript
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
} from 'vue';

onBeforeMount(() => {
  console.log('[Component]: Before mount');
});

onMounted(() => {
  console.log('[Component]: Mounted');
  // DOM is available
  // Good for third-party library initialization
});

onBeforeUpdate(() => {
  console.log('[Component]: Before update');
});

onUpdated(() => {
  console.log('[Component]: Updated');
});

onBeforeUnmount(() => {
  console.log('[Component]: Before unmount');
  // Cleanup subscriptions, event listeners
});

onUnmounted(() => {
  console.log('[Component]: Unmounted');
});
```

**⚠️ Nuxt Note:** For data fetching, prefer `useAsyncData()` over `onMounted()`.

## Watchers

### watch

```typescript
import { watch } from 'vue';

// Watch single ref
watch(count, (newValue, oldValue) => {
  console.log(`Count changed: ${oldValue} → ${newValue}`);
});

// Watch multiple sources
watch([count, message], ([newCount, newMsg], [oldCount, oldMsg]) => {
  console.log('Multiple values changed');
});

// Watch reactive object property
watch(
  () => user.name,
  (newName) => {
    console.log('Name changed:', newName);
  },
);

// Watch entire reactive object (deep)
watch(
  user,
  (newUser) => {
    console.log('User changed:', newUser);
  },
  { deep: true },
);

// Watch with options
watch(
  count,
  (newValue) => {
    // ...
  },
  {
    immediate: true, // Run immediately with current value
    deep: true, // Deep watch (for objects)
    flush: 'post', // Run after component updates
  },
);
```

### watchEffect

```typescript
import { watchEffect } from 'vue';

// Automatically tracks dependencies
watchEffect(() => {
  console.log(`Count is ${count.value}`);
  console.log(`Message is ${message.value}`);
  // Re-runs whenever count or message changes
});

// With cleanup
watchEffect((onCleanup) => {
  const timer = setInterval(() => {
    console.log('Tick');
  }, 1000);

  onCleanup(() => {
    clearInterval(timer);
  });
});
```

## Component Communication

### Parent → Child (Props)

```vue
<!-- Parent.vue -->
<script setup lang="ts">
import Child from './Child.vue';

const items = ref(['a', 'b', 'c']);
</script>

<template>
  <Child :items="items" :count="42" />
</template>
```

```vue
<!-- Child.vue -->
<script setup lang="ts">
interface Props {
  items: string[];
  count: number;
}

const props = defineProps<Props>();
</script>

<template>
  <div>Count: {{ count }}</div>
  <ul>
    <li v-for="item in items" :key="item">{{ item }}</li>
  </ul>
</template>
```

### Child → Parent (Events)

```vue
<!-- Child.vue -->
<script setup lang="ts">
const emit = defineEmits<{
  submit: [data: { name: string; email: string }];
  cancel: [];
}>();

const handleSubmit = () => {
  emit('submit', { name: 'John', email: 'john@example.com' });
};
</script>

<template>
  <button @click="handleSubmit">Submit</button>
  <button @click="emit('cancel')">Cancel</button>
</template>
```

```vue
<!-- Parent.vue -->
<script setup lang="ts">
const handleSubmit = (data: { name: string; email: string }) => {
  console.log('Received:', data);
};

const handleCancel = () => {
  console.log('Cancelled');
};
</script>

<template>
  <Child @submit="handleSubmit" @cancel="handleCancel" />
</template>
```

### v-model (Two-way Binding)

```vue
<!-- Child.vue -->
<script setup lang="ts">
const modelValue = defineModel<string>(); // Vue 3.4+

// Or manually:
// const props = defineProps<{ modelValue: string }>()
// const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <input :value="modelValue" @input="modelValue = $event.target.value" />
</template>
```

```vue
<!-- Parent.vue -->
<script setup lang="ts">
const text = ref('');
</script>

<template>
  <Child v-model="text" />
  <p>Value: {{ text }}</p>
</template>
```

### Multiple v-models

```vue
<!-- Child.vue -->
<script setup lang="ts">
const firstName = defineModel<string>('firstName');
const lastName = defineModel<string>('lastName');
</script>

<template>
  <input v-model="firstName" placeholder="First name" />
  <input v-model="lastName" placeholder="Last name" />
</template>
```

```vue
<!-- Parent.vue -->
<template>
  <Child v-model:first-name="first" v-model:last-name="last" />
</template>
```

## Template Directives

### Conditional Rendering

```vue
<template>
  <!-- v-if: Conditional rendering -->
  <div v-if="isVisible">Visible</div>
  <div v-else-if="isAlternate">Alternate</div>
  <div v-else>Default</div>

  <!-- v-show: Toggle display (keeps in DOM) -->
  <div v-show="isActive">Active</div>
</template>
```

### List Rendering

```vue
<script setup lang="ts">
const items = ref([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' },
]);
</script>

<template>
  <!-- Always use :key -->
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>

  <!-- With index -->
  <div v-for="(item, index) in items" :key="item.id">
    {{ index + 1 }}. {{ item.name }}
  </div>

  <!-- Object iteration -->
  <div v-for="(value, key) in user" :key="key">{{ key }}: {{ value }}</div>
</template>
```

### Event Handling

```vue
<template>
  <!-- Basic -->
  <button @click="handleClick">Click</button>

  <!-- With parameters -->
  <button @click="handleClick('arg')">Click</button>

  <!-- Inline handler -->
  <button @click="count++">Increment</button>

  <!-- Event modifiers -->
  <form @submit.prevent="onSubmit">
    <input @keyup.enter="search" />
  </form>

  <!-- Multiple events -->
  <input @input="handleInput" @blur="handleBlur" @focus="handleFocus" />
</template>
```

### Class & Style Binding

```vue
<script setup lang="ts">
const isActive = ref(true);
const hasError = ref(false);
const activeColor = ref('red');
</script>

<template>
  <!-- Class object syntax -->
  <div :class="{ active: isActive, error: hasError }">Content</div>

  <!-- Class array syntax -->
  <div :class="[isActive ? 'active' : '', 'base-class']">Content</div>

  <!-- With Tailwind and cn() helper -->
  <div :class="cn('base', isActive && 'active', 'another')">Content</div>

  <!-- Style object syntax -->
  <div :style="{ color: activeColor, fontSize: '14px' }">Content</div>

  <!-- Style array syntax -->
  <div :style="[baseStyles, overrideStyles]">Content</div>
</template>
```

## Slots

### Default Slot

```vue
<!-- Parent.vue -->
<template>
  <Card>
    <p>This goes in the default slot</p>
  </Card>
</template>
```

```vue
<!-- Card.vue -->
<template>
  <div class="card">
    <slot>Default content if no slot provided</slot>
  </div>
</template>
```

### Named Slots

```vue
<!-- Parent.vue -->
<template>
  <Card>
    <template #header>
      <h2>Title</h2>
    </template>

    <template #default>
      <p>Main content</p>
    </template>

    <template #footer>
      <button>Action</button>
    </template>
  </Card>
</template>
```

```vue
<!-- Card.vue -->
<template>
  <div class="card">
    <div class="header">
      <slot name="header" />
    </div>

    <div class="body">
      <slot />
    </div>

    <div class="footer">
      <slot name="footer" />
    </div>
  </div>
</template>
```

### Scoped Slots

```vue
<!-- List.vue -->
<script setup lang="ts">
const items = ref([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
]);
</script>

<template>
  <div v-for="item in items" :key="item.id">
    <slot :item="item" :index="items.indexOf(item)" />
  </div>
</template>
```

```vue
<!-- Parent.vue -->
<template>
  <List>
    <template #default="{ item, index }">
      <div>{{ index + 1 }}. {{ item.name }}</div>
    </template>
  </List>
</template>
```

## Composables

### Creating Composables

```typescript
// composables/useCounter.ts
import { ref, computed } from 'vue';

export const useCounter = (initialValue = 0) => {
  const count = ref(initialValue);

  const doubled = computed(() => count.value * 2);

  const increment = () => {
    count.value++;
  };

  const decrement = () => {
    count.value--;
  };

  const reset = () => {
    count.value = initialValue;
  };

  return {
    count: readonly(count), // Expose as readonly
    doubled,
    increment,
    decrement,
    reset,
  };
};
```

### Using Composables

```vue
<script setup lang="ts">
const { count, doubled, increment, decrement, reset } = useCounter(10);
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Doubled: {{ doubled }}</p>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
    <button @click="reset">Reset</button>
  </div>
</template>
```

## Template Refs

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';

const inputRef = ref<HTMLInputElement>();
const componentRef = ref<InstanceType<typeof ChildComponent>>();

onMounted(() => {
  // Access DOM element
  inputRef.value?.focus();

  // Access component instance
  componentRef.value?.someMethod();
});
</script>

<template>
  <input ref="inputRef" />
  <ChildComponent ref="componentRef" />
</template>
```

## Best Practices

### ✅ Do

- Use `<script setup lang="ts">` for all components
- Define props and emits with TypeScript interfaces
- Use `ref()` for primitives, `reactive()` for objects
- Always provide `:key` in `v-for`
- Use computed properties for derived state
- Clean up side effects in watchers and lifecycle hooks
- Use composables for reusable logic
- Prefer Tailwind classes over `<style>`
- Use `defineModel()` for v-model (Vue 3.4+)
- Handle loading and error states in templates

### ❌ Don't

- Use Options API (use Composition API)
- Destructure reactive objects without `toRefs()`
- Forget `.value` when accessing refs
- Mutate props directly
- Use `v-for` without `:key`
- Access DOM in `<script>` before mounting
- Create side effects in computed properties
- Use `onMounted()` for data fetching (use `useAsyncData()` in Nuxt)
- Ignore TypeScript errors

## VueUse Integration

This project includes `@vueuse/core` for common composables:

```typescript
import {
  useLocalStorage,
  useMouse,
  useWindowSize,
  useMediaQuery,
  useDebounce,
} from '@vueuse/core';

// Local storage
const token = useLocalStorage('auth-token', '');

// Mouse position
const { x, y } = useMouse();

// Window size
const { width, height } = useWindowSize();

// Media query
const isMobile = useMediaQuery('(max-width: 768px)');

// Debounce
const debouncedSearch = useDebounce(searchQuery, 300);
```

## Related Documentation

- [Vue 3 Docs](https://vuejs.org)
- [Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [VueUse](https://vueuse.org)
- [Nuxt Instructions](./nuxt.instructions.md)
- [AGENTS.md](../../AGENTS.md)

---

**Last Updated:** 2026-02-09
