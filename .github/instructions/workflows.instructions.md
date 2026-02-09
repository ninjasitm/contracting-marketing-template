---
applyTo: "**/*"
description: "Developer workflows and environment settings for contracting-marketing-template."
---

# Workflows

## Development

- **Start dev server:** `pnpm dev` (port 3000)
- **Build:** `pnpm build`
- **Generate:** `pnpm generate` (static site generation)
- **Type check:** `pnpm lint` (includes `vue-tsc --noEmit`)

## Testing

- **Unit tests:** `pnpm test`
- **Watch mode:** `pnpm test:watch`
- **Coverage:** `pnpm test:coverage`

## Code quality

- **Lint:** `pnpm lint`
- **Preview:** `pnpm preview` (build + preview on port 3000)

## Environment variables

| Variable          | Purpose                                  | Required |
| ----------------- | ---------------------------------------- | -------- |
| `NUXT_PUBLIC_*`   | Public runtime config exposed to client  | Varies   |
| `NUXT_*`          | Private runtime config (server only)     | Varies   |
