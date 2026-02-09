# AI Agent Context — contracting-marketing-template

## Project Overview

**Name:** contracting-marketing-template
**Version:** 2.0.12
**Description:** A professional Nuxt 3 marketing website template designed for contracting companies with flat-file CMS through PagesCMS

### Tech Stack

| Component            | Technology                    | Version |
| -------------------- | ----------------------------- | ------- |
| **Framework**        | Nuxt                          | 4.3     |
| **UI Framework**     | Vue                           | 3.5     |
| **Language**         | TypeScript                    | 5.8     |
| **Styling**          | TailwindCSS                   | 3.4     |
| **UI Components**    | shadcn-vue (reka-ui)          | 2.3     |
| **State Management** | Pinia                         | 2.3     |
| **Content**          | @nuxt/content (flat-file CMS) | 2.13    |
| **Package Manager**  | pnpm                          | —       |
| **Test Framework**   | Vitest                        | 1.6     |
| **Deploy Platform**  | Cloudflare Workers            | —       |

### Repository

- **URL:** https://github.com/ninjasitm/contracting-marketing-template
- **Owner:** ninjasitm
- **License:** MIT

---

## 📋 Project Management

**Tool:** GitHub Issues
**Repository:** https://github.com/ninjasitm/contracting-marketing-template
**Issue Format:** `#NNN` (e.g., `#42`, `#123`)

### Conventions

- Reference issues in commit messages: `#NNN: Brief description`
- Link PRs to issues: Include issue number in PR title or description
- Use issue references for traceability: `Fixes #NNN`, `Relates to #NNN`

### Examples

**Commit Messages:**

```
#42: Add user authentication
#123: Fix database connection timeout
feat(contact): Implement HubSpot integration (#56)
```

**PR Titles:**

```
#89: Implement OAuth2 login flow
feat(cms): Add content validation (#67)
```

**PR Descriptions:**

```markdown
Fixes #45
Relates to #67, #89
```

---

## Architecture

### Application Structure

This is a **Nuxt 3 Layer-based architecture** with the following structure:

```
/ (root - Nuxt Layer)
├── app/                        # Main application (extends root layer)
│   ├── pages/                  # File-based routing
│   ├── stores/                 # Pinia stores
│   └── nuxt.config.ts          # App-specific config
├── components/                 # Auto-imported Vue components
│   ├── ui/                     # shadcn-vue primitives
│   ├── app/                    # Reusable app components
│   ├── about/                  # Page-specific components
│   ├── services/               # Service page components
│   ├── work/                   # Portfolio components
│   └── process/                # Process page components
├── composables/                # Auto-imported Vue composables
├── content/                    # Flat-file CMS content (JSON + Markdown)
│   ├── _pages/                 # Page content configuration
│   ├── _work/                  # Portfolio items
│   ├── _about/                 # Team members
│   ├── _posts/                 # Blog posts
│   └── _testimonials/          # Client testimonials
├── layouts/                    # Vue layouts
├── stores/                     # Global Pinia stores
├── server/                     # Nitro server
│   ├── api/                    # API endpoints
│   └── utils/                  # Server utilities
├── types/                      # TypeScript type definitions
└── utils/                      # Shared utilities
```

### Data Flow

1. **Content Loading:**
   - Pages use `queryContent()` composable from `@nuxt/content`
   - Content files (JSON/Markdown) in `content/` directory
   - `useContent.ts` composable provides typed content access
   - `useAsyncData()` for SSR-compatible data fetching

2. **State Management:**
   - Pinia stores in `app/stores/` and `stores/`
   - `use-identity.ts` - User/identity state
   - `use-counter.ts` - Example counter state
   - Auto-imported across application

3. **Configuration:**
   - `app.config.ts` - Runtime app configuration (company info, navigation, social links)
   - `content/config.json` - CMS-managed site configuration
   - `nuxt.config.ts` (root) - Layer configuration
   - `app/nuxt.config.ts` - App-specific overrides

4. **Server API:**
   - `server/api/` - Nitro API endpoints
   - Contact form processing via `worker-mailer`
   - Optional HubSpot form integration

### Component Patterns

#### shadcn-vue UI Primitives (`components/ui/`)

- **Unstyled, accessible components** using `reka-ui`
- Customizable via `components.json` configuration
- TailwindCSS-based styling with `class-variance-authority`
- Examples: Button, Card, Input, Alert, Sheet, Tabs

#### App Components (`components/app/`)

- **Shared application components:**
  - `Button.vue` - Primary action buttons
  - `Card.vue` - Content cards
  - `CTA.vue` - Call-to-action sections
  - `Hero.vue` - Hero sections

#### Page-Specific Components

- `about/TeamMember.vue` - Team member display
- `services/ServiceFeature.vue` - Service features
- `work/ProjectCard.vue` - Portfolio projects
- `process/ProcessSection.vue` - Process steps

### Composables

| Composable             | Purpose                               |
| ---------------------- | ------------------------------------- |
| `useContent.ts`        | Content querying and type-safe access |
| `useSeoConfig.ts`      | SEO metadata configuration            |
| `use-navbar-parser.ts` | Navigation structure parsing          |
| `use-social-media.ts`  | Social media links                    |
| `use-screen.ts`        | Responsive breakpoint detection       |
| `use-sync-props.ts`    | Prop synchronization utility          |

### Content Management System

**PagesCMS Integration:**

- **Admin URL:** https://next.pagescms.org/ninjasitm/contracting-marketing-starter
- **Configuration:** `.pages.yml` in root
- **No backend API required** - all content in `content/` directory
- **Git-based workflow** - content changes via commits

**Content Types:**

| Type           | Location                            | Format   | Purpose                                          |
| -------------- | ----------------------------------- | -------- | ------------------------------------------------ |
| Pages          | `content/_pages/*.json`             | JSON     | Page configuration (home, about, services, etc.) |
| Work Portfolio | `content/_work/data/*.md`           | Markdown | Case studies and projects                        |
| Team Members   | `content/_about/teamMembers/*.json` | JSON     | Team member profiles                             |
| Testimonials   | `content/_testimonials/*.md`        | Markdown | Client testimonials                              |
| Blog Posts     | `content/_posts/*.md`               | Markdown | Blog articles                                    |
| Config         | `content/config.json`               | JSON     | Site-wide settings                               |
| Clients        | `content/clients.json`              | JSON     | Client list                                      |

---

## Development Patterns

### Nuxt 3 Conventions

#### Auto-imports

- **Components:** All components in `components/` are auto-imported
- **Composables:** All composables are auto-imported
- **Utils:** Manual import from `utils/` or `lib/`

#### File-based Routing

```
app/pages/
  index.vue           → /
  about/
    index.vue         → /about
  services/
    index.vue         → /services
  work/
    index.vue         → /work
    [slug].vue        → /work/:slug
  posts/
    [slug].vue        → /posts/:slug
```

#### Layouts

- Default layout: `layouts/page.vue`
- Usage in pages: `definePageMeta({ layout: 'page' })`

### Vue 3 Composition API

**Prefer:**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

const count = ref(0);
const doubled = computed(() => count.value * 2);
</script>
```

**Component Definition:**

```vue
<script setup lang="ts">
interface Props {
  title: string;
  description?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  submit: [value: string];
}>();
</script>
```

### TypeScript Patterns

#### Type Definitions

- Global types: `types/global.d.ts`
- Feature types: `types/*.d.ts`
- Component types: Inline or co-located `*.types.ts`

#### Nuxt-specific Types

```typescript
import type { NuxtApp } from '#app';
import type { RouteLocationRaw } from 'vue-router';
```

### State Management (Pinia)

```typescript
// stores/use-example.ts
import { defineStore } from 'pinia';

export const useExampleStore = defineStore('example', {
  state: () => ({
    value: 0,
  }),
  getters: {
    doubled: (state) => state.value * 2,
  },
  actions: {
    increment() {
      this.value++;
    },
  },
});
```

**Usage:**

```vue
<script setup lang="ts">
const store = useExampleStore();

// Access state
console.log(store.value);

// Call actions
store.increment();
</script>
```

### Styling Patterns

#### TailwindCSS

- **Configuration:** `tailwind.config.ts`
- **Custom styles:** `assets/scss/app.scss`
- **Variables:** `assets/scss/_variables.scss`
- **Theme:** See `docs/TAILWIND_THEME.md`

#### Component Styling

```vue
<template>
  <div class="container mx-auto px-4">
    <h1 class="text-3xl font-bold text-primary">Hello World</h1>
  </div>
</template>
```

#### Using `cn()` Helper

```vue
<script setup lang="ts">
import { cn } from '@/lib/utils';

const classes = cn('base-class', isActive && 'active-class', 'another-class');
</script>
```

### API Patterns

#### Server API Routes (Nitro)

```typescript
// server/api/example.ts
export default defineEventHandler(async (event) => {
  console.info('[API] [/example]: Request received');

  const body = await readBody(event);

  // Process request

  return {
    success: true,
    data: {},
  };
});
```

#### Client-side API Calls

```typescript
// Use $fetch (auto-imported)
const { data } = await useFetch('/api/example', {
  method: 'POST',
  body: { value: 123 },
});
```

### Content Querying

```typescript
// Query all work items
const { data: works } = await useAsyncData('works', () =>
  queryContent('_work/data').sort({ date: -1 }).find(),
);

// Query single item by slug
const { data: work } = await useAsyncData(`work-${slug}`, () =>
  queryContent('_work/data', slug).findOne(),
);

// Query with filters
const { data: posts } = await useAsyncData('recent-posts', () =>
  queryContent('_posts')
    .where({ published: true })
    .sort({ date: -1 })
    .limit(5)
    .find(),
);
```

---

## Testing Strategy

### Test Framework: Vitest

**Configuration:** `vitest.config.ts`

### Test Structure

```
test/
  components/          # Component tests
  tailwind/           # Tailwind utility tests
  shims-vue.d.ts      # Vue test type definitions
```

### Running Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage
```

### Component Testing

```typescript
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import MyComponent from '@/components/MyComponent.vue';

describe('MyComponent', () => {
  it('renders properly', () => {
    const wrapper = mount(MyComponent, {
      props: { title: 'Hello' },
    });
    expect(wrapper.text()).toContain('Hello');
  });
});
```

---

## Deployment

### Cloudflare Workers

**Configuration:** `wrangler.toml`

### Build Commands

```bash
# Production build
pnpm build

# Static site generation (if applicable)
pnpm generate

# Preview build
pnpm preview
```

### Environment Variables

Set these in Cloudflare Workers dashboard or `.env`:

- `NUXT_PUBLIC_*` - Public runtime config (exposed to client)
- `NUXT_*` - Private runtime config (server only)

---

## Development Workflow

### Starting Development

```bash
# Install dependencies
pnpm install

# Start dev server (port 3000)
pnpm dev

# Open http://localhost:3000
```

### Code Quality

```bash
# Lint and type check
pnpm lint

# ESLint only
eslint --fix --ext ".ts,.js,.vue" .

# Type check only
vue-tsc --noEmit
```

### Release Process

```bash
# Create release (uses release-it)
pnpm release
```

---

## Key Dependencies

### Core Framework

- `nuxt` (4.3) - Full-stack Vue framework
- `vue` (3.5) - Progressive JavaScript framework
- `@nuxt/content` (2.13) - File-based CMS

### UI & Styling

- `tailwindcss` (3.4) - Utility-first CSS framework
- `@nuxtjs/tailwindcss` (6.14) - Nuxt Tailwind module
- `reka-ui` (2.3) - Unstyled UI primitives
- `shadcn-nuxt` (2.2) - shadcn-vue CLI
- `lucide-vue-next` (0.522) - Icon library
- `@nuxtjs/color-mode` (3.5) - Dark mode support

### State & Validation

- `pinia` (2.3) - State management
- `@pinia/nuxt` (0.5) - Pinia Nuxt integration
- `vee-validate` (4.15) - Form validation
- `@vee-validate/zod` (4.15) - Zod schema validation
- `zod` (3.25) - Schema validation

### Utilities

- `@vueuse/core` (10.11) - Vue composition utilities
- `class-variance-authority` (0.7) - Class variant management
- `clsx` (2.1) - Class name utility
- `tailwind-merge` (3.3) - Merge Tailwind classes

### Development

- `typescript` (5.8) - TypeScript compiler
- `vitest` (1.6) - Test framework
- `eslint` (9.27) - Linting
- `@nuxt/eslint` (1.4) - Nuxt ESLint config

### Server

- `worker-mailer` (1.1) - Email sending for Cloudflare Workers

### Integrations

- `@jagaad/vue-hubspot-form` (2.2) - HubSpot form integration

---

## Best Practices

### ✅ Do

- Use Composition API with `<script setup>`
- Leverage auto-imports for components and composables
- Follow file-based routing conventions
- Use TypeScript for type safety
- Write tests for critical functionality
- Follow logging conventions (see `.github/instructions/logging.instructions.md`)
- Document features and fixes (see `.github/instructions/documentation.instructions.md`)
- Use Pinia for state management
- Query content with `@nuxt/content`
- Use `cn()` helper for conditional classes
- Reference GitHub issues in commits (`#NNN`)

### ❌ Don't

- Use Options API (prefer Composition API)
- Manually import auto-imported files
- Ignore TypeScript errors
- Skip documentation for features
- Log sensitive data
- Mutate props directly
- Use inline styles (use Tailwind)
- Create unnecessary API routes (leverage content/)
- Forget to link PRs to issues

---

## Documentation

### Internal Docs

| Document                                    | Purpose                         |
| ------------------------------------------- | ------------------------------- |
| [README.md](README.md)                      | Project overview and quickstart |
| [TEMPLATE_USAGE.md](docs/TEMPLATE_USAGE.md) | Template customization guide    |
| [TAILWIND_THEME.md](docs/TAILWIND_THEME.md) | Theme and styling guidelines    |
| [docs/ai/](docs/ai/)                        | AI-specific documentation       |

### AI Instructions

| Location                          | Purpose                       |
| --------------------------------- | ----------------------------- |
| `.github/copilot-instructions.md` | GitHub Copilot configuration  |
| `.github/instructions/`           | Context-specific instructions |
| `.agents/skills/`                 | Agent skill definitions       |
| `.cursor/rules/`                  | Cursor IDE rules              |

### Skills

Installed agent skills (see `.agents/skills/README.md`):

- **brainstorming** - Feature ideation and requirements
- **executing-plans** - Plan execution workflows
- **logging** - Structured logging patterns
- **project-documentation** - Documentation standards
- **requesting-code-review** - Code review process
- **systematic-debugging** - Debugging workflows
- **test-driven-development** - TDD practices
- **verification-before-completion** - Quality checks
- **writing-plans** - Implementation planning
- And more...

---

## Environment

### Development

- **Port:** 3000
- **Host:** 0.0.0.0 (configured for Replit/cloud environments)
- **HMR:** Enabled on port 3000

### Build

- **SSR:** Disabled (`ssr: false` for static/SPA deployment)
- **Type Checking:** Strict mode enabled
- **Target:** Cloudflare Workers

---

## Related Resources

- **Nuxt 3 Docs:** https://nuxt.com
- **Vue 3 Docs:** https://vuejs.org
- **TailwindCSS Docs:** https://tailwindcss.com
- **Pinia Docs:** https://pinia.vuejs.org
- **Vitest Docs:** https://vitest.dev
- **PagesCMS:** https://next.pagescms.org
- **shadcn-vue:** https://www.shadcn-vue.com

---

**Last Updated:** 2026-02-09
**Template Version:** 2.0.12
