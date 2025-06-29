# Theme Extraction Prompt Template

## Standard Theme Extraction Prompt

Extract and implement the complete theme system from this design: $URL

Follow the systematic 5-phase approach documented in docs/ai/design-system-extraction-template.md. Prioritize enhancing existing components in this order: Header, Footer, Navbar, Hero, CallToAction, Button, Card, and other shadcn components. For any new theme tokens needed, update tailwind.config.ts with proper design token naming conventions. Use the established component patterns and maintain integration with existing app.config.ts configuration. Implement mobile-first responsive design, ensure WCAG 2.1 AA accessibility compliance with proper color contrast ratios, optimize theme assets with NuxtImg, and create comprehensive theme documentation in docs/ai/design-system.md. Ensure all existing components adopt the new theme consistently while maintaining backward compatibility and performance optimization standards.

## Usage Instructions

1. Replace the URL with your specific design URL containing the theme to extract
2. Update the theme name variable if implementing a specific branded theme
3. Adjust component enhancement priorities if different existing components are available
4. Modify brand color references if the project uses different primary colors

## Template Variables

- `$URL`: Replace with actual design URL containing the theme
- `$THEME_NAME`: Replace with specific theme name (e.g., "corporate", "modern", "minimal")
