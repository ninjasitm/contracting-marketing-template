# Tailwind Theme

The website's existing Tailwind configuration is in `apps/web/tailwind.config.ts`; global variables and base styles are in `apps/web/assets/scss/`. Customize these app-local files and preserve the current design system.

## Colors

Use semantic tokens for shared UI:

| Token | Current value / behavior |
| --- | --- |
| `primary` | Black (`#000000`) in light mode, white in dark mode |
| `secondary` | Blue (`#158AD0`) in light mode, lighter blue in dark mode |
| `success` | Green palette (default `#3BA676`) |
| `warning` | Tailwind amber palette |
| `error` / `destructive` | Red (`#FF6464`) |
| `info` | Tailwind sky palette |

The configuration also provides semantic `background`, `foreground`, `card`, `popover`, `muted`, `accent`, `border`, `input`, `ring`, and `surface` colors, with dark-mode values where defined. The color-mode module uses the `dark` class, so Tailwind's `dark:` variants work. For example:

```html
<div class="bg-background text-foreground dark:bg-background-dark">
  Theme-aware content
</div>
```

## Typography

- `font-sans` uses Inter for body text. Inter weights 400, 500, 600, and 700 are configured.
- `font-heading` uses Montserrat, with Inter and system sans-serif fallbacks. Montserrat weights 500, 600, and 700 are configured.
- `font-mono` uses JetBrains Mono with the system monospace fallback.

```html
<h1 class="font-heading font-semibold">Heading</h1>
<p class="font-sans">Body copy</p>
<code class="font-mono">code</code>
```

## Responsive and spacing extensions

The default Tailwind breakpoints remain available, with `xs` at `475px` and `3xl` at `1920px`. The container is centered and uses responsive horizontal padding. Extended spacing includes `18` (`4.5rem`), `68`, `84`, `88`, `92`, `100`, `104`, `108`, `112`, `120`, `128`, `136`, and `144`.

```html
<div class="hidden xs:block">Visible from 475px</div>
<div class="p-18">Extended spacing</div>
```

## Custom utilities

Tailwind config plugins define `.flex-center`, `.flex-between`, `.absolute-center`, and text-shadow utilities (`.text-shadow`, `.text-shadow-md`, `.text-shadow-lg`, `.text-shadow-none`). Other animation and theme tokens are defined in `apps/web/tailwind.config.ts`; use the config as the source of truth when adding new utilities.

## Updating the theme

Edit the Tailwind config for tokens and utilities, and the app-local SCSS for CSS variables or base styles. Check both light and dark mode and verify responsive layouts after changing shared theme values. Prefer existing semantic tokens and utilities over introducing new colors or one-off component styles.
