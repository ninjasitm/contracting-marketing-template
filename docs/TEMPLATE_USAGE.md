# Marketing Site Template Usage Guide

This document provides comprehensive instructions on how to use this templatized marketing site to create websites for various clients.

## Overview

This marketing site template is built with:

- **Nuxt 3**: Vue.js framework for the frontend
- **TailwindCSS**: For styling
- **PagesCMS**: Flat-file CMS for content management
- **Content Files**: JSON and Markdown files in the `app/content` directory

## Pages Structure

The template includes these key pages:

1. **Home Page**: Landing page with banner, core competencies, and differentiators
2. **Services Page**: List of services offered with icons and features
3. **About Page**: Company information and team profiles
4. **Team Members**: Team member profiles and information
5. **Work Page**: Portfolio of previous work with case studies
6. **Process Page**: Description of the company's work process
7. **Contact Page**: Contact form with optional HubSpot integration

## How to Customize for a New Client

### Step 1: Clone the template

```bash
git clone [repository-url] client-name-website
cd client-name-website
```

### Step 2: Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Step 3: Update the content files

The content is stored in JSON files in the `app/content` directory:

- **General Configuration**: `app/content/config.json` - Update the company name, contact information, and branding
- **Homepage**: `app/content/_pages/home.json` - Update the banner, core competencies, and differentiators
- **Services**: `app/content/_pages/services.json` - Update the services offered
- **About**: `app/content/_pages/about.json` - Update the company information
- **Team**: `app/content/_about/teamMembers.json` - Update team member information
- **Process**: `app/content/_pages/process.json` - Update the company's process information
- **Work**: `app/content/_pages/work.json` - Update the featured work and categories
- **Work Items**: Files in `app/content/_work/` - Add/modify work portfolio items
- **Clients**: `app/content/clients.json` - Update client information

### Step 4: Update images and assets

Place the client's images in the appropriate directories:

- **Logo**: `public/media/` - Update with the client's logo
- **Service Icons**: `public/media/services/icons/` - Add icons for services
- **Team Photos**: `public/media/avatars/` - Add team member photos
- **Work Images**: `public/media/work/` - Add project images for the work portfolio
- **Client Logos**: `public/media/client/logos/` - Add client logos

### Step 5: Customize styling (optional)

Modify the styling by updating:

- **Color Scheme**: Update the colors in `config.json` for the navbar, footer, etc.
- **TailwindCSS**: Modify `tailwind.config.ts` if you need to extend the design system
- **SCSS Variables**: Update variables in `assets/scss/_variables.scss`

### Step 6: Connect to PagesCMS (optional)

1. Create an account on [PagesCMS.org](https://pagescms.org)
2. Create a new project
3. Connect the repository to PagesCMS
4. Configure the editor according to the `.pages.yml` file

### Step 7: Deploy the site

```bash
npm run build
npm run generate # Creates a static version of the site
```

Deploy the generated files from the `.output/public` directory to your hosting provider.

## Content Structure

### Services Page

The Services page is structured as follows:

```json
{
  "title": "Our Services",
  "description": "Main description of services",
  "services": [
    {
      "title": "Service Title",
      "icon": "/path/to/icon.svg",
      "description": "Service description",
      "features": ["Feature 1", "Feature 2", "Feature 3"]
    }
  ],
  "callToAction": {
    "title": "CTA Title",
    "description": "CTA description",
    "buttonText": "Button Text",
    "buttonUrl": "/contact"
  }
}
```

### About Page

The About page structure:

```json
{
  "heading": "About",
  "title": "Company Tagline",
  "description": "Company description",
  "teamMembersTitle": "Meet the Team"
}
```

Team members are defined in a separate file:

```json
{
  "members": [
    {
      "name": "Team Member Name",
      "position": "Position",
      "description": "Bio",
      "photo": "/path/to/photo.jpg",
      "linkedinUrl": "https://linkedin.com/..."
    }
  ]
}
```

### Work Page

The Work page structure allows for showcasing client projects:

```json
{
  "title": "Our Work",
  "description": "Description of work",
  "featuredClient": {
    "client": "client-slug",
    "description": "Project description"
  },
  "footer": {
    "title": "Ready to start a project?",
    "description": "Contact us to get started"
  }
}
```

## Customization Tips

### Adding New Services

To add new services:

1. Edit `app/content/_pages/services.json`
2. Add new service objects to the `services` array
3. Add corresponding icons in `public/media/services/icons/`

### Adding Team Members

To add team members:

1. Edit `app/content/_about/teamMembers.json`
2. Add new member objects to the `members` array
3. Add photos to `public/media/avatars/`

### Creating New Work Projects

To add new work projects:

1. Create a new Markdown file in `app/content/_work/`
2. Add the project details following the existing format
3. Add project images to the appropriate directories

## PagesCMS Editor Configuration

The `.pages.yml` file defines the content structure for the PagesCMS editor. If you need to modify the structure:

1. Update the `.pages.yml` file with new field definitions
2. Update the corresponding Vue components to use the new fields
3. Update the content JSON files to match the new structure

## Development

To start the development server:

```bash
npm run dev
```

## Component Structure

The template uses reusable Vue components for consistent UI elements:

- `components/services/ServiceFeature.vue` - For displaying service features
- `components/about/TeamMember.vue` - For displaying team members
- `components/work/ProjectCard.vue` - For displaying work projects

## Best Practices

1. **Content Separation**: Keep content and presentation separate
2. **Consistent Naming**: Use consistent naming conventions for files and components
3. **Device Testing**: Test the site on multiple devices and browsers
4. **Pattern Consistency**: Follow the existing page structure patterns
5. **Documentation**: Document any custom changes for future reference
6. **Image Optimization**: Optimize images before adding them to the site
7. **Reusable Components**: Use existing components where possible
8. **Responsive Design**: Ensure all pages look good on all device sizes
