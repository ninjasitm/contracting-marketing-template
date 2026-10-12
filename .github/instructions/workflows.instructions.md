---
applyTo: '**/*'
description: 'pnpm workspace commands for the contracting marketing website.'
---

# Development Workflows

Run commands from the workspace root. The private root scripts forward website tasks to `@nitm/web`.

```bash
pnpm install
pnpm dev
pnpm build
pnpm generate
pnpm preview
pnpm test
pnpm test:watch
pnpm test:coverage
pnpm lint
pnpm typecheck
```

Use only commands present in the manifests. If a needed script is not forwarded at the root, target the actual app script with `pnpm --filter @nitm/web <script>`; do not assume Turbo/Nx commands or package-level scripts that do not exist.

The optional independent Worker is not a root website-script target. Its available commands are `pnpm --filter @nitm/server dev`, `pnpm --filter @nitm/server typecheck`, and the root test `pnpm test -- test/server-example/worker.test.ts`.
