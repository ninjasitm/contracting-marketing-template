# GitHub Copilot Instructions for TypeScript & Nuxt Development

**Attention GitHub Copilot:** Please strictly adhere to the guidelines outlined below when assisting with this project. These instructions are designed to ensure consistency, quality, and alignment with project standards.

## Core Directives

### 1. Prioritize Project Context from `docs/ai/`

- **Action**: Before generating any code, offering suggestions, or answering questions, ALWAYS thoroughly review the entire contents of the `docs/ai/` directory (especially `overview.md` and `architecture.md`).
- **Reason**: This directory contains critical, up-to-date project-specific information, architecture, and feature details essential for accurate and relevant assistance.

### 2. Package Manager: `

- **Action**: This project exclusively uses `ackage management commands (e.g., install, add, run) MUST use `` syntaxgest `pnpm`or`yarn` commands.

### 3. Core Libraries Awareness

- **Action**: Be aware that this project relies heavily on VueUse (`@vueuse/core`) for utilities, Pinia for state management, and TailwindCSS for styling. Prefer these libraries' built-in functionality over custom implementations.
- **Reason**: These libraries are core dependencies and using their patterns ensures consistency across the codebase.

### 4. Adherence to These Instructions

- **Action**: Refer to and follow all guidelines within this `copilot-instructions.md` file diligently.

### 5. Azure Development (If Applicable)

- **@azure Rule - Use Azure Best Practices**: When generating code for Azure, running terminal commands for Azure, or performing operations related to Azure, invoke your `azure_development-get_best_practices` tool if available.

## Project Overview

This is a Nuxt 3-based contracting marketing template that uses a flat-file CMS approach with PagesCMS.org. It\'s designed for creating marketing websites without needing a traditional API backend.

## Development Workflow

### Setup & Environment

- Prefer official Nuxt modules for new functionality over custom implementations where appropriate.
- Prefer VueUse composables for common utilities and event handling over custom implementations if a suitable one exists.
- When adding Nuxt modules, use the `npx nuxi@latest module add {{module_name}}` command.

### Code Quality & Standards

- **Pre-Suggestion/Pre-Commit Checks**: Always ensure the following commands pass successfully before suggesting code changes or as a final step before a commit:

  ```

  t
   run build
  ```

### TypeScript Standards

- Follow standard TypeScript conventions and best practices.
- Use proper type definitions for all variables, parameters, and return values.
- Leverage TypeScript interfaces and types for better code documentation.
- Use TypeScript\'s utility types when appropriate (e.g., Partial<T>, Pick<T>).

## Nuxt-Specific Guidelines

### Project Structure

- Adhere to Nuxt\'s recommended folder structure and conventions:
  - `pages/`: Route-based components
  - `components/`: Reusable Vue components
  - `composables/`: Shared composition functions
  - `layouts/`: Page layouts
  - `assets/`: Static assets (e.g., SCSS files, non-dynamic images)
  - `public/`: Public assets (e.g., favicon, robots.txt, images directly accessible via URL)
  - `content/`: CMS content files (Markdown, JSON)

### Composition API

- Always use the Composition API with `<script setup lang="ts">` syntax for components.
- Example component structure:

  ```vue
  <script setup lang="ts">
  // Imports
  import { ref, computed, onMounted } from 'vue';

  // Define Props (if any)
  const props = defineProps<{
    title: string;
    // Add other props here
  }>();

  // Define Emits (if any)
  // const emit = defineEmits(['event-name']);

  // Reactive State
  const count = ref(0);

  // Computed Properties
  const doubleCount = computed(() => count.value * 2);

  // Methods
  const increment = () => {
    count.value++;
    // emit('event-name', count.value);
  };

  // Lifecycle Hooks
  onMounted(() => {
    console.log('[ComponentName]: Component mounted with title:', props.title);
  });
  </script>

  <template>
    <div>
      <h1>{{ props.title }}</h1>
      <p>Count: {{ count }}</p>
      <p>Double Count: {{ doubleCount }}</p>
      <button @click="increment">Increment</button>
      <!-- Component template -->
    </div>
  </template>
  ```

### State Management

- Use Pinia with the composition API for state management.
- Follow the store pattern established in the `stores/` directory.

### Event Handling

- For cross-component communication where props/emits are not suitable, prefer using VueUse composables like `useEventBus` if it fits the project\'s needs.
- Example using VueUse `useEventBus`:

  ```typescript
  // composables/useAppEventBus.ts (or similar)
  import { useEventBus } from '@vueuse/core';

  // Define specific event types/payloads
  export interface AppEvents {
    customEvent: { message: string };
    anotherEvent: number;
    // Add other events here
  }

  // Create typed event buses
  export const customEventBus =
    useEventBus<AppEvents['customEvent']>('custom-event');
  export const anotherEventBus =
    useEventBus<AppEvents['anotherEvent']>('another-event');

  // To emit an event from a component
  // import { customEventBus } from '~/composables/useAppEventBus'; // Adjust path
  // customEventBus.emit({ message: 'Hello from VueUse!' });

  // To listen for an event in another component
  // import { customEventBus } from '~/composables/useAppEventBus'; // Adjust path
  // onMounted(() => {
  //   const unsubscribe = customEventBus.on((payload) => {
  //     console.log('[ComponentName]: Custom event received:', payload.message);
  //     // Handle event
  //   });
  //
  //   // Clean up listener when component unmounts
  //   onUnmounted(() => unsubscribe());
  // });
  ```

### Pages CMS Integration

- Follow the PagesCMS documentation: https://pagescms.org/docs/
- Use the Nuxt Content `queryContent` composable for extracting CMS data.
- Example of using `queryContent`:
  ```typescript
  // Example in a page or component
  const { data: pageContent, error } = await useAsyncData('page-data', () =>
    queryContent('/path/to/content').findOne(),
  );
  if (error.value) {
    console.error('[ContentQuery]: Error fetching content:', error.value);
  }
  ```
- Files in `content/` represent the CMS structure.

## Coding Practices

### Commenting & Logging

- Add code comments for complex logic or non-obvious implementations.
- Use bracket style identifier for console logs:
  ```typescript
  console.log('[ComponentNameOrModule]: Message');
  console.error('[ServiceNameOrModule]: Error details:', error);
  ```

### Testing

- Write unit tests for core functionality (composables, store modules, utility functions) using Vitest.
- Write component tests for UI components using Vitest and `@vue/test-utils`.
- Write end-to-end tests for critical user flows using Playwright and `@nuxt/test-utils`.
- Test files should accompany implementation files when possible (e.g., `MyComponent.vue` and `MyComponent.spec.ts`).

### CSS & UI Development

- Always develop Tailwind CSS components and styles with a mobile-first approach.
- Adhere to the theme structure defined in the project's `tailwind.config.ts`.
- Prefer Tailwind's utility classes over custom CSS. If custom CSS is necessary, place it in `assets/scss/` and keep it minimal and well-justified.

### Component Library: shadcn-vue

This project uses **shadcn-vue** as the primary UI component library. Follow these guidelines:

#### Component Usage

- **Use shadcn components**: Always prefer shadcn-vue components over custom implementations for common UI patterns.
- **Component prefix**: All shadcn components are prefixed with `Ui` (e.g., `UiButton`, `UiCard`, `UiAlert`).
- **Auto-import**: Components are automatically imported via Nuxt's auto-import feature - no manual imports needed.

#### Available Components

Key shadcn components available in this project:

- `UiButton` - For all button interactions
- `UiCard`, `UiCardHeader`, `UiCardTitle`, `UiCardContent`, `UiCardFooter` - For card layouts
- `UiAlert`, `UiAlertDescription`, `UiAlertTitle` - For alerts and notifications
- `UiSheet`, `UiSheetContent`, `UiSheetHeader`, `UiSheetTitle` - For slide-out panels and mobile menus
- `UiTabs`, `UiTabsList`, `UiTabsTrigger`, `UiTabsContent` - For tabbed interfaces
- `UiInput`, `UiLabel`, `UiTextarea` - For form inputs
- `UiSeparator` - For visual separators

#### Component Examples

```vue
<!-- Button usage -->
<UiButton variant="default" size="lg">
  Click me
</UiButton>

<!-- Card usage -->
<UiCard>
  <UiCardHeader>
    <UiCardTitle>Card Title</UiCardTitle>
  </UiCardHeader>
  <UiCardContent>
    <p>Card content goes here</p>
  </UiCardContent>
  <UiCardFooter>
    <UiButton>Action</UiButton>
  </UiCardFooter>
</UiCard>

<!-- Alert usage -->
<UiAlert>
  <UiAlertTitle>Attention</UiAlertTitle>
  <UiAlertDescription>
    This is an important message.
  </UiAlertDescription>
</UiAlert>
```

#### Adding New Components

- Use the shadcn CLI to add new components: `npx shadcn-vue@latest add [component-name]`
- Components are automatically added to `components/ui/` directory
- Follow the New York style guide (pre-configured)

#### Migration Notes

- **Removed**: All `Awesome*` components have been removed and replaced with shadcn equivalents
- **Screen utilities**: Use `useScreen()` composable instead of removed `useAwesomeScreen()`
- **Types**: Layout types now use `Layout*` prefix instead of `Awesome*` (e.g., `LayoutPageNavbarMenu`)

## Documentation & Versioning

### Documentation

- Update the `docs/ai/` folder with any new information about added features, architectural changes, or significant decisions.
- Update the `README.md` and `CHANGELOG.md` files with significant changes, new features, or breaking changes.

### Version Control

- Follow the conventional commit message format:
  ```
  feat: [Scope] Short description of the feature (e.g., feat(auth): Implement user login page)
  fix: [Scope] Short description of the bug fix (e.g., fix(ui): Correct button alignment on mobile)
  docs: [Scope] Changes to documentation (e.g., docs(readme): Update setup instructions)
  style: [Scope] Code style changes (e.g., style(lint): Apply ESLint auto-fixes)
  refactor: [Scope] Code changes that neither fix a bug nor add a feature
  perf: [Scope] Code changes that improve performance
  test: [Scope] Adding missing tests or correcting existing tests
  chore: [Scope] Changes to the build process or auxiliary tools and libraries
  ```
- Follow the pull request template provided in the repository and ensure all sections are filled out.

## Nuxt Content Usage

### Content Management

- Use Markdown (`.md`) for primary content files, with appropriate syntax for headings, lists, links, code blocks, etc.
- Use YAML frontmatter within Markdown files for metadata (e.g., `title`, `description`, `author`, `date`, custom fields).
- JSON (`.json`) files can be used for structured data or configuration within `content/`.
- Use data binding with `{{ $doc.variable }}` or access frontmatter directly from the `data` object returned by `queryContent` within your Vue templates.
- Leverage Nuxt Content\'s built-in components like `<ContentRenderer>` and `<ContentDoc>` for rendering Markdown content.

## Specific Nuxt Features

- Use `useAsyncData` or `useFetch` for data fetching in pages and components, ensuring proper error handling and loading states.
- Utilize `useSeoMeta` and `useHead` for SEO optimization (titles, meta descriptions, Open Graph tags, etc.).
- Create global components in the `components/global/` directory for UI elements used frequently across the application.
- When applicable, suggest and use official or well-regarded Nuxt modules for specific functionalities (e.g., `@nuxt/image`, `@nuxtjs/tailwindcss`, `@pinia/nuxt`).

## Development Environment

### Recommended VSCode Extensions

- **Volar** for Vue/TypeScript support
- **Tailwind CSS IntelliSense** for Tailwind class completion
- **ESLint** for code quality
- **Prettier** for code formatting
- **i18n Ally** if working with internationalization
- **Markdown All in One** for better Markdown editing experience when working with content files

### Project Structure Conventions

- Follow file naming conventions present in the codebase:
  - Component files: PascalCase (e.g., `TeamMember.vue`)
  - Composables: camelCase with 'use' prefix (e.g., `useNavbarParser.ts`)
  - Store files: camelCase with 'use' prefix (e.g., `use-counter.ts`)
  - Page files: kebab-case for directories, index.vue for default pages
  - Content files: Follow the structure defined in `.pages.yml`

## What to Avoid

- **Deprecated Features**: Do not suggest or use any deprecated Nuxt.js or Vue.js features. Always use Vue 3 and Nuxt 3 compatible syntax and patterns.
- **Global CSS Overuse**: Avoid introducing new global CSS styles outside the established Tailwind configuration (`tailwind.config.ts`) or the `assets/scss/` directory structure. Prefer component-scoped styles or utility classes.
- **Ignoring Type Safety**: Do not generate JavaScript code; all new code should be TypeScript. Avoid using the `any` type without a compelling reason and justification; prefer more specific types or `unknown`.
- **Direct DOM Manipulation**: Avoid direct DOM manipulation. Use Vue's reactivity system and template refs when necessary.
- **Legacy Event Handling**: Avoid using direct DOM event listeners like `window.addEventListener`. Instead, use VueUse's event handling composables (e.g., `useEventListener`, `useEventBus`).
- **Overriding Core Conventions**: Do not suggest solutions that deviate significantly from established Nuxt conventions or the patterns already present in this project without strong justification.
- **Ignoring Core Libraries**: Do not implement custom solutions for problems already solved by VueUse, Pinia, or other core libraries in the project.
