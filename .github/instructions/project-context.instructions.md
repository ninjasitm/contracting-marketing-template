---
applyTo: "**/*"
description: "Project architecture and data flow for contracting-marketing-template."
---

# contracting-marketing-template architecture

- **Framework:** Nuxt 3.17 (Vue 3.5)
- **Language:** TypeScript 5.8
- Entry point: `app.vue` (layer config: `nuxt.config.ts`, app config: `app/nuxt.config.ts`)

## Directory structure

- `app/pages/` - Page routes (file-based routing)
- `components/` - Vue components (auto-imported)
- `components/ui/` - shadcn-vue UI primitives
- `components/app/` - App-level reusable components
- `composables/` - Vue composables (auto-imported)
- `content/` - Flat-file CMS content (JSON + Markdown)
- `stores/` - Pinia state stores
- `server/api/` - Nitro API endpoints
- `types/` - TypeScript type definitions
- `lib/` - Utility library (`cn()` helper)

## Data flow

- Pages load content via `queryContent()` / `useAsyncData()` composables in `composables/useContent.ts`
- Pinia stores handle client-side state (identity, counters)
- `app.config.ts` provides site-wide configuration (company info, navigation, social links)
- Server routes in `server/api/` handle backend operations (contact form via worker-mailer)

## Authentication

- No authentication — this is a public marketing website template
- Contact form submission is the primary user interaction

## API integration

- Flat-file CMS via `@nuxt/content` — no external API required for content
- Server API endpoints in `server/api/` for form processing
- Optional HubSpot form integration via `@jagaad/vue-hubspot-form`
- PagesCMS admin interface for content management
