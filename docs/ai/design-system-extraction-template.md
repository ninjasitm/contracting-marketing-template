# Design System Extraction Prompt Template

**Prequisites: Implied Requirements:**

- Responsive design for mobile-first approach
- Accessibility compliance (WCAG 2.1 AA)
- Integration with existing Nuxt.js/Vue.js architecture
- Tailwind CSS configuration updates for design tokens

**Existing Integration Points:**

- Current Header: `components/layouts/Page/Header.vue` with Navbar component
- Current Footer: `components/layouts/Page/Footer/index.vue` with modular sub-components
- Uses app.config.ts for centralized configuration management
- Follows shadcn/ui + reka-ui component patterns

**Key Architecture Insights:**

- Project uses TypeScript + Vue 3 Composition API
- Established design system with Tailwind configuration
- Mobile-first responsive design with drawer navigation
- Configuration-driven approach for content management

**Compnent Strategy: Replace/Update Existing Components (Recommended)**

- **Advantages**: Clean implementation, consistent design language, no legacy conflicts
- **Approach**: Update existing Header/Footer with Motiff design, create new Hero/CTA components
- **Integration**: Maintain existing configuration patterns and responsive behavior

**Cross-cutting Concerns:**

- **Accessibility**: Maintain WCAG 2.1 AA compliance with proper contrast ratios
- **Performance**: Optimize background images with responsive loading
- **SEO**: Maintain semantic HTML structure
- **Mobile**: Ensure touch-friendly interface elements

**Implementation Technologies:**

- **Framework**: Vue 3 + Nuxt.js (existing)
- **Styling**: Tailwind CSS with custom design tokens
- **Components**: shadcn/ui + reka-ui pattern (existing)
- **Icons**: Lucide icons (existing) + custom SVG assets from Motiff
- **Images**: Nuxt Image optimization for hero backgrounds

**Component Creation Priority:**

1. **First**: Use existing components (Header, Footer, Navbar)
2. **Second**: Use existing shadcn/ui components (Button, Card, Sheet)
3. **Third**: Enhance existing components with new styling
4. **Last**: Create new components only if absolutely necessary

## Standard Design System Extraction Prompt

Extract the design system and create foundational components from this MVP design: $URL

Analyze the design comprehensively to establish the project's design language by following this systematic approach:

### Phase 1: Design Token Analysis

- Extract color palette (primary, secondary, accent, neutral, semantic colors)
- Identify typography scale (font families, weights, sizes, line heights)
- Analyze spacing system (margins, paddings, gaps)
- Document border radius values and shadow styles
- Note breakpoint requirements for responsive design

### Phase 2: Tailwind Configuration Update

- Update `tailwind.config.ts` with extracted colors in the `theme.extend.colors` section
- Configure font families and weights in `theme.extend.fontFamily`
- Set up custom spacing values if needed in `theme.extend.spacing`
- Define border radius values in `theme.extend.borderRadius`
- Configure box shadows in `theme.extend.boxShadow`
- Ensure all design tokens are properly named and organized

### Phase 3: Core Component Creation

Create these essential components following the established patterns:

**Header Component (`components/Header.vue`)**

- Navigation structure and styling
- Logo placement and responsive behavior
- Mobile menu implementation
- Active/hover states for navigation items

**Hero Component (`components/Hero.vue`)**

- Main headline and subheading styling
- Call-to-action button integration
- Background treatment (images, gradients, etc.)
- Responsive layout adjustments

**CallToAction Component (`components/CallToAction.vue`)**

- Button styling variations (primary, secondary, outline)
- Hover and focus states
- Size variants (small, medium, large)
- Loading and disabled states

**Footer Component (`components/Footer.vue`)**

- Link organization and styling
- Contact information layout
- Social media integration
- Copyright and legal text styling

### Phase 4: Design System Documentation

- Create or update `docs/ai/design-system.md` with:
  - Color palette with hex values and usage guidelines
  - Typography scale and hierarchy
  - Spacing system documentation
  - Component usage examples
  - Accessibility considerations

### Phase 5: Integration and Testing

- Ensure all components use the new Tailwind tokens
- Test responsive behavior across all breakpoints
- Verify WCAG 2.1 AA accessibility compliance
- Validate color contrast ratios meet standards
- Test component composition and reusability

## Additional Requirements

- **TypeScript Integration**: Create proper interfaces for all component props
- **Accessibility**: Implement proper ARIA attributes and semantic HTML
- **Performance**: Optimize any extracted images with NuxtImg
- **Consistency**: Ensure design tokens follow established naming conventions
- **Mobile-First**: Implement responsive design starting from mobile breakpoints
- **Documentation**: Update component documentation with usage examples

## Template Variables

- `$URL`: Replace with actual MVP design URL
- `$BRAND_NAME`: Replace with client/project brand name if different from default

## Usage Instructions

1. Replace `$URL` with the specific MVP design URL
2. Analyze the design thoroughly before starting implementation
3. Focus on extracting reusable design tokens rather than page-specific styles
4. Prioritize creating a scalable design system foundation
5. Test all components in isolation before integration

## Expected Deliverables

- Updated `tailwind.config.ts` with complete design tokens
- Four core components (Header, Hero, CallToAction, Footer)
- Design system documentation
- Component usage examples
- Accessibility audit results
