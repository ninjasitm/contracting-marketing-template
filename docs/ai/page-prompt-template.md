# Page Implementation Prompt Template

## Standard Implementation Prompt

Implement the $PAGE_NAME page design from this URL: $URL

Follow the systematic 5-phase approach documented in docs/ai/page-implementation-overview.md. Prioritize reusing existing components in this order: Header, Footer, Hero, CallToAction, Button, Card, and other shadcn components. For any new components needed, first check components/ui/ for available shadcn components, then create custom components following the established patterns. Use the current Tailwind configuration with existing design tokens (brand-dark, light-green, neutral-gray) but ignore custom radiuses and fonts. Implement mobile-first responsive design, ensure WCAG 2.1 AA accessibility compliance, optimize images with NuxtImg, and update content/\_pages/$PAGE_NAME.json and .pages.yml with the new content structure. Ensure that all content is editable in the CMS. Create TypeScript interfaces for all new components and follow the existing component composition patterns. Achieve 100% visual fidelity to the design while maintaining performance optimization and code quality standards.

## Usage Instructions

1. Replace the URL with your specific design URL
2. Update the content file path if implementing a different page (e.g., content/\_pages/about.json)
3. Adjust component priorities if different existing components are available
4. Modify design tokens if the project uses different color schemes

## Template Variables

- `$URL`: Replace with actual design URL
- `$PAGE_NAME`: Replace with target page name (home, about, services, etc.)
