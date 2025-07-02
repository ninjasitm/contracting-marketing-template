# Contracting Marketing Template

A professional marketing website template specifically designed for contracting companies, built with Nuxt 3. This template leverages a flat-file CMS approach through PagesCMS.org, eliminating the need for traditional backend APIs while still providing robust content management capabilities.

![npm](https://img.shields.io/npm/v/%40nuxt-awesome%2Ftheme)
![NPM](https://img.shields.io/npm/l/%40nuxt-awesome%2Ftheme)
![npm](https://img.shields.io/npm/dm/%40nuxt-awesome/theme)

## Status

[![Build and Upload](https://github.com/ninjasitm/contracting-marketing-template/actions/workflows/build.yml/badge.svg)](https://github.com/ninjasitm/contracting-marketing-template/actions/workflows/build.yml)
[![Run Tests](https://github.com/ninjasitm/contracting-marketing-template/actions/workflows/test.yml/badge.svg)](https://github.com/ninjasitm/contracting-marketing-template/actions/workflows/test.yml)
[![Release](https://github.com/ninjasitm/contracting-marketing-template/actions/workflows/release.yml/badge.svg)](https://github.com/ninjasitm/contracting-marketing-template/actions/workflows/release.yml)

## 🌟 Features

- **Flat-file CMS** - Content management through PagesCMS without needing a backend API
- **Responsive Design** - Mobile-first approach using TailwindCSS
- **Portfolio Showcase** - Dynamic work portfolio with detailed case studies
- **Team Member Display** - Easily manage and showcase team members
- **Contact Form** - Built-in form with optional HubSpot integration
- **Performance Optimized** - Fast loading with optimized assets
- **SEO-friendly** - Content structure optimized for search engines with rich metadata

## 📋 Prerequisites

- Node.js (v16+)
- PNPM or Bun package manager

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Generate static site
pnpm generate
```

## 🔧 Configuration

### CMS Configuration

This template uses [PagesCMS](https://next.pagescms.org) to configure the flat-file CMS:

- Admin Interface: https://next.pagescms.org/sign-in
- Project Dashboard: https://next.pagescms.org/ninjasitm/contracting-marketing-starter

The `.pages.yml` file in the root directory defines the content structure for the CMS.

### Content Structure

Content is stored in JSON and Markdown files in the `content/` directory:

- **Page Content**: `content/_pages/` - JSON files for each page
- **Work Portfolio**: `content/_work/` - Markdown files for work examples
- **Team Members**: `content/_about/teamMembers.json` - Team information
- **Global Config**: `content/config.json` - Site-wide settings
- **Clients**: `content/clients.json` - Client information

## 📂 Project Structure

```
/ (root)
├── .pages.yml                  # PagesCMS configuration
├── app/                        # Main application code
│   ├── content/                # Content files (JSON/MD)
│   ├── pages/                  # Vue pages (automatic routing)
│   └── stores/                 # State management (Pinia)
├── assets/                     # Static assets
├── components/                 # Vue components
├── composables/                # Vue composables
├── docs/                       # Documentation
│   ├── ai/                     # AI assistance documentation
│   ├── TAILWIND_THEME.md       # Tailwind theme guidelines
│   └── TEMPLATE_USAGE.md       # Template usage instructions
├── layouts/                    # Vue layouts
├── modules/                    # Nuxt modules
├── public/                     # Public assets
└── utils/                      # Utility functions
```

## 📖 Documentation

### Internal Documentation

- [Template Usage Guide](docs/TEMPLATE_USAGE.md) - How to use this template
- [Tailwind Theme Documentation](docs/TAILWIND_THEME.md) - Styling guidelines
- [Project Overview](docs/ai/overview.md) - Project overview and key technologies
- [Architecture](docs/ai/architecture.md) - System architecture details
- [Feature Checklist](docs/ai/feature-checklist.md) - Feature implementation status
- [Codebase Structure](docs/ai/codebase-structure.md) - Detailed codebase organization

### External Resources

- [Nuxt 3 Documentation](https://nuxt.com/docs) - Official Nuxt documentation
- [TailwindCSS Documentation](https://tailwindcss.com/docs) - CSS framework documentation
- [PagesCMS Documentation](https://pagescms.org/docs) - CMS documentation
- [Nuxt Content Module](https://content.nuxtjs.org/) - Content module documentation
- [Nuxt Awesome Demo](https://nuxt3-awesome-starter.vercel.app/) - Demo of the base template

## 💻 Development

### Key Commands

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix
```

### Development Guidelines

1. **Mobile-First Approach**: Always develop components for mobile first
2. **Code Comments**: Add detailed comments for all new functionality
3. **Testing**: Write tests for new features
4. **Linting**: Ensure all code passes linting checks
5. **Documentation**: Update documentation when adding features

### Event Handling

Use the bus pattern with emit and mitt functionality instead of window.addEventListener:

```javascript
// Example
import { useEmitter } from '~/composables/useEmitter';

// In component
const emitter = useEmitter();
emitter.emit('event-name', { data });

// To listen
emitter.on('event-name', (data) => {
  // Handle event
});
```

### Component Development

Prefer using the composition API and `<script setup>` syntax:

```vue
<script setup>
const props = defineProps({
  // props definition
});
// component logic here
</script>

<template>
  <!-- template here -->
</template>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the terms of the MIT license.

## 👥 Acknowledgements

- Based on [Nuxt 3 Awesome Starter](https://github.com/viandwi24/nuxt3-awesome-starter)
- Built with [Nuxt 3](https://nuxt.com/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
