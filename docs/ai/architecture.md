# System Architecture - Contracting Marketing Template

This document presents the system architecture of the Contracting Marketing Template project to help AI agents quickly understand the structure and components of the project.

## Overview

The Contracting Marketing Template is a pnpm workspace led by the Nuxt 4 website `@nitm/web` in `apps/web`. `apps/server` is an optional independent health-only Cloudflare Worker example. PagesCMS manages the website's flat-file content, and its contact endpoint runs through Nitro in the website app.

## Key Technologies

- **Workspace**: pnpm (`apps/*` and `packages/*`)
- **Frontend Framework**: Nuxt 4 (based on Vue.js)
- **CSS Framework**: TailwindCSS
- **Content Management**: Pages CMS with flat-file approach
- **State Management**: Pinia
- **Content**: `@nuxt/content` 2.13 and Content 2 APIs (for example, `queryContent()`) for reading Markdown and JSON files
- **Deployment**: Existing Cloudflare Workers deployment; root scripts forward to `@nitm/web`

## Architecture Overview

```
┌─────────────────┐      ┌─────────────────┐
│   Content       │      │   CMS Editor    │
│   Editors       │◄────►│   (PagesCMS)    │
└─────────────────┘      └─────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Content Files  │
                         │ (JSON/Markdown) │
                         └─────────────────┘
                                  │
                                  ▼
┌─────────────────┐      ┌─────────────────┐
│   Client Side   │      │    Nuxt App     │
│    (Browser)    │◄────►│   (Vue/Nuxt)    │
└─────────────────┘      └─────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Static Files   │
                         │ (HTML/CSS/JS)   │
                         └─────────────────┘
```

## Content Management System

The `.pages.yml` file defines the structure of the content that can be edited through the PagesCMS interface:

1. **Media Configuration**:

   ```yaml
   media:
     input: apps/web/public/media
     output: /media
   ```

2. **Content Types**:

   - **file**: Single-instance content like homepage settings
   - **collection**: Multiple entries like work portfolio items

3. **Content Structure**:
   - Homepage (banner, core competencies, differentiators)
   - About Page (company info, team members)
   - Work Page (portfolio projects)
   - Process Page (company workflow)
   - Contact Page (contact form configuration)
   - Config (global settings)
   - Clients (client information)

## Nuxt Configuration

`apps/web/nuxt.config.ts` defines the website configuration:

- **SSR**: Client-side rendering only (ssr: false)
- **Modules**: TailwindCSS, Headless UI, Color Mode, Nuxt Content, etc.
- **Components**: Global component scanning is configured for `components/layouts/` (`Layout` prefix), `components/ui/` (`Ui` prefix), and `components/app/` (`App` prefix); components in other feature folders require explicit imports
- **CSS**: Custom SCSS variables and styles

## Project Structure

```
/ (private pnpm workspace root)
├── .pages.yml                  # PagesCMS config for apps/web content and media
├── package.json                # Private @nitm/contracting-marketing-template; scripts forward to @nitm/web
├── pnpm-workspace.yaml         # apps/* and packages/* workspace globs
├── apps/
│   ├── web/                    # @nitm/web — leading Nuxt website app
│       ├── app/pages/          # Vue routes
│       ├── app/stores/         # Pinia state
│       ├── stores/             # Existing additional Pinia store
│       ├── components/ui/      # Existing local design system
│       ├── server/api/         # Nitro contact endpoint
│       ├── content/            # PagesCMS content
│       ├── public/             # Static and CMS media
│       ├── assets/             # Styles and assets
│       ├── composables/        # Vue composables
│       ├── layouts/            # Vue layouts
│       ├── app.config.ts       # Site configuration
│       └── nuxt.config.ts      # Nuxt configuration
│   └── server/                 # Optional independent @nitm/server Worker example
└── packages/                   # Real shared packages only, when needed
```

The website contact endpoint stays inside the Nuxt/Nitro app. The optional `apps/server` example is separate and not a root website-script dependency. Keep the existing design system in `apps/web/components/ui/`; do not add another backend, extract a UI package, or add a task orchestrator speculatively.

## Data Flow

1. **Content Management**:

   - Content editors use PagesCMS.org to update website content
    - Changes are saved as JSON and Markdown files in `apps/web/content/`
   - Git-based workflow for version control of content changes

2. **Content Rendering**:

   - When the app loads, the Nuxt Content module reads the content files
   - Vue components render the content using reactive data bindings
   - Page navigation happens through the Vue Router

3. **Page Structure**:
    - Each page (Home, About, Work, Process, Contact) has its own Vue component
    - A common layout provides consistent header, footer, and navigation
    - Content is fetched and displayed based on the current route

4. **Contact Submission**:
   - The contact form calls a Nitro API route in `apps/web/server/api/`
   - Email handling remains part of the website application

## Key Components

1. **Page Components**:

   - Render content based on JSON configuration
   - Use composables for shared functionality

2. **Layout Components**:

   - Header with navigation
   - Footer with company information
   - Consistent branding across pages

3. **Work Portfolio**:

   - Dynamic list of work items
   - Detailed case study pages with problem/solution/process/results sections
   - Filtering by categories

4. **Team Display**:

   - Grid or list of team members
   - Individual member details with photo, position, and bio

5. **Contact Form**:
   - Standard form or optional HubSpot embed
   - Form validation
   - Success/error messaging

## Build and Deployment

1. **Development**:

   - Local Nuxt development server
   - Hot module replacement for efficient development
   - Content preview through local content files

2. **Build Process**:

    - Root build/generation scripts forward website tasks to `@nitm/web`
   - Optimized assets with CSS and JavaScript minification
   - Image optimization

3. **Deployment Options**:
    - Preserve the existing Cloudflare Workers target and Nitro contact endpoint
   - Optional CI/CD integration with GitHub actions

## Future Extensibility

The architecture is designed to be easily extensible:

1. **Additional Page Types**:

   - New page types can be added by extending the .pages.yml
   - Components can be reused across custom pages

2. **Theming**:

   - Theme customization through TailwindCSS configuration
   - Color scheme management for light/dark modes

3. **Internationalization**:

   - Content structure supports multiple languages
   - i18n can be added with Nuxt i18n module

4. **Analytics**:
   - Easy integration with Google Analytics or other trackers
   - Event tracking for form submissions and interaction metrics

## Conclusion

The Contracting Marketing Template separates its private pnpm workspace root from the `@nitm/web` Nuxt application. PagesCMS content remains flat-file based, while the Nitro contact endpoint is part of that same application and deployment.
