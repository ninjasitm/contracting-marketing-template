# Component catalog

These are app-local components in a clone-and-customize **private pnpm workspace**, not a published Nuxt layer or npm component package. Start with the clone/install instructions in [Template Usage](TEMPLATE_USAGE.md). Keep Inter, Montserrat and the existing tokens unless deliberately changing the brand.

The public, opt-in route `/_dev/docs/components` demonstrates the closed component lanes with fictional plans, people, projects and partner cards. It is not protected by its `_dev` name. Remove `apps/web/app/pages/_dev/docs/components.vue` before production if unwanted. Existing client-logo data comes from `apps/web/content/clients.json`; replace it before launch. Example project cards are non-clickable to avoid imaginary case-study routes. Article examples are sample cards, not published articles.

**Second-pass status:** examples now include BackgroundEffect and both Slideshow layouts, composed from source contracts. Runtime/browser verification belongs to the parent’s final integration pass; adding a demonstration is not a runtime validation claim.

## Imports and composition

`App`, `Ui` and `Layout` are configured scanner prefixes. Other folders need explicit imports. The showcase explicitly imports its layout transition too, avoiding guessed registration names.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import ServicePackages from '@/components/services/ServicePackages.vue';
import FeaturedProjectCard from '@/components/work/FeaturedProjectCard.vue';
import AboutHero from '@/components/about/AboutHero.vue';
const plans = [{ name: 'Your plan', price: 'Your price', recommended: true, features: ['Your feature'] }];
</script>
<template>
  <ServicePackages :packages="plans" title="Choose a package"
    recommended-label="Recommended" href="/contact" cta="Discuss this plan" />
</template>
```

Only compose what your site needs; do not automatically attach overlays or transitions to every route. Use app-local public assets such as `/images/placeholder.svg` for drafts and replace with approved images. Do not reference the retired root source folders.

## Accessible UI families

Import named exports from `@/components/ui/<family>`. They retain the local variants and styling. Pair every input with a visible label; give dialogs a title and description. `as-child` puts trigger behavior on one real button/link, avoiding nested interactive elements.

| Family | Useful composition / action |
| --- | --- |
| accordion | `<Accordion type="single" collapsible><AccordionItem value="brief"><AccordionTrigger>Brief</AccordionTrigger><AccordionContent>Details</AccordionContent></AccordionItem></Accordion>` |
| dialog | `<Dialog><DialogTrigger as-child><Button>Open</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Title</DialogTitle><DialogDescription>Purpose</DialogDescription></DialogHeader>Content</DialogContent></Dialog>`; use `v-model:open` for controlled state |
| select | `<Select v-model="choice"><SelectTrigger aria-labelledby="choice-label"><SelectValue placeholder="Choose" /></SelectTrigger><SelectContent><SelectItem value="plan">Plan</SelectItem></SelectContent></Select>` with a visible `id="choice-label"` label; item values must be nonempty |
| checkbox | `<Checkbox id="agree" v-model="agreed" /><label for="agree">Agree</label>`; state can also be indeterminate |
| radio-group | `<RadioGroup v-model="size" aria-label="Size"><RadioGroupItem id="small" value="small" /><label for="small">Small</label></RadioGroup>` |
| badge | `<Badge variant="outline">Example</Badge>`; a badge is a status label, not a button |
| popover | `<Popover><PopoverTrigger as-child><Button>Note</Button></PopoverTrigger><PopoverContent>Supporting note</PopoverContent></Popover>` |
| navigation-menu | `<NavigationMenu><NavigationMenuList><NavigationMenuItem><NavigationMenuTrigger>Explore</NavigationMenuTrigger><NavigationMenuContent><NavigationMenuLink as-child><a href="#plans">Plans</a></NavigationMenuLink></NavigationMenuContent></NavigationMenuItem></NavigationMenuList></NavigationMenu>` |
| carousel | `<Carousel aria-label="Examples"><CarouselContent><CarouselItem>Card</CarouselItem></CarouselContent><CarouselPrevious /><CarouselNext /></Carousel>`; focus the region for arrow keys, or use buttons/drag; `@init-api` exposes the Embla API. Place controls inside the carousel; use static positioning where edge controls would clip |

## Proof, portfolio and editorial

Imports below are relative to `@/components/`. Values shown are contract shapes, not customer claims.

| Component path | Usage |
| --- | --- |
| `about/StatCard.vue` | `<StatCard number="12" label="Approved metric" />` |
| `about/ValueCard.vue` | `<ValueCard title="Clarity" description="Your working principles" />` |
| `about/TestimonialCard.vue` | `<TestimonialCard quote="Approved quote" author="Approved author" role="Role" company="Company" :avatar="avatar" />` |
| `work/FeaturedProjectCard.vue` | `<FeaturedProjectCard :project="{ title, slug, description, heroImage, client }" :clickable="false" />`; optional `client` object, `compact`, safe `href`; clickable cards otherwise link to `/work/:slug` |
| `work/RelatedProject.vue` | `<RelatedProject :project="project" :clickable="false" />`; compact portfolio card |
| `work/FilterSection.vue` | `<WorkFilters section-title="Projects" :categories="[{ name: 'Design', filter: 'design' }]" :current-category="category" @category-change="category = $event" />`; null means all; filter the displayed projects yourself |
| `services/FeaturedWorkSection.vue` | `<FeaturedWorkSection :projects="[{ title, description, image, category, url }]" />`; also accepts full Project entries and a clients lookup; `clickable` defaults false |
| `app/BenefitsSection.vue` | `<AppBenefitsSection title="Benefits" :items="[{ title, description, icon, items: ['Optional bullet'] }]" />`; nested bullet lists are optional |
| `app/TestimonialSection.vue` | `<AppTestimonialSection :testimonial="{ quote, author, position, avatar }" />` |
| `app/ClientLogoScroll.vue` | `<AppClientLogoScroll />`; existing content-backed logo-only strip, distinct from rich partner cards |
| `app/Faq.vue` | `<AppFaq title="Questions" :items="[{ question, answer }]" />`; native expandable details |
| `posts/BlogPostCard.vue` | `<BlogPostCard :post="{ title, slug, summary, date, heroImage, author, tags }" />`; only link to real published posts in production |
| `posts/FilterSection.vue` | `<PostFilters v-model="tag" :options="[{ label: 'All', value: '' }, { label: 'Design', value: 'design' }]" />`; caller supplies All and filters the cards |

See [Template Usage](TEMPLATE_USAGE.md) for Content 2 published post queries and PagesCMS references. The catalog uses local example arrays instead of importing private company datasets.

## Packages and rich partners

`ServicePackages` is a static comparison grid, not the pricing carousel. Its `packages` retain `name`, `hours`, `price`, `features`, `bestFor`; explicit `recommended` controls the badge rather than assuming the middle item. Section props are `title`, `recommendedLabel`, `href`, `cta`; each package can override `href` and `cta`. Without a safe destination, no action is rendered.

```vue
<AppPricingCarousel :plans="[{ title: 'Your plan', price: '$100', unit: 'month',
  unitAmount: '1', description: 'Your terms', features: ['Feature'], featured: true,
  textAlign: 'left', actionButton: { label: 'Discuss', url: '/contact' } }]" />
<AppPartnerScroll :partners="[{ name: 'Approved partner', logo: '/partner.svg',
  heroImage: '/partner-cover.jpg', description: 'Approved description',
  services: ['planning'], url: 'https://example.com' }]"
  title="Partners" cta="Learn more" speed="slow" :new-tab="true" />
```

PricingCarousel accepts overall `textAlign` and per-plan overrides; it has navigation controls, not autoplay. PartnerScroll accepts `animate` (set false for a static grid), `slow/normal/fast` speed and `newTab`. Persistent pause/resume and hover/focus pause are included; reduced motion produces a complete static list. Repeated cards are inert/nonfocusable. Image errors fall back from hero image to logo to an initial. New-tab links include noopener/noreferrer and an accessible notice. Safe-link handling rejects unsafe action destinations.

## Headers, team and optional motion

```vue
<AboutHero title="Your team" :members="members" :autoplay="false" />
<AboutHero mode="typer" title="Stable accessible heading"
  typer-begin="We" :typer-text="['plan', 'build']" typer-end="together" />
<AboutHeroMember :members="members" v-model:paused="paused" />
<AppDetailHero title="Project title" hero-mode="image" :image="image"
  image-position="after" back-link-to="/work" back-link-text="All projects" />
<AppWordScramble text="Your heading" :animate="animate" animation-type="linear"
  :speed="50" :delay="5" :loop="false" />
<AppLogoLoader logo-src="/brand.svg" message="Preparing…" :loading="loading" size="sm" />
<LogoZoomTransition :show="show" logo-src="/brand.svg" :duration="700"
  @complete="show = false" />
```

Explicitly import AboutHero, AboutHeroMember and LogoZoomTransition from their `about/` and `layouts/` files. Hero members use `{ name, position?, photo?, featurePhoto?, slug? }`. AboutHero's optional `loadMembers` queries the existing `_about/teamMembers` collection; defaults to false. Use supplied members for predictable examples. AboutHeroMember supports controlled pause, autoplay and image/height classes. Typer mode includes a pause control and reduced-motion fallback; `title` supplies stable accessible text. DetailHero also supports background mode, overlay classes and layout classes without adding a Navbar.

WordScramble keeps stable accessible text while animated glyphs are hidden from assistive technology. `init`, `characterPool`, `speed` (milliseconds), `delay` (scramble ticks), `random/linear` animationType, `tag`, `loop` and `animate` are configurable. Use an external button bound to `animate` for a pause/static control. Invalid timings are normalized and timers cleaned on restart/unmount. LogoLoader uses a supplied logo, never a fixed company asset. LogoZoomTransition is finite (duration capped at five seconds), emits `loaded` and `complete`, and bypasses reduced motion; opt in with a button, not a forced introduction.

## Content controls

```vue
<AppContentTabs v-model="selected" :items="items" title="Sections">
  <template #detail="{ item }"><p>Selected: {{ item.title }}</p></template>
  <template #empty><p>No sections available.</p></template>
</AppContentTabs>
<AppContentTabDetail v-if="currentItem" :item="currentItem" />
<AppFilterBar v-model="filters" v-model:search-query="query" :facets="facets" />
```

ContentTabItem: `{ id, title, image?, summary?, description?, duration?, topics? }`. Tabs support controlled selection or `defaultValue`, labels, description and empty/detail slots. Guard undefined detail items before rendering. FilterBar facets are `{ key, label, placeholder?, options: [{ label, value }] }`; model is a string record. It emits updated filters/search and `reset`, clearing both. The caller must derive visible results; the showcase does this and provides a no-results state.

## Contact: one existing backend

```vue
<AppContactForm heading="Contact us" description="Tell us about your project"
  :labels="{ fullName: 'Your name' }" :categories="['Planning', 'Support']"
  submit-text="Send message" success-text="Message accepted" @success="onSuccess">
  <template #success><p role="status">Message accepted.</p></template>
</AppContactForm>
<AppContactModal v-model:open="open" title="Contact us" description="Send a message"
  trigger-text="Open contact form" :form-props="{ categories: ['Planning', 'Support'] }"
  @close="onClose" @success="onSuccess" />
```

Modal also supports a `trigger` slot. Dismissal unmounts the dialog layer but retains its instance-owned form controller: draft, pending request, errors and success survive reopening. Modal `success` can fire while closed; each modal has isolated state. Form labels, categories, submission/success copy and success slot are configurable. Keyboard validation focuses the first invalid field; service failures retain input and display an error. The payload remains `{ fullName, email, phone, message }` to `/api/contact/send-email`: category is prefixed into message, not sent as another field. Message must be 10–500 characters, with the category prefix counting toward the 500-character maximum.

For your own remountable form, own the optional controller outside the form’s lifetime:

```vue
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useContactForm, type ContactFormState } from '@/composables/useContactForm';
const visible = ref(true);
const state: ContactFormState = useContactForm('Planning');
// Observe persistent state here if completion must be handled while the form is absent.
watch(state.submitted, done => { if (done) visible.value = true; });
</script>
<template>
  <AppContactForm v-if="visible" :state="state" :categories="['Planning', 'Support']" />
</template>
```

`useContactForm(initialCategory?)` returns reactive `values` (`fullName/email/phone/message/category`) and refs `errors`, `submitting`, `submitted`, `submitError`. Keep the same controller for a form instance; do not share one across unrelated customers/forms. Without `state`, ContactForm creates its own. Existing `success` event has no payload and the `success` slot remains supported. The catalog includes a hide/restore example without executing a submission automatically.

**The showcase forms hit the live endpoint.** Configure the existing website mail adapter/environment securely before real use; never put credentials in public runtime config. For browser verification, intercept this endpoint and mock success and failure before pressing Submit. Do not send real mail for a demo. No second backend, CRM submissions, sales datasets or undocumented business integrations were ported. Existing optional integrations require separate deliberate configuration. No image-lightbox/video capability is implied by these patterns.

## Decorative backgrounds

Explicit import: `import BackgroundEffect from '@/components/app/BackgroundEffect.vue'` (or use the `AppBackgroundEffect` scanner name).

```vue
<div class="relative isolate min-h-80 overflow-hidden rounded-2xl">
  <BackgroundEffect effect="waves" mode="section" fade="linear"
    :disabled="disabled" :options="{ mouseControls: false, touchControls: false }"
    @active-change="active = $event" />
  <div class="relative z-10 bg-background/95 p-8">Readable foreground content</div>
</div>
```

`effect`: `none | waves | net | dots | topology` (default none). `options`: `BackgroundEffectOptions`, a record of string/number/boolean/undefined renderer settings; these override theme presets. `fade`: `none | linear | step`; `mode`: `section | fixed` (default section); `disabled` prevents the renderer. `active-change` emits a boolean, not an error reason. False may mean disabled/none, loading, offscreen, reduced motion or unavailable runtime; always retain a readable static design.

Waves/net/dots lazily import Three/Vanta and require WebGL. Topology lazily imports p5/Vanta on the client and does **not** use the WebGL availability gate. The component observes section visibility, theme and reduced-motion changes and cleans up its runtime. These source behaviors still need actual-browser checks. The catalog starts disabled, with controls for all five selections and three fades; enabling it mounts a real decorative renderer rather than a placeholder card.

Fixed mode is intentionally documentation-only in the catalog. To opt in, mount `<BackgroundEffect v-if="preview" mode="fixed" ... />` only while a finite preview is active. Put an always-visible close button above it, automatically clear `preview` after a short timeout, clear that timer on unmount, and keep all foreground content readable. Do not mount a global canvas as a default site introduction. Prefer section mode unless a page-wide background is explicitly needed.

## Slideshows and Content 2 references

```vue
<script setup lang="ts">
import Slideshow from '@/components/app/Slideshow.vue';
import type { SlideshowSlide } from '@/types/slideshow';
const slides: SlideshowSlide[] = [
  { type: 'generic', title: 'Your introduction', description: 'Your copy',
    image: '/images/placeholder.svg', imagePosition: 'right', textAlignment: 'left',
    link: '/about', cta: { text: 'Discuss a project', url: '/contact' } },
  { type: 'post', postRef: '/_posts/data/template-example.md', image: '/images/placeholder.svg' },
];
</script>
<template>
  <Slideshow layout="hero" :slides="slides" size="small" alignment="center-left"
    :autoplay="true" :autoplay-delay="6000" navigation-style="dots" />
  <Slideshow layout="scroll-slide" :slides="slides" size="medium"
    :scroll-freeze="false" :autoplay="false" navigation-style="text" />
</template>
```

Required props: `layout` (`hero | scroll-slide`) and `slides`. Options: `scrollFreeze` (default false), `autoplay` (default false), `autoplayDelay` (milliseconds, default 5000), `navigationStyle` (`icons | text | dots`), `size` (`small | medium | large | full`), `alignment` (`top-left | top-center | top-right | left | center | right | center-left | center-right`), `showNavigation`, `backgroundEffect`, `backgroundEffectOptions`, `backgroundEffectFade`, `backgroundEffectMode`, `referenceResolver`. Background options mirror the effect contracts above; use section mode. Multiple instances use independent async-data keys.

Slides accept `type`, reference fields, `title`, `description`, `image`, `link`, `cta: { text, url, type? }`, `backgroundClass`, `textColor`, `alignment`, `textAlignment` (`left | center | right`) and `imagePosition` (`left | right`). Authored fields override resolved content. CTA and detail links are separately checked after resolution/overrides and rendered independently, not as a full-slide click overlay. The catalog hero has autoplay enabled with a persistent built-in pause control and an external enable/disable control; the vertical instance is manual. Final checks must confirm hover/focus, user pause, reduced motion, document visibility and Embla reinitialization cannot unexpectedly restart playback.

Resolver exports from `@/utils/resolve-slides`: `resolveSlides`, `resolveReferencedSlide`, `sanitizeSlide`, plus types `ResolvedSlide`, `ContentQuery`, `QueryContentFn`, `SlideReferenceResolver`. QueryContentFn takes a path and returns a fresh Content 2 builder exposing `find()`; pass `path => queryContent(path)`, not Content 3 APIs.

| Slide type | Reference field / real local collection |
| --- | --- |
| `post` (`article` alias) | `postRef`, `_posts/data`; requires `published: true`; derives `/posts/:slug` |
| `work` | `workRef`, `_work/data`; requires `published: true`; derives `/work/:slug` |
| `teamMember` (`person` alias) | `teamMemberRef`, `_about/teamMembers`; derives `/about` |
| `testimonial` | `testimonialRef`, `_testimonials`; uses approved quote/author/avatar |
| `service` | `serviceRef`, `_pages/services`; searches the page’s `services` array, matching id/title; derives `/services` |
| `generic` | No query; authored slide |

`contentId` is an alternative reference. References match slug, the last `_path` segment, or the full Content 2 `_path` when starting with `/`; `.md` suffixes are stripped. Filesystem names are not guessed routes. The actual published `template-example.md` supplies the catalog’s CMS slide. Disabled documents (`enabled: false`) are excluded. Missing, unpublished or failed references retain a slide only if an authored title supplies a fallback; otherwise they are omitted. Add publication fields deliberately if you want existing work content to resolve. Service records do not get a fabricated per-service detail route.

Custom types are consumer extensions, not built-in course/collaboration/partner collections or invented routes:

```ts
import type { SlideReferenceResolver } from '@/utils/resolve-slides';
// fetchApprovedEntry is your own trusted asynchronous data source.
const referenceResolver: SlideReferenceResolver = async slide => {
  if (slide.type !== 'approved-entry' || !slide.contentId) return null;
  const entry = await fetchApprovedEntry(slide.contentId);
  return entry ? { ...slide, title: slide.title ?? entry.title,
    description: slide.description ?? entry.summary,
    link: slide.link ?? entry.approvedUrl } : null;
};
// <Slideshow :reference-resolver="referenceResolver" ... />
```

The custom resolver is invoked for unknown types; known local types use the built-in mapping. Final sanitization still rejects unsafe links/CTA URLs. No external business integration is implied.

`useScrollFreeze` (default export from `@/composables/useScrollFreeze`) takes container and carousel API refs plus `{ totalSlides, enabled? }` as reactive options; returns `isActive`, `currentSlide`, `isTouchDevice`. It is opt-in on vertical multi-slide stories. Wheel capture applies only while sufficiently visible and another slide is available; boundaries restore normal scrolling. Touch/coarse pointer, reduced motion, control/zoom gestures, horizontal wheel and native input/nested ignored panels bypass capture. Mark custom nested panels `data-scroll-freeze-ignore`. Provide ordinary navigation and an accessible external disable control; no global scroll lock is needed.

## Pending final integration checks

- Actual effect canvases: all four runtimes, p5 topology separately from WebGL, theme changes, reduced motion, unavailable renderer fallback, visibility and cleanup.
- Actual Embla geometry: hero/vertical/manual/autoplay, independent instances, buttons/dots/drag/keyboard, persistent pause after resize/reInit, touch/wheel boundaries, offscreen slide focus/inertness and responsive contrast.
- Contact requests intercepted before submission: validation/focus, success/failure, dismissal during pending work, retained drafts, completion while closed, isolated instances and released dialog body/pointer state. No real email.
- Parent-owned framework/test/build/generation and desktop/mobile light/dark browser checks after source writers reconcile. No runtime verification is claimed by this pass.

## Reference attribution

Adapted patterns reference authenticated `ninjasitm/nitm-marketing` at `da649f7e374da848aac277d202a49942d708fc92`. Preserve component notices and [the copied MIT notice](reference/NITM_MARKETING_LICENSE.md). The source repository is not the clone URL for this template.
