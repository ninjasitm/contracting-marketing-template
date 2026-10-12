## Project Overview

This is a contracting-company marketing website built with Nuxt 4. The private pnpm workspace root forwards website scripts to the leading app, `@nitm/web` in `apps/web/`; `apps/server/` is an optional independent health-only Cloudflare Worker example. Content is managed as files through [PagesCMS.org](https://next.pagescms.org/); website contact submissions use a Nitro route inside `apps/web/`.

## Key Technologies and Structure

1. **Nuxt 4**: The website is built with Nuxt 4 and Vue 3
2. **TailwindCSS**: For styling
3. **Flat-file CMS**: Instead of a database, the content is stored in JSON and Markdown files in the content directory
4. **PagesCMS**: Used to manage and edit the content files through a CMS interface

The website uses `@nuxt/content` 2.13 and Content 2 APIs such as `queryContent()`. Keep its existing UI design system in `apps/web/components/ui/`; it is not a shared package.

## The .pages.yml File

The .pages.yml file is the heart of the content management system. It defines the structure of the content that can be edited through the PagesCMS interface. Let's break down what it does:

1. **Content Structure Definition**: It defines various content sections like homepage, about page, work portfolio, team members, etc.

2. **Field Definitions**: For each content section, it specifies what fields are available (text, rich text, images, lists, etc.)

3. **Media Handling**: It specifies where media files should be stored and accessed:

   ```yaml
   media:
     input: apps/web/public/media
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

For each page, content is stored in JSON files under `apps/web/content/_pages/`; dynamic content such as work items is stored in Markdown under `apps/web/content/_work/`.

## How the Content System Works

1. The .pages.yml defines the structure that PagesCMS will use to present an admin interface
2. Editors use the PagesCMS UI to edit content
3. The edited content is saved as files in `apps/web/content/`
4. The Nuxt app reads these files directly using Nuxt Content module to render the website
5. Content is structured in a way that makes it easy to query and filter

The CMS remains file-based and requires no content database. The contact endpoint remains a Nitro route in `apps/web`; the optional `apps/server` Worker is independent and is not used for website requests.

## Key Features

1. **Dynamic Portfolio**: Work items can be added, edited, and categorized through the CMS
2. **Team Member Management**: Add and edit team members with photos, positions and LinkedIn profiles
3. **Styling Configuration**: Colors and styles can be configured through the CMS with full control over branding
4. **Contact Form**: With optional HubSpot integration for lead generation
5. **SEO-friendly**: Content structure optimized for search engines with rich metadata
6. **Mobile-first Design**: Responsive layouts that work well on all device sizes
7. **Performance Optimized**: Fast loading with optimized assets and minimal JavaScript

This approach is ideal for marketing websites that need a CMS without complex database operations. Contact submission is handled by the existing Nitro endpoint. The sample post `apps/web/content/_posts/data/template-example.md` is published to provide an example; replace or unpublish it before launch.
