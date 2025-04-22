# Tailwind Theme Configuration Guide

This document provides comprehensive guidance on how to use the Tailwind CSS theme configuration in this marketing site template.

## Overview

The template uses Tailwind CSS with custom theming to provide a consistent look and feel across the site. The theme is configured in:

- `tailwind.config.ts` - Main configuration file
- `assets/scss/tailwind.css` - Custom CSS components and utilities
- `nuxt.config.ts` - Nuxt module configuration

## Color System

### Primary Color Palette

The theme defines semantic color names that can be used throughout the application:

```html
<!-- Using primary colors -->
<div class="bg-primary text-white">Primary Button</div>
<div class="bg-secondary text-white">Secondary Button</div>
<div class="bg-success">Success Message</div>
<div class="bg-error">Error Message</div>
<div class="bg-warning">Warning Message</div>
<div class="bg-info">Information Message</div>
```

### Color Shades

Each color has various shades available from 50 (lightest) to 900 (darkest):

```html
<div class="bg-primary-50">Very Light Primary</div>
<div class="bg-primary-100">Light Primary</div>
<div class="bg-primary-500">Primary Default</div>
<div class="bg-primary-900">Very Dark Primary</div>
```

### Dark Mode

The template supports dark mode through the class-based strategy:

```html
<!-- This will have different styles in light vs dark mode -->
<div class="bg-white dark:bg-dark-bg-primary text-gray-800 dark:text-gray-200">
  Content that adapts to light/dark mode
</div>
```

## Typography

### Font Families

Three main font families are configured:

- `font-sans` - Primary body text (Manrope)
- `font-heading` - Headings (Sora)
- `font-mono` - Code (JetBrains Mono)

```html
<h1 class="font-heading">This is a heading</h1>
<p class="font-sans">This is body text</p>
<code class="font-mono">This is code</code>
```

### Text Utilities

Custom text utilities are available:

```html
<!-- Typography system -->
<h1 class="heading-1">Large Heading</h1>
<h2 class="heading-2">Medium Heading</h2>
<p class="body">Standard text</p>
<p class="body-sm">Smaller text</p>
<p class="caption">Caption text</p>

<!-- Text shadows -->
<h2 class="text-shadow">Text with shadow</h2>
<h2 class="text-shadow-lg">Text with large shadow</h2>
```

## Layout Components

### Container

```html
<div class="container mx-auto">
  <!-- Content with responsive padding -->
</div>

<div class="container-narrow">
  <!-- Content with maximum width for better readability -->
</div>
```

### Responsive Design

Custom breakpoint is added for extra-small screens:

```html
<div class="hidden xs:block">
  <!-- Only visible on screens larger than 475px -->
</div>

<div class="block 3xl:hidden">
  <!-- Hidden on very large screens (1920px+) -->
</div>
```

## Components

The theme provides pre-styled components through CSS classes:

### Buttons

```html
<button class="btn-primary">Primary Button</button>
<button class="btn-secondary">Secondary Button</button>
<button class="btn-outline">Outline Button</button>
```

### Cards

```html
<div class="card">
  <div class="card-header">Card Title</div>
  <div class="card-body">Card Content</div>
  <div class="card-footer">Card Footer</div>
</div>
```

### Form Controls

```html
<label class="form-label">Input Label</label>
<input type="text" class="form-input" placeholder="Enter text" />
```

## Utility Classes

Custom utility classes that extend Tailwind's default utilities:

### Flexbox Shortcuts

```html
<div class="flex-center">
  <!-- Centered content (justify-content: center + align-items: center) -->
</div>

<div class="flex-between">
  <!-- Space-between content (justify-content: space-between + align-items: center) -->
</div>
```

### Positioning Shortcuts

```html
<div class="absolute-center">
  <!-- Absolutely positioned in center of parent -->
</div>
```

## Spacing System

Extended spacing scale includes:

```html
<!-- Standard Tailwind spacing -->
<div class="p-4"><!-- 1rem padding --></div>

<!-- Extended spacing -->
<div class="p-18"><!-- 4.5rem (72px) padding --></div>
<div class="mt-100"><!-- 25rem (400px) margin-top --></div>
```

## Animations

Custom animations are available:

```html
<div class="animate-fade-in">
  <!-- Content fades in -->
</div>

<div class="animate-loop-scroll">
  <!-- Content scrolls continuously in a loop -->
</div>
```

## Extending the Theme

To modify the theme colors or other aspects:

1. Edit `tailwind.config.ts` to update the main theme settings
2. Add custom component classes to `assets/scss/tailwind.css`
3. Use the updated classes in your Vue components

### Adding a New Brand Color

```typescript
// in tailwind.config.ts
const MyTheme = {
  colors: {
    // ...existing colors
    purple: {
      DEFAULT: '#8B5CF6',
      '50': '#F5F3FF',
      // ...add all shades
      '900': '#4C1D95',
    },
  },
};

export default <Partial<Config>>{
  // ...
  theme: {
    extend: {
      colors: {
        // ...existing colors
        tertiary: MyTheme.colors.purple,
      },
    },
  },
  // ...
};
```

## Best Practices

1. **Use semantic color names** (`primary`, `secondary`, etc.) instead of specific colors when possible
2. **Use the typography system** consistently across the site
3. **Use responsive design** with Tailwind's breakpoint system
4. **Leverage the component classes** for consistency
5. **Stick to the spacing scale** rather than arbitrary values
6. **Use dark mode utilities** for all components that need dark mode support

By following these guidelines, you'll ensure a consistent design system across your marketing site.
