# AI Agent Context — contracting-marketing-template

## Project Overview

**Name:** contracting-marketing-template
**Version:** 2.0.12
**Description:** A professional Nuxt 4 marketing website template designed for contracting companies with flat-file CMS through PagesCMS

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
| **Package Manager**  | pnpm                          | 8.5.1   |
| **Test Framework**   | Vitest                        | 3.2     |
| **Deploy Platform**  | Cloudflare Pages (configured) | —       |

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

This is a pnpm workspace with a leading Nuxt 4 website app and an optional independent Cloudflare Worker example. The target layout is:

```
/ (private pnpm workspace root)
├── package.json                # Private @nitm/contracting-marketing-template; website scripts target @nitm/web
├── pnpm-workspace.yaml         # apps/* and packages/* workspace globs
├── apps/
│   ├── web/                    # @nitm/web — the Nuxt 4 website
│   │   ├── app/pages/          # File-based routes
│   │   ├── app/stores/         # Pinia stores
│   │   ├── stores/             # Existing additional Pinia store
│   │   ├── components/ui/      # Existing local design system
│   │   ├── server/api/         # Nitro contact endpoint
│   │   ├── content/            # PagesCMS JSON and Markdown
│   │   ├── public/             # Static and CMS media
│   │   ├── assets/             # Styles and bundled assets
│   │   ├── composables/        # Auto-imported composables
│   │   ├── layouts/            # Nuxt layouts
│   │   ├── nuxt.config.ts      # Website Nuxt configuration
│   │   └── app.config.ts       # Website configuration
│   └── server/                 # Optional @nitm/server health-only Worker example
└── packages/                   # Add a package only for a real shared need
```

Root `pnpm dev` uses Turbo TUI for `@nitm/web` only; opt-in `pnpm dev:all` runs web and the independent Worker. `build`, `generate`, and `preview` target `@nitm/web`; build/tests/typecheck/lint remain non-Turbo. Lint and Vitest run at the workspace root, while `typecheck` checks the app and root test typing. `apps/server` does not replace the website Nitro API. Keep the design system in `apps/web/components/ui/`; do not introduce another backend, a separate UI package, or a task orchestrator without a concrete requirement.

### Data Flow

1. **Content Loading:**
   - Pages use `queryContent()` from `@nuxt/content` 2.13 (Content 2 APIs)
   - Content files (JSON/Markdown) in `apps/web/content/`
   - `useContent.ts` composable provides typed content access
   - `useAsyncData()` for Nuxt data fetching

2. **State Management:**
   - Pinia stores currently in `apps/web/app/stores/` and `apps/web/stores/`; preserve locations unless store scanning is verified
   - `use-identity.ts` - User/identity state
   - `use-counter.ts` - Example counter state
   - Auto-imported across application

3. **Configuration:**
   - `apps/web/app.config.ts` - Runtime app configuration (company info, navigation, social links)
   - `apps/web/content/config.json` - CMS-managed site configuration
   - `apps/web/nuxt.config.ts` - Nuxt application configuration

4. **Server APIs:**
   - `apps/web/server/api/` - Website Nitro API endpoints, including contact processing via `worker-mailer`
   - Optional HubSpot form integration is separate from the Nitro contact endpoint
   - `apps/server/` - Optional independent health-only Cloudflare Worker example (`GET /health`); included only in opt-in root `dev:all`, not website requests/builds
   - Worker commands: `pnpm --filter @nitm/server dev`, `pnpm --filter @nitm/server typecheck`, `pnpm test -- test/server-example/worker.test.ts`

### Component Patterns

#### Existing UI Design System (`apps/web/components/ui/`)

- **Unstyled, accessible components** using `reka-ui`
- Customizable via `components.json` configuration
- TailwindCSS-based styling with `class-variance-authority`
- Examples: Button, Card, Input, Alert, Sheet, Tabs

#### App Components (`apps/web/components/app/`)

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
- **Configuration:** `.pages.yml` in root; content and media live under `apps/web/`
- Content is file-based; website contact submissions use Nitro in `apps/web/server/api/`. The optional `apps/server` Worker is independent and is not used for website requests.
- **Git-based workflow** - content changes via commits

**Content Types:**

| Type           | Location                            | Format   | Purpose                                          |
| -------------- | ----------------------------------- | -------- | ------------------------------------------------ |
| Pages          | `apps/web/content/_pages/*.json`             | JSON     | Page configuration (home, about, services, etc.) |
| Work Portfolio | `apps/web/content/_work/data/*.md`           | Markdown | Case studies and projects                        |
| Team Members   | `apps/web/content/_about/teamMembers/*.json` | JSON     | Team member profiles                             |
| Testimonials   | `apps/web/content/_testimonials/*.md`        | Markdown | Client testimonials                              |
| Blog Posts     | `apps/web/content/_posts/**/*.md`             | Markdown | Blog articles                                    |
| Config         | `apps/web/content/config.json`               | JSON     | Site-wide settings                               |
| Clients        | `apps/web/content/clients.json`              | JSON     | Client list                                      |

The sample post `apps/web/content/_posts/data/template-example.md` is published as an example for the posts page; replace or unpublish it before launch.

---

## Development Patterns

### Nuxt 4 Conventions

#### Auto-imports

- **Components:** Global component scanning is configured only for `apps/web/components/layouts/` (`Layout` prefix), `apps/web/components/ui/` (`Ui` prefix), and `apps/web/components/app/` (`App` prefix). Components in other feature folders must be explicitly imported.
- **Composables:** Composables in `apps/web/composables/` are auto-imported
- **Utils:** Nuxt auto-imports utilities from `apps/web/utils/`; helpers in `apps/web/lib/` (such as `cn()`) require explicit imports.

#### File-based Routing

```
apps/web/app/pages/
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

- Default layout: `apps/web/layouts/page.vue`
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

- Global types: `apps/web/types/global.d.ts`
- Feature types: `apps/web/types/*.ts` or `apps/web/types/*.d.ts`
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

- **Configuration:** `apps/web/tailwind.config.ts`
- **Custom styles:** `apps/web/assets/scss/app.scss`
- **Variables:** `apps/web/assets/scss/_variables.scss`
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
// apps/web/server/api/example.ts
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

**Configuration:** `vitest.config.ts` at the workspace root

### Test Structure

```
test/ (workspace root)
  components/           # Component tests
  composables/          # Composable tests
  mocks/                # Test mocks
  server/               # Server tests
  server-example/       # Optional Worker tests
  tailwind/             # Tailwind utility tests
  utils/                # Utility tests
  shims-vue.d.ts        # Vue test type definitions
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

The 2026-10-11 root test run passed 101 tests across 34 test files; counts are a dated snapshot.

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

### Cloudflare Pages

**Repository configuration:** `apps/web/nuxt.config.ts` uses Nitro's `cloudflare-pages` preset, and root `wrangler.toml` sets `pages_build_output_dir = "apps/web/dist"`. The optional `apps/server` example is a separate Cloudflare Worker. This documents checked-in configuration only; deployment has not been verified.

### Build Commands

```bash
# Root website scripts target @nitm/web
pnpm build

# Static generation (if configured by @nitm/web)
pnpm generate

# Preview build
pnpm preview
```

### Environment Variables

Configure these in Cloudflare Pages project settings for a deployed site or in `.env` locally:

- `NUXT_PUBLIC_*` - Public runtime config (exposed to client)
- `NUXT_*` - Private runtime config (server only)

---

## Development Workflow

### Starting Development

```bash
# Install dependencies
pnpm install

# Turbo TUI: web only (port 3002 by default; Nuxt falls back if occupied)
pnpm dev

# Optional: web + independent health Worker in the TUI
pnpm dev:all

# Without TUI/TTY: run app commands directly (Worker optional)
pnpm --filter @nitm/web dev
pnpm --filter @nitm/server dev

# Open the URL printed at startup (normally http://localhost:3002)
```

### Code Quality

```bash
# Lint
pnpm lint

# Lint with automatic fixes
pnpm lint:fix

# Type check
pnpm typecheck
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
- `vitest` (3.2) - Test framework
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
- Leverage configured `Layout`/`Ui`/`App` component auto-imports and composable auto-imports; explicitly import feature-folder components.
- Follow file-based routing conventions
- Use TypeScript for type safety
- Write tests for critical functionality
- Follow logging conventions (see `.github/instructions/logging.instructions.md`)
- Document features and fixes (see `.github/instructions/documentation.instructions.md`)
- For shared AI bootstrap, project-context, workflow, and reuse standards, consult `.claude/prompt-snippets/` and `.claude/rules-snippets/`; keep harness entrypoints as native wrappers that read the shared files.
- Before a derived site is launch-ready, follow [purpose/route audit and approved cleanup](docs/TEMPLATE_USAGE.md#purpose-and-route-audit-before-launch). AI-guidance bootstrap is documentation-only; template-maintainer mode retains reusable examples.
- Use Pinia for state management
- Query content with `@nuxt/content`
- Use `cn()` helper for conditional classes
- Reference GitHub issues in commits (`#NNN`)

### ❌ Don't

- Use Options API (prefer Composition API)
- Do not manually import Nuxt auto-imports; do explicitly import components outside the configured component folders.
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
| `.cursor/rules/`                  | Cursor IDE rules              |
| `.claude/`                        | Claude Code entrypoint, rules, and task commands |
| `.opencode/commands/`             | OpenCode native task commands |
| `.claude/prompt-snippets/`        | Shared AI task prompts         |
| `.claude/rules-snippets/`         | Shared AI standards             |
| `.agents/skills/`                 | Canonical reusable skill files |

### Skills

Reusable skill files are maintained in `.agents/skills/`. Preserve them byte-for-byte during AI bootstrap; do not copy or synchronize them into harness-specific directories. `.claude/skills/README.md` documents the current Claude Code skill-file policy; it does not imply automatic discovery.

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

- **Dev/preview port:** 3002 by default; the dev server can fall back if occupied
- **Host:** 0.0.0.0 (configured for Replit/cloud environments)
- **HMR:** Managed by Nuxt; no fixed client port override

### Build

- **SSR:** Disabled (`ssr: false` for static/SPA deployment)
- **Type Checking:** Strict mode enabled
- **Repository target configuration:** `apps/web/nuxt.config.ts` uses Nitro's Cloudflare Pages preset, and root `wrangler.toml` points Pages output to `apps/web/dist`. The optional `apps/server` Cloudflare Worker is separate.

---

## Related Resources

- **Nuxt Docs:** https://nuxt.com
- **Vue 3 Docs:** https://vuejs.org
- **TailwindCSS Docs:** https://tailwindcss.com
- **Pinia Docs:** https://pinia.vuejs.org
- **Vitest Docs:** https://vitest.dev
- **PagesCMS:** https://next.pagescms.org
- **shadcn-vue:** https://www.shadcn-vue.com

---

**Last Updated:** 2026-10-12
**Template Version:** 2.0.12
