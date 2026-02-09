---
applyTo: '**/*.{vue,ts,js}'
description: 'Nuxt 4 patterns and conventions for contracting-marketing-template'
---

# Nuxt 4 Instructions

## Framework Context

**Framework:** Nuxt 4.3 (with Vue 3.5)
**Architecture:** Layer-based (root layer + app extension)
**Rendering:** SPA mode (`ssr: false`)
**Dev Server:** Port 3000, Host 0.0.0.0
**Deploy:** Cloudflare Workers

## Project Structure

### Layer Architecture

```
/ (root - Nuxt Layer)
├── nuxt.config.ts              # Layer configuration
├── app.config.ts               # Runtime app config
├── app/                        # App extends root layer
│   ├── nuxt.config.ts          # App-specific overrides
│   ├── pages/                  # File-based routing
│   └── stores/                 # App-specific stores
├── components/                 # Auto-imported components
├── composables/                # Auto-imported composables
├── layouts/                    # Layouts (app uses these)
├── server/                     # Nitro server
└── stores/                     # Shared stores
```

### Auto-imports

**Automatically imported:**

- Components from `components/`
- Composables from `composables/`
- Utils from `utils/` (via Nuxt configuration)
- Pinia stores (use with `useStoreName()`)
- Vue APIs (`ref`, `computed`, `watch`, etc.)
- Nuxt APIs (`navigateTo`, `useFetch`, `useAsyncData`, etc.)

**Manual imports required:**

- `lib/utils.ts` utilities (e.g., `cn()` helper)
- Type definitions

## File-based Routing

### Route Structure

```
app/pages/
  index.vue                    → /
  about/
    index.vue                  → /about
  services/
    index.vue                  → /services
  work/
    index.vue                  → /work
    [slug].vue                 → /work/:slug
  posts/
    [slug].vue                 → /posts/:slug
  contact/
    index.vue                  → /contact
  process/
    index.vue                  → /process
```

### Page Metadata

```vue
<script setup lang="ts">
definePageMeta({
  layout: 'page',
  middleware: ['auth'], // if needed
  title: 'Page Title',
  description: 'Page description',
});
</script>
```

### Navigation

```vue
<script setup lang="ts">
// Programmatic navigation
const router = useRouter();
await navigateTo('/about');
await navigateTo({ name: 'work-slug', params: { slug: 'project-1' } });

// Link component
</script>

<template>
  <NuxtLink to="/about">About</NuxtLink>
  <NuxtLink :to="{ name: 'work-slug', params: { slug } }"> View Work </NuxtLink>
</template>
```

## Layouts

### Default Layout

```vue
<!-- layouts/page.vue -->
<template>
  <div>
    <Header />
    <main>
      <slot />
    </main>
    <Footer />
  </div>
</template>
```

### Using Layouts

```vue
<script setup lang="ts">
definePageMeta({
  layout: 'page',
});
</script>
```

## Content Management (@nuxt/content)

### Querying Content

```typescript
// Query all items
const { data: works } = await useAsyncData('works', () =>
  queryContent('_work/data').sort({ date: -1 }).find(),
);

// Query single item by slug
const route = useRoute();
const { data: work } = await useAsyncData(`work-${route.params.slug}`, () =>
  queryContent('_work/data', route.params.slug as string).findOne(),
);

// Query with filters
const { data: posts } = await useAsyncData('featured-posts', () =>
  queryContent('_posts').where({ featured: true }).limit(3).find(),
);

// Query page configuration
const { data: pageConfig } = await useAsyncData('home-config', () =>
  queryContent('_pages', 'home').findOne(),
);
```

### Content Types

| Type         | Location                            | Format   | Usage               |
| ------------ | ----------------------------------- | -------- | ------------------- |
| Pages        | `content/_pages/*.json`             | JSON     | Page configuration  |
| Work         | `content/_work/data/*.md`           | Markdown | Portfolio items     |
| Posts        | `content/_posts/*.md`               | Markdown | Blog posts          |
| Team         | `content/_about/teamMembers/*.json` | JSON     | Team members        |
| Testimonials | `content/_testimonials/*.md`        | Markdown | Client testimonials |
| Config       | `content/config.json`               | JSON     | Site settings       |

### useContent Composable

```typescript
// composables/useContent.ts provides typed access
const { getPageContent, getWorkItems, getPosts } = useContent();

const homeConfig = await getPageContent('home');
const works = await getWorkItems();
const posts = await getPosts({ limit: 5 });
```

## Server API (Nitro)

### API Routes

```typescript
// server/api/contact.post.ts
export default defineEventHandler(async (event) => {
  console.info('[API] [/contact]: Processing contact form');

  // Read request body
  const body = await readBody(event);

  // Validate
  if (!body.email) {
    throw createError({
      statusCode: 400,
      message: 'Email is required',
    });
  }

  // Process
  try {
    await sendEmail(body);
    return { success: true };
  } catch (error) {
    console.error('[API] [/contact]: Failed to send email', { error });
    throw createError({
      statusCode: 500,
      message: 'Failed to send email',
    });
  }
});
```

### Using Server Routes

```vue
<script setup lang="ts">
const submit = async (data: ContactForm) => {
  try {
    const result = await $fetch('/api/contact', {
      method: 'POST',
      body: data,
    });
    console.log('Success:', result);
  } catch (error) {
    console.error('Failed:', error);
  }
};
</script>
```

## Configuration

### Runtime Config

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Private (server-only)
    apiSecret: '',

    // Public (exposed to client)
    public: {
      apiBase: '',
      siteUrl: '',
    },
  },
});
```

**Usage:**

```typescript
const config = useRuntimeConfig();
console.log(config.public.apiBase); // Client-side OK
console.log(config.apiSecret); // Server-side only
```

### App Config

```typescript
// app.config.ts
export default defineAppConfig({
  title: 'Company Name',
  description: 'Description',
  companyName: 'Company Name',
  // ... site-wide settings
});
```

**Usage:**

```typescript
const appConfig = useAppConfig();
console.log(appConfig.title);
```

## State Management (Pinia)

### Store Definition

```typescript
// stores/use-identity.ts
import { defineStore } from 'pinia';

export const useIdentity = defineStore('identity', {
  state: () => ({
    user: null as User | null,
    isAuthenticated: false,
  }),

  getters: {
    userName: (state) => state.user?.name ?? 'Guest',
  },

  actions: {
    setUser(user: User) {
      console.info('[IdentityStore] [setUser]: Updating user | id:', user.id);
      this.user = user;
      this.isAuthenticated = true;
    },

    clearUser() {
      console.info('[IdentityStore] [clearUser]: Clearing user');
      this.user = null;
      this.isAuthenticated = false;
    },
  },
});
```

### Using Stores

```vue
<script setup lang="ts">
const identity = useIdentity();

// Access state
console.log(identity.user);

// Access getters
console.log(identity.userName);

// Call actions
identity.setUser({ id: 1, name: 'John' });
</script>
```

## Composables

### Creating Composables

```typescript
// composables/useSeoConfig.ts
export const useSeoConfig = (options: SeoOptions) => {
  const config = useAppConfig();

  const title = computed(() =>
    options.title ? `${options.title} | ${config.title}` : config.title,
  );

  useHead({
    title,
    meta: [
      {
        name: 'description',
        content: options.description || config.description,
      },
    ],
  });
};
```

### Using Composables

```vue
<script setup lang="ts">
useSeoConfig({
  title: 'About Us',
  description: 'Learn more about our team',
});
</script>
```

## Data Fetching

### useAsyncData

**Recommended for content/data fetching:**

```typescript
const { data, pending, error, refresh } = await useAsyncData(
  'unique-key',
  () => queryContent('_posts').find(),
  {
    lazy: false, // Wait for data before rendering
    server: true, // Fetch on server (though SSR is disabled)
    dedupe: 'defer', // Prevent duplicate requests
  },
);
```

### useFetch

**For API calls:**

```typescript
const { data, pending, error, refresh } = await useFetch('/api/data', {
  method: 'GET',
  query: { limit: 10 },
});
```

### $fetch

**For programmatic API calls:**

```typescript
const submit = async () => {
  const result = await $fetch('/api/submit', {
    method: 'POST',
    body: { data: 'value' },
  });
};
```

## SEO & Meta Tags

### Head Management

```vue
<script setup lang="ts">
useHead({
  title: 'Page Title',
  meta: [
    { name: 'description', content: 'Page description' },
    { property: 'og:title', content: 'Page Title' },
    { property: 'og:description', content: 'Page description' },
    { property: 'og:image', content: '/og-image.jpg' },
  ],
  link: [{ rel: 'canonical', href: 'https://example.com/page' }],
});
</script>
```

### SEO Config Composable

```vue
<script setup lang="ts">
useSeoConfig({
  title: 'Services',
  description: 'Our professional services',
  ogImage: '/images/services-og.jpg',
});
</script>
```

## Modules & Integrations

### Installed Modules

| Module                | Purpose       | Usage                         |
| --------------------- | ------------- | ----------------------------- |
| `@nuxt/content`       | CMS           | `queryContent()`              |
| `@nuxtjs/tailwindcss` | Styling       | Automatic                     |
| `@pinia/nuxt`         | State         | `defineStore()`               |
| `@nuxtjs/color-mode`  | Dark mode     | `useColorMode()`              |
| `@nuxt/image`         | Images        | `<NuxtImg>`                   |
| `nuxt-icon`           | Icons         | `<Icon name="...">`           |
| `nuxt-headlessui`     | UI components | Import from `@headlessui/vue` |

### Using Modules

```vue
<script setup lang="ts">
// Color mode
const colorMode = useColorMode();
colorMode.preference; // 'light', 'dark', 'system'
</script>

<template>
  <!-- Optimized images -->
  <NuxtImg src="/images/hero.jpg" alt="Hero" width="1200" height="600" />

  <!-- Icons -->
  <Icon name="mdi:home" size="24" />

  <!-- Content -->
  <ContentDoc :path="route.path" />
</template>
```

## Best Practices

### ✅ Do

- Use `<script setup>` for all components
- Leverage auto-imports (don't manually import components/composables)
- Use `useAsyncData()` with unique keys for data fetching
- Use `queryContent()` for CMS content
- Define page metadata with `definePageMeta()`
- Use Pinia for shared state
- Follow file-based routing conventions
- Use `useFetch()` for API calls
- Use `$fetch()` for programmatic requests
- Handle loading and error states
- Use composables for reusable logic
- Log with structured format: `[Component] [action]: message`

### ❌ Don't

- Use Options API (use Composition API)
- Manually import auto-imported files
- Fetch data on client when it can be done with `useAsyncData()`
- Skip unique keys in `useAsyncData()`
- Ignore TypeScript errors
- Mutate props directly
- Use `onMounted()` for initial data fetching (use `useAsyncData()`)
- Create unnecessary API routes (use content/ when possible)
- Skip error handling in data fetching

## Common Patterns

### Page with Content

```vue
<script setup lang="ts">
import type { PageConfig } from '@/types/global';

const route = useRoute();
const { data: pageConfig } = await useAsyncData<PageConfig>(
  `page-${route.name}`,
  () => queryContent('_pages', route.name as string).findOne(),
);

useSeoConfig({
  title: pageConfig.value?.title,
  description: pageConfig.value?.description,
});
</script>

<template>
  <div v-if="pageConfig" class="container mx-auto px-4">
    <h1>{{ pageConfig.title }}</h1>
    <ContentRenderer :value="pageConfig" />
  </div>
</template>
```

### Dynamic Route with Slug

```vue
<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;

const { data: work, error } = await useAsyncData(`work-${slug}`, () =>
  queryContent('_work/data', slug).findOne(),
);

if (!work.value) {
  throw createError({
    statusCode: 404,
    message: 'Work not found',
  });
}

useSeoConfig({
  title: work.value.title,
  description: work.value.description,
});
</script>

<template>
  <article>
    <h1>{{ work.title }}</h1>
    <ContentRenderer :value="work" />
  </article>
</template>
```

### Form with API Submission

```vue
<script setup lang="ts">
import { z } from 'zod';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: toTypedSchema(schema),
});

const onSubmit = handleSubmit(async (values) => {
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: values,
    });
    alert('Message sent!');
  } catch (error) {
    console.error('[ContactForm]: Submit failed', { error });
    alert('Failed to send message');
  }
});
</script>

<template>
  <form @submit="onSubmit">
    <!-- Form fields -->
  </form>
</template>
```

## Related Documentation

- [Nuxt 3 Docs](https://nuxt.com)
- [Nuxt Content](https://content.nuxt.com)
- [Nitro](https://nitro.unjs.io)
- [Project README](../../README.md)
- [AGENTS.md](../../AGENTS.md)

---

**Last Updated:** 2026-02-09
