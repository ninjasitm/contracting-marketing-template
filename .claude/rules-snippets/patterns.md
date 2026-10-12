# Reuse and change-scope standards

- Read the existing implementation and related guidance before proposing a new abstraction.
- Reuse existing components, utilities, and the local `apps/web/components/ui/` design system where they fit.
- Preserve the existing font setup, design tokens, and workspace boundaries unless the request calls for changing them.
- Avoid duplicating state or behavior that an existing shared implementation already owns.
- Do not make speculative changes to deployment, harness settings, credentials, permissions, or integrations.
