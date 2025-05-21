# System Architecture - Contracting Marketing Template

This document presents the system architecture of the Contracting Marketing Template project to help AI agents quickly understand the structure and components of the project.

## Overview

The Contracting Marketing Template is a Nuxt 3-based marketing website template specifically designed for contracting companies. It uses a flat-file CMS approach through PagesCMS.org, making it easy to create and manage websites without needing a traditional backend API.

## Key Technologies

- **Frontend Framework**: Nuxt 3 (based on Vue.js)
- **CSS Framework**: TailwindCSS
- **Content Management**: Pages CMS with flat-file approach
- **State Management**: Pinia
- **Content**: Nuxt Content module for reading Markdown and JSON files
- **Deployment**: Static site generation, deployable on any static hosting service

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
     input: public/media
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

The `nuxt.config.ts` file defines the main Nuxt configuration:

- **SSR**: Client-side rendering only (ssr: false)
- **Modules**: TailwindCSS, Headless UI, Color Mode, Nuxt Content, etc.
- **Components**: Auto-imports for layouts and awesome components
- **CSS**: Custom SCSS variables and styles

## Project Structure

```
/ (root)
├── .pages.yml                  # PagesCMS configuration
├── app/                        # Main application code
│   ├── content/                # Content files (JSON/MD)
│   │   ├── _about/             # About page content
│   │   ├── _pages/             # Page-specific content
│   │   ├── _work/              # Work portfolio items (MD)
│   │   ├── clients.json        # Client information
│   │   └── config.json         # Global configuration
│   ├── pages/                  # Vue pages (automatic routing)
│   └── stores/                 # State management (Pinia)
├── assets/                     # Static assets
│   └── scss/                   # SCSS stylesheets
├── components/                 # Vue components
│   ├── about/                  # About page components
│   ├── awesome/                # Core UI components
│   ├── layouts/                # Layout components
│   ├── process/                # Process page components
│   └── work/                   # Work page components
├── composables/                # Vue composables
├── layouts/                    # Vue layouts
├── modules/                    # Nuxt modules
├── public/                     # Public assets
│   ├── images/                 # Static images
│   └── media/                  # CMS-managed media
└── utils/                      # Utility functions
```

## Data Flow

1. **Content Management**:

   - Content editors use PagesCMS.org to update website content
   - Changes are saved as JSON and Markdown files in the content directory
   - Git-based workflow for version control of content changes

2. **Content Rendering**:

   - When the app loads, the Nuxt Content module reads the content files
   - Vue components render the content using reactive data bindings
   - Page navigation happens through the Vue Router

3. **Page Structure**:
   - Each page (Home, About, Work, Process, Contact) has its own Vue component
   - A common layout provides consistent header, footer, and navigation
   - Content is fetched and displayed based on the current route

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

   - Static site generation with `nuxt generate`
   - Optimized assets with CSS and JavaScript minification
   - Image optimization

3. **Deployment Options**:
   - Any static hosting service (Netlify, Vercel, etc.)
   - No server-side code required
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

The Contracting Marketing Template architecture provides a modern, efficient approach to creating marketing websites. By leveraging Nuxt 3, TailwindCSS, and a flat-file CMS, it eliminates the need for complex server infrastructure while still offering robust content management capabilities.
