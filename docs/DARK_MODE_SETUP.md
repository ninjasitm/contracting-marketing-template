# Dark Mode Configuration

This project is now fully configured for dark and light mode themes using `@nuxtjs/color-mode` and a comprehensive Tailwind CSS configuration.

## Features ✅

### 1. Nuxt Color Mode Module

- ✅ `@nuxtjs/color-mode` installed and configured
- ✅ System preference detection (follows user's OS setting)
- ✅ Persistent theme selection (stored in localStorage)
- ✅ Seamless theme switching

### 2. Tailwind CSS Configuration

- ✅ CSS variables-based color system for dynamic theming
- ✅ Comprehensive dark mode color palette
- ✅ Utility classes for all theme colors
- ✅ Smooth transitions between themes

### 3. Theme Toggle Component

- ✅ `UiThemeToggle` component available
- ✅ Integrated in the main navbar
- ✅ Accessible with proper ARIA labels
- ✅ Visual feedback with icons (sun/moon)

## Usage

### Using Theme Colors in Components

Instead of hardcoded colors, use semantic color classes:

```vue
<template>
  <!-- Background colors -->
  <div class="bg-background text-foreground">
    <div class="bg-card text-card-foreground">
      <div class="bg-muted text-muted-foreground">
        Content with proper theme colors
      </div>
    </div>
  </div>

  <!-- Border and accent colors -->
  <div class="border border-border">
    <button class="bg-primary text-primary-foreground">Primary Button</button>
    <button class="bg-secondary text-secondary-foreground">
      Secondary Button
    </button>
  </div>
</template>
```

### Available Color Classes

#### Background Colors

- `bg-background` / `text-background` - Main background
- `bg-foreground` / `text-foreground` - Main text color
- `bg-card` / `text-card-foreground` - Card backgrounds
- `bg-muted` / `text-muted-foreground` - Muted/secondary content
- `bg-accent` / `text-accent-foreground` - Accent backgrounds

#### Semantic Colors

- `bg-primary` / `text-primary-foreground` - Primary actions
- `bg-secondary` / `text-secondary-foreground` - Secondary actions
- `bg-destructive` / `text-destructive-foreground` - Destructive actions

#### Utility Colors

- `border-border` - Border color
- `border-input` - Input border color
- `ring-ring` - Focus ring color

### CSS Variables

All colors are based on CSS variables that automatically switch based on the theme:

```css
:root {
  --background: 0 0% 100%; /* white */
  --foreground: 222.2 84% 4.9%; /* dark gray */
  /* ... more colors */
}

.dark {
  --background: 222.2 84% 4.9%; /* dark gray */
  --foreground: 210 40% 96%; /* light gray */
  /* ... more colors */
}
```

### Programmatic Theme Control

```vue
<script setup>
const colorMode = useColorMode();

// Get current theme
console.log(colorMode.value); // 'light', 'dark', or 'system'

// Set theme
colorMode.preference = 'dark'; // Force dark mode
colorMode.preference = 'light'; // Force light mode
colorMode.preference = 'system'; // Follow system preference

// Check if dark mode is active
const isDark = computed(() => colorMode.value === 'dark');
</script>
```

### Adding the Theme Toggle to Other Components

```vue
<template>
  <div class="navbar">
    <!-- Your other nav items -->
    <UiThemeToggle />
  </div>
</template>
```

## Configuration

### Nuxt Config

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/color-mode'],
  colorMode: {
    preference: 'system', // default value
    fallback: 'light', // fallback if system preference unavailable
  },
});
```

### Tailwind Config

```typescript
// tailwind.config.ts
export default {
  darkMode: ['class', 'class'], // Enable class-based dark mode
  // ... comprehensive color system defined
};
```

## Migration Notes

### From Previous Setup

- ✅ Removed hardcoded dark mode classes (e.g., `dark:bg-brown-800`)
- ✅ Replaced with semantic color classes (e.g., `bg-background`)
- ✅ Updated existing theme toggle with new `UiThemeToggle` component
- ✅ Added CSS variables for consistent theming

### Best Practices

1. Always use semantic color classes instead of hardcoded colors
2. Test both light and dark modes during development
3. Ensure sufficient color contrast in both themes
4. Use the `UiThemeToggle` component for consistent theme switching UI

## Troubleshooting

### Theme Not Persisting

- Check that localStorage is available
- Verify `@nuxtjs/color-mode` is properly installed

### Colors Not Switching

- Ensure you're using the semantic color classes (`bg-background`, etc.)
- Check that Tailwind CSS is processing the dark mode classes

### Custom Colors

To add custom theme colors, extend the CSS variables in your Tailwind config:

```typescript
// tailwind.config.ts
plugins: [
  plugin(function ({ addBase }) {
    addBase({
      ':root': {
        '--my-custom-color': '120 100% 50%',
      },
      '.dark': {
        '--my-custom-color': '120 50% 25%',
      },
    });
  }),
];
```

Your Nuxt project now has a complete, production-ready dark/light mode implementation! 🎉
