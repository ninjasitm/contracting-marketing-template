# Repository context

This checkout is a reusable contracting-company marketing website template. Its maintained project facts and conventions are in [`AGENTS.md`](../../AGENTS.md); read that file before non-trivial work.

- The primary site is the Nuxt app in `apps/web/`.
- `apps/server/` is an optional, independent health-only Worker example, not the website backend.
- Keep the UI design system, fonts, and design tokens app-local in `apps/web/`.
- Treat company content and sample material as template seed data, not confirmed downstream client facts.
- For derived repositories, inspect their actual state and ask about unknown client/deployment decisions; don't inherit this checkout's machine or session configuration.
