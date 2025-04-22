# Source Code Structure - Contracting Marketing Template

This document provides a comprehensive overview of the source code organization in the Contracting Marketing Template project to help AI agents quickly understand the structure and main functionalities.

## General Overview

The Contracting Marketing Template is a Nuxt 3-based marketing website template specifically designed for contracting companies. It uses a flat-file CMS approach through PagesCMS.org, making it possible to create and manage websites without needing a traditional backend API.

## Folder Structure

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
│   ├── pages/                  # Application pages (automatic routing)
│   │   ├── index.vue           # Home page
│   │   ├── about/              # About pages
│   │   ├── contact/            # Contact pages
│   │   ├── process/            # Process pages
│   │   ├── work/               # Work portfolio pages
│   │   └── _dev/               # Development/testing pages
│   └── stores/                 # Pinia stores
├── assets/                     # Static assets (SCSS, etc.)
├── components/                 # Reusable Vue components
├── composables/                # Vue composable functionalities
├── layouts/                    # Application layouts
├── modules/                    # Nuxt modules
├── plugins/                    # Nuxt plugins
├── public/                     # Public static files
└── utils/                      # Utilities and helper functions
```

## Key Components

### Page Components (app/pages/)

The application has the following main pages:

1. **index.vue**: Home page with banner, core competencies, and differentiators.

2. **about/index.vue**: Company information and team members.

3. **work/index.vue**: Portfolio listing page with filtering by categories.

4. **work/[slug].vue**: Dynamic project detail pages with case study content.

5. **process/index.vue**: Company work process description.

6. **contact/index.vue**: Contact form with optional HubSpot integration.

### Layout Components (components/layouts/)

1. **Page/**: Contains layout components like headers, footers, and navigation.
   - **Footer/**: Footer components including company address and social links.
   - **Header/**: Navigation bar and site header components.
   - **Loading.vue**: Loading state component.

### Feature Components

1. **about/TeamMember.vue**: Component for displaying team members with photos and information.

2. **work/ProjectCard.vue**: Card component for displaying work portfolio items.

3. **process/ProcessSection.vue**: Component for displaying process steps.

### UI Components (components/awesome/)

Core UI components that make up the application interface:

1. **AlertBanner.vue**: For displaying alert messages.

2. **Button/index.vue**: Reusable button component.

3. **Card/**: Card components for content display.

4. **Content/**: Content rendering components.

5. **Form/**: Form input components.

6. **Link/**: Navigation link components.

7. **ActionSheet/**: Mobile action sheet components.

8. **Tab.vue**, **Tabs.vue**: Tab navigation components.

## Content Structure

### Global Configuration (app/content/config.json)

This file contains global settings including:

- Website title
- Company name and contact information
- Site description
- Social links
- Navigation configuration
- Style/theme settings

### Page-specific Content (app/content/\_pages/)

Each main page has its own JSON configuration:

1. **home.json**:

   - Banner section with title, description, and CTA
   - Core competencies with lists of services
   - Differentiators section with icons and descriptions

2. **about.json**:

   - Page title and description
   - Team section configuration

3. **work.json**:

   - Portfolio page settings
   - Featured client configuration

4. **process.json**:

   - Process page title and description
   - Process sections with steps

5. **contact.json**:
   - Contact form configuration
   - Form fields and validation settings
   - HubSpot integration settings

### Work Portfolio Items (app/content/\_work/)

Each portfolio project is stored as a Markdown file with frontmatter:

- Basic project information (title, client, date)
- Status (published, ongoing)
- Categories
- Problem/solution description
- Process details
- Design samples
- Results metrics

### Client Information (app/content/clients.json)

Contains information about clients:

- Name and slug
- Logo
- Website URL
- Banner image

### Team Members (app/content/\_about/teamMembers.json)

Contains information about team members:

- Name and position
- Photo
- Description/bio
- LinkedIn URL

## How Content is Loaded

1. **Content Loading via Nuxt Content**:
   The pages use Nuxt Content's `queryContent()` to load data from the content files:

   ```javascript
   const data = await queryContent('/_pages/home').findOne();
   ```

2. **Dynamic Routes**:
   Work portfolio detail pages use dynamic routes with the `[slug].vue` pattern:

   ```javascript
   const projectData = await queryContent('/_work')
     .where({ slug: route.params.slug })
     .findOne();
   ```

3. **Content Filtering**:
   Content can be filtered, such as showing only published work items:

   ```javascript
   const projects = await queryContent('/_work')
     .where({ published: true })
     .find();
   ```

## State Management

Pinia stores are used for managing application state:

1. **use-counter.ts**: Example counter store.

2. **use-identity.ts**: User identity management.

Additional stores can be added as needed to manage application state.

## Styling Architecture

1. **TailwindCSS**: Primary styling method using utility classes.

2. **SCSS Variables**: Defined in assets/scss/\_variables.scss for global style tokens.

3. **Dynamic Styling**: Some components accept style objects from content files to allow CMS-based styling.

## Key Features Implementation

1. **Responsive Design**:

   - Mobile-first approach using TailwindCSS breakpoints
   - Responsive components that adapt to different screen sizes

2. **Contact Form**:

   - Standard form implementation with validation
   - Optional HubSpot embed via configuration

3. **Portfolio Filtering**:

   - Category-based filtering of work items
   - Dynamic query parameters

4. **Dynamic Components**:
   - Components that adapt based on content configuration
   - Reusable across different sections

## Performance Considerations

1. **Static Generation**:

   - Pages are pre-rendered at build time

2. **Lazy Loading**:

   - Components and images are lazy-loaded for performance
   - Images use responsive sizing attributes

3. **Asset Optimization**:
   - CSS and JS are minified in production builds
   - Images are optimized during build process

## Extensibility

The project is structured to facilitate extension in several ways:

1. **New Page Types**:

   - Add new JSON configuration files in app/content/\_pages/
   - Create corresponding Vue components in app/pages/

2. **Custom Components**:

   - Add new components in the components/ directory
   - Use in page templates as needed

3. **Styling Customization**:
   - Modify TailwindCSS configuration
   - Adjust SCSS variables for global changes

## Conclusion

The Contracting Marketing Template follows modern Nuxt.js/Vue.js development practices, with a clear separation of concerns between components, content, and configuration. The flat-file CMS approach with PagesCMS provides a flexible yet powerful content management solution without the need for a traditional backend API.
