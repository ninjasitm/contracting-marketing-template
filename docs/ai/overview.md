## Project Overview

This is a "Contracting Marketing Template" built on top of Nuxt 3 Awesome Starter. It's designed to create marketing websites for contracting companies without needing a traditional API backend. Instead, it uses a flat-file CMS approach through [PagesCMS.org](https://next.pagescms.org/), specifically for the project at https://next.pagescms.org/ninjasitm/contracting-marketing-starter.

## Key Technologies and Structure

1. **Nuxt 3**: The project is built with Nuxt 3, a Vue.js framework
2. **TailwindCSS**: For styling
3. **Flat-file CMS**: Instead of a database, the content is stored in JSON and Markdown files in the content directory
4. **PagesCMS**: Used to manage and edit the content files through a CMS interface

## The .pages.yml File

The .pages.yml file is the heart of the content management system. It defines the structure of the content that can be edited through the PagesCMS interface. Let's break down what it does:

1. **Content Structure Definition**: It defines various content sections like homepage, about page, work portfolio, team members, etc.

2. **Field Definitions**: For each content section, it specifies what fields are available (text, rich text, images, lists, etc.)

3. **Media Handling**: It specifies where media files should be stored and accessed:

   ```yaml
   media:
     input: public/media
     output: /media
   ```

4. **Content Types**:

   - `file` types for single-instance content (like homepage settings)
   - `collection` types for multiple entries (like work portfolio items)

5. **Field Validation**: It includes field validations, like requiring certain fields or specifying patterns for URLs

## Pages and Content Organization

The project includes several key pages:

1. **Home Page**: Main landing page with banner, core competencies, and differentiators
2. **About Page**: Company information and team members
3. **Work Page**: Portfolio of previous work with detailed case studies
4. **Process Page**: Description of the company's work process
5. **Contact Page**: Contact form with optional HubSpot form integration

For each page, content is stored in JSON files in content/\_pages/, and dynamic content like work items are stored in Markdown files in relevant directories (e.g., content/\_work/).

## How the Content System Works

1. The .pages.yml defines the structure that PagesCMS will use to present an admin interface
2. Editors use the PagesCMS UI to edit content
3. The edited content is saved as files in the content directory
4. The Nuxt app reads these files directly using Nuxt Content module to render the website
5. Content is structured in a way that makes it easy to query and filter

This architecture provides a fast, secure website that doesn't require a backend API but still offers CMS capabilities for non-technical users to update content.

## Key Features

1. **Dynamic Portfolio**: Work items can be added, edited, and categorized through the CMS
2. **Team Member Management**: Add and edit team members with photos, positions and LinkedIn profiles
3. **Styling Configuration**: Colors and styles can be configured through the CMS with full control over branding
4. **Contact Form**: With optional HubSpot integration for lead generation
5. **SEO-friendly**: Content structure optimized for search engines with rich metadata
6. **Mobile-first Design**: Responsive layouts that work well on all device sizes
7. **Performance Optimized**: Fast loading with optimized assets and minimal JavaScript

This approach is ideal for marketing websites that need a CMS but don't require complex database operations, user authentication, or other dynamic features that would require a backend API.
