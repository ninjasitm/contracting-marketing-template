# Page Implementation Prompt Template

## Standard Implementation Prompt

Implement the $PAGE_NAME page design from this URL: $URL

Follow the systematic 5-phase approach documented in `docs/ai/page-implementation-overview.md`. Prioritize reusing existing components in this order: Header, Footer, Hero, CallToAction, Button, Card, and other shadcn components. For any new components needed, first check `apps/web/components/ui/` for available local design-system components, then create custom components in the appropriate `apps/web/components/` directory following established patterns. Only `components/layouts/` (`Layout` prefix), `components/ui/` (`Ui` prefix), and `components/app/` (`App` prefix) are globally scanned; explicitly import components in other feature folders. Use the existing tokens in `apps/web/tailwind.config.ts` and preserve established radii and typography (Inter for body text, Montserrat for headings) unless the user explicitly requests a redesign. Implement mobile-first responsive design, ensure WCAG 2.1 AA accessibility compliance, optimize images with NuxtImg, and update `apps/web/content/_pages/$PAGE_NAME.json` and the root `.pages.yml` with the new content structure. Ensure that all content is editable in the CMS. Create TypeScript interfaces for all new components and follow the existing component composition patterns. Achieve 100% visual fidelity to the design while maintaining performance optimization and code quality standards.

## Usage Instructions

1. Replace the URL with your specific design URL
2. Update the content file path if implementing a different page (e.g., `apps/web/content/_pages/about.json`)
3. Adjust component priorities if different existing components are available
4. Modify design tokens if the project uses different color schemes

## Template Variables

- `$URL`: Replace with actual design URL
- `$PAGE_NAME`: Replace with target page name (home, about, services, etc.)
