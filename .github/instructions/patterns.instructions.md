---
applyTo: "**/*"
description: "Project-specific coding patterns and shared utilities for the contracting marketing template."
---

# Patterns and conventions

## State management

- Pinia stores currently live in `apps/web/app/stores/` and `apps/web/stores/`; preserve both locations unless Nuxt scanning is verified.
- Use Pinia for website client-side state and Composition API patterns for new stores.

## API patterns

- Website API routes live in `apps/web/server/api/`; server helpers live in `apps/web/server/utils/`.
- Keep the optional `apps/server/` Worker isolated from the website Nitro contact endpoint.

## Component patterns

- Vue components use `<script setup lang="ts">` and stay app-local under `apps/web/components/`.
- Reuse the existing local UI design system in `apps/web/components/ui/` before adding components.

## Utilities

- Website utilities live in `apps/web/utils/` and `apps/web/lib/`; check existing helpers before adding another.
