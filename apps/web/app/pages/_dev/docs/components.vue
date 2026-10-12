<script setup lang="ts">
import { computed, ref } from 'vue';
import BlogPostCard from '@/components/posts/BlogPostCard.vue';
import FilterSection from '@/components/posts/FilterSection.vue';
import StatCard from '@/components/about/StatCard.vue';
import ValueCard from '@/components/about/ValueCard.vue';
import TestimonialCard from '@/components/about/TestimonialCard.vue';
import AboutHero from '@/components/about/AboutHero.vue';
import AboutHeroMember from '@/components/about/AboutHeroMember.vue';
import FeaturedProjectCard from '@/components/work/FeaturedProjectCard.vue';
import RelatedProject from '@/components/work/RelatedProject.vue';
import WorkFilters from '@/components/work/FilterSection.vue';
import FeaturedWorkSection from '@/components/services/FeaturedWorkSection.vue';
import ServicePackages from '@/components/services/ServicePackages.vue';
import LogoZoomTransition from '@/components/layouts/LogoZoomTransition.vue';
import BackgroundEffect from '@/components/app/BackgroundEffect.vue';
import Slideshow from '@/components/app/Slideshow.vue';
import { useContactForm } from '@/composables/useContactForm';
import type { BackgroundEffectName } from '@/types/background-effect';
import type { SlideshowSlide, SlideshowNavigationStyle } from '@/types/slideshow';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from '@/components/ui/navigation-menu';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

definePageMeta({ layout: 'page' });
useHead({ title: 'Marketing component examples' });

const selected = ref('');
const options = [{ label: 'All', value: '' }, { label: 'Content', value: 'content' }, { label: 'Design', value: 'design' }];
const posts = [
  { title: 'Plan your content', slug: 'example-content', summary: 'Fictitious card example. Replace this with your own published article.', tags: ['content'], author: 'Example author', date: '2026-01-15' },
  { title: 'Make the template your own', slug: 'example-design', summary: 'Fictitious card example showing a second topic. These example links are not published posts.', tags: ['design'] },
];
const filteredPosts = computed(() => posts.filter(post => !selected.value || post.tags.includes(selected.value)));
const faqs = [
  { question: 'Where do I edit website content?', answer: 'Edit files in apps/web/content, or use the configured PagesCMS workflow.' },
  { question: 'Do I need every section?', answer: 'No. Import only the components that help explain your project. These examples are opt-in.' },
];
const benefits = [
  { title: 'Content you control', description: 'Keep page content alongside your project in version control.', icon: 'lucide:file-text', items: ['Edit local files', 'Review changes before publishing'] },
  { title: 'Sections you can reuse', description: 'Compose pages using small components and your own copy.', icon: 'lucide:layout-template' },
];
const image = '/images/placeholder.svg';
const category = ref<string | null>(null);
const projects = [
  { title: 'EXAMPLE: Courtyard concept', slug: 'example-courtyard', client: 'Example studio', description: 'Fictional project for layout exploration.', heroImage: image, category: 'design' },
  { title: 'EXAMPLE: Workshop concept', slug: 'example-workshop', client: 'Example studio', description: 'A second fictional project, not a case study.', heroImage: image, category: 'content' },
];
const visibleProjects = computed(() => projects.filter(project => !category.value || project.category === category.value));
const members = [
  { name: 'Example Alex', position: 'Example designer', photo: image, slug: 'example-alex' },
  { name: 'Example Sam', position: 'Example coordinator', photo: image, slug: 'example-sam' },
];
const teamPaused = ref(true);
const packages = [
  { name: 'EXAMPLE: Explore', hours: '10 example hours', price: '$100 example', features: ['Planning session'], bestFor: 'Small concepts' },
  { name: 'EXAMPLE: Develop', hours: '20 example hours', price: '$200 example', features: ['Planning session', 'Concept review'], bestFor: 'Larger concepts', recommended: true },
];
const plans = packages.map(pkg => ({ title: pkg.name, price: pkg.price, unit: 'example package', unitAmount: '1', description: pkg.bestFor, features: pkg.features, featured: !!pkg.recommended, actionButton: { label: 'See contact example', url: '#contact-demo' } }));
const partners = [
  { name: 'EXAMPLE: Studio One', logo: image, description: 'Fictional partner showing a rich card, not a client endorsement.', services: ['planning', 'design'], url: 'https://example.com' },
  { name: 'EXAMPLE: Studio Two', logo: image, description: 'Another example partner. Outbound links use example.com.', services: ['content', 'review'], url: 'https://example.com' },
];
const scrambleAnimated = ref(false);
const loading = ref(true);
const transitioning = ref(false);
const contactOpen = ref(false);
const inlineFormVisible = ref(true);
const inlineFormState = useContactForm('Example planning');
const contactCompletions = ref(0);
const effect = ref<BackgroundEffectName>('waves');
const effectFade = ref<'none' | 'linear' | 'step'>('linear');
const effectDisabled = ref(true);
const effectActive = ref(false);
const effectNames: BackgroundEffectName[] = ['none', 'waves', 'net', 'dots', 'topology'];
const slideshowAutoplay = ref(true);
const slideshowNavigation = ref<SlideshowNavigationStyle>('dots');
const freezeScroll = ref(false);
const heroSlides: SlideshowSlide[] = [
  { type: 'generic', title: 'EXAMPLE: Plan', description: 'Authored slide with separate action and detail links.', image, imagePosition: 'right', textAlignment: 'left', link: '#content', cta: { text: 'Explore example plans', url: '#packages' } },
  { type: 'post', postRef: '/_posts/data/template-example.md', image, imagePosition: 'left', textAlignment: 'left' },
];
const verticalSlides: SlideshowSlide[] = [
  { type: 'generic', title: 'EXAMPLE: Explore', description: 'First fictional stage. Vertical navigation does not capture page scrolling by default.', image, textAlignment: 'left', cta: { text: 'Browse examples', url: '#proof' } },
  { type: 'generic', title: 'EXAMPLE: Review', description: 'Second fictional stage. At either boundary, optional wheel navigation lets page scrolling continue.', image, imagePosition: 'left', textAlignment: 'left', cta: { text: 'Read the template post', url: '/posts/template-example' } },
];
const tab = ref('plan');
const items = [
  { id: 'plan', title: 'EXAMPLE: Plan', summary: 'Start with a clear brief.', description: 'Fictional learning content for this catalog.', duration: '15 example minutes', topics: ['Goals', 'Audience'] },
  { id: 'build', title: 'EXAMPLE: Build', summary: 'Review the concept together.', topics: ['Structure', 'Review'], image },
];
const detail = computed(() => items.find(item => item.id === tab.value));
const facets = [{ key: 'topic', label: 'Topic', options: [{ label: 'Planning', value: 'plan' }, { label: 'Building', value: 'build' }] }];
const filters = ref<Record<string, string>>({});
const search = ref('');
const results = computed(() => items.filter(item => (!filters.value.topic || item.id === filters.value.topic) && `${item.title} ${item.summary}`.toLowerCase().includes(search.value.toLowerCase())));
const preference = ref('plan');
const checked = ref(false);
const radio = ref('compact');
const catalogSections = ['controls', 'proof', 'team', 'packages', 'motion', 'effects', 'slides', 'content', 'contact-demo'];
</script>

<template>
  <div class="w-full min-w-0 max-w-6xl mx-auto px-6 py-16 md:py-24 space-y-20">
    <header class="max-w-3xl">
      <p class="text-sm uppercase tracking-widest text-muted-foreground mb-4">
        Template examples
      </p>
      <h1 class="text-4xl md:text-5xl">
        Marketing components
      </h1>
      <p class="mt-6 text-lg text-muted-foreground leading-relaxed">
        An opt-in showcase for building your own pages. Example copy and article cards below are demonstrations, not customer claims or published articles.
      </p>
    </header>
    <nav
      aria-label="Component catalog"
      class="flex flex-wrap gap-3"
    >
      <a
        v-for="section in catalogSections"
        :key="section"
        :href="`#${section}`"
        class="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >{{ section.replaceAll('-', ' ') }}</a>
    </nav>
    <section
      id="controls"
      class="space-y-8 scroll-mt-24"
    >
      <h2 class="text-3xl">
        Everyday controls
      </h2>
      <p class="text-muted-foreground">
        Keyboard-friendly examples. These preferences change only this page.
      </p>
      <div class="grid gap-8 md:grid-cols-2">
        <Accordion
          type="single"
          collapsible
        >
          <AccordionItem value="setup">
            <AccordionTrigger>How do I start?</AccordionTrigger><AccordionContent>Clone the template, then choose the sections your website needs.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="theme">
            <AccordionTrigger>Can I keep the theme?</AccordionTrigger><AccordionContent>Yes. These examples use the existing fonts and design tokens.</AccordionContent>
          </AccordionItem>
        </Accordion>
        <div class="space-y-4">
          <label
            id="example-select-label"
            class="block text-sm"
          >Example preference</label>
          <Select v-model="preference">
            <SelectTrigger aria-labelledby="example-select-label">
              <SelectValue placeholder="Choose a preference" />
            </SelectTrigger><SelectContent>
              <SelectItem value="plan">
                Planning
              </SelectItem><SelectItem value="build">
                Building
              </SelectItem>
            </SelectContent>
          </Select>
          <div class="flex items-center gap-3">
            <Checkbox
              id="example-checkbox"
              v-model="checked"
            /><label for="example-checkbox">Show selected badge</label><Badge v-if="checked">
              Selected
            </Badge><Badge
              v-else
              variant="outline"
            >
              Not selected
            </Badge>
          </div>
          <RadioGroup
            v-model="radio"
            aria-label="Example card spacing"
            class="flex flex-wrap gap-4"
          >
            <div
              v-for="value in ['compact', 'comfortable']"
              :key="value"
              class="flex items-center gap-2"
            >
              <RadioGroupItem
                :id="`example-${value}`"
                :value="value"
              /><label :for="`example-${value}`">{{ value }}</label>
            </div>
          </RadioGroup>
          <div
            class="rounded-lg border border-border"
            :class="radio === 'compact' ? 'p-3' : 'p-8'"
          >
            Selected preference: {{ preference }}
          </div>
          <div class="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger as-child>
                <Button variant="outline">
                  Open example dialog
                </Button>
              </DialogTrigger><DialogContent><DialogHeader><DialogTitle>Example dialog</DialogTitle><DialogDescription>This dialog contains no form. Close it with Escape or the close button.</DialogDescription></DialogHeader><p>Focus stays inside while open.</p></DialogContent>
            </Dialog>
            <Popover>
              <PopoverTrigger as-child>
                <Button variant="outline">
                  Show a helpful note
                </Button>
              </PopoverTrigger><PopoverContent>
                <p class="text-sm">
                  Use a popover for short supporting content; keep essential instructions visible.
                </p>
              </PopoverContent>
            </Popover>
          </div>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Catalog shortcuts</NavigationMenuTrigger><NavigationMenuContent class="min-w-56 p-4">
                  <NavigationMenuLink as-child>
                    <a
                      href="#packages"
                      class="block rounded-md p-3 hover:bg-muted"
                    >Package examples</a>
                  </NavigationMenuLink><NavigationMenuLink as-child>
                    <a
                      href="#content"
                      class="block rounded-md p-3 hover:bg-muted"
                    >Content examples</a>
                  </NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
      <Carousel
        aria-label="Example layout cards"
        :opts="{ align: 'start' }"
      >
        <CarouselContent>
          <CarouselItem
            v-for="number in 4"
            :key="number"
            class="md:basis-1/2 lg:basis-1/3"
          >
            <div class="rounded-2xl border border-border bg-card p-8">
              <Badge variant="secondary">
                EXAMPLE {{ number }}
              </Badge><h3 class="mt-4 text-xl">
                A reusable card
              </h3><p class="mt-3 text-muted-foreground">
                Drag, use the buttons, or focus the carousel and press arrow keys.
              </p>
            </div>
          </CarouselItem>
        </CarouselContent>
        <div class="mt-5 flex justify-center gap-4">
          <CarouselPrevious class="static translate-x-0 translate-y-0" /><CarouselNext class="static translate-x-0 translate-y-0" />
        </div>
      </Carousel>
    </section>
    <section
      id="proof"
      class="space-y-8 scroll-mt-24"
    >
      <h2 class="text-3xl">
        Proof and portfolio · fictional examples
      </h2>
      <div class="grid gap-6 md:grid-cols-3">
        <StatCard
          number="12"
          label="Example concepts, not a company metric"
        /><ValueCard
          title="Example value: clarity"
          description="Replace this copy with an honest account of how your team works."
        /><TestimonialCard
          quote="This is a sample quote, not a real endorsement."
          author="Example reviewer"
          role="Example role"
          company="Example studio"
        />
      </div>
      <WorkFilters
        section-title="Explore example projects"
        :categories="[{ name: 'Design', filter: 'design' }, { name: 'Content', filter: 'content' }]"
        :current-category="category"
        @category-change="category = $event"
      />
      <p
        role="status"
        class="text-sm text-muted-foreground"
      >
        {{ visibleProjects.length }} fictional projects
      </p>
      <div class="grid gap-6 md:grid-cols-2">
        <FeaturedProjectCard
          v-for="project in visibleProjects"
          :key="project.slug"
          :project="project"
          :clickable="false"
        />
      </div>
      <RelatedProject
        v-if="visibleProjects[0]"
        :project="visibleProjects[0]"
        :clickable="false"
      />
      <FeaturedWorkSection
        title="Service-page featured work"
        :projects="projects.map(project => ({ title: project.title, description: project.description, image: project.heroImage, category: project.category, url: '#proof' }))"
      />
      <AppTestimonialSection :testimonial="{ quote: 'A second fictional testimonial layout. Replace with an approved customer quote.', author: 'Example author', position: 'Example position' }" />
      <h3 class="text-xl">
        Existing client logo strip
      </h3><p class="text-sm text-muted-foreground">
        The strip reads the template’s existing clients.json; replace those records before launch.
      </p><AppClientLogoScroll />
    </section>
    <section
      id="team"
      class="space-y-8 scroll-mt-24"
    >
      <h2 class="text-3xl">
        Team and detail headers
      </h2>
      <AboutHero
        title="EXAMPLE: A team with a clear brief"
        description="Fictional team members using a local placeholder image."
        :members="members"
        :autoplay="false"
        size="small"
      />
      <AboutHero
        title="EXAMPLE: We plan and build"
        mode="typer"
        typer-begin="We"
        :typer-text="['plan', 'build']"
        typer-end="together"
        :autoplay="false"
        size="small"
      />
      <AboutHeroMember
        v-model:paused="teamPaused"
        :members="members"
        hero-image-height-class="h-48"
      />
      <AppDetailHero
        title="EXAMPLE: A detail header"
        back-link-to="#team"
        back-link-text="Back to team examples"
        hero-mode="image"
        :image="image"
        image-class="h-48 w-full rounded-xl object-contain bg-muted"
        title-class="text-3xl"
        section-class="py-6"
      >
        <p class="text-muted-foreground">
          Inline composition, with a safe back link and no additional navigation bar.
        </p>
      </AppDetailHero>
    </section>
    <section
      id="packages"
      class="space-y-8 scroll-mt-24"
    >
      <ServicePackages
        title="Static comparison · EXAMPLE prices"
        :packages="packages"
        recommended-label="Example recommendation"
        href="#contact-demo"
        cta="See contact example"
      />
      <h2 class="text-3xl">
        Browse the same example plans
      </h2><p class="text-muted-foreground">
        Pricing is fictional. This carousel is separate from the static comparison grid.
      </p><AppPricingCarousel :plans="plans" />
      <AppPartnerScroll
        title="Rich partner cards · EXAMPLES"
        :partners="partners"
      />
    </section>
    <section
      id="motion"
      class="space-y-6 scroll-mt-24"
    >
      <h2 class="text-3xl">
        Optional brand motion
      </h2>
      <div class="flex flex-wrap items-center gap-4">
        <Button
          variant="outline"
          :aria-pressed="scrambleAnimated"
          @click="scrambleAnimated = !scrambleAnimated"
        >
          {{ scrambleAnimated ? 'Pause scramble' : 'Animate scramble' }}
        </Button><AppWordScramble
          text="EXAMPLE: Thoughtful work"
          :animate="scrambleAnimated"
          animation-type="linear"
          :delay="3"
        />
      </div>
      <div class="flex flex-wrap items-center gap-6">
        <Button
          variant="outline"
          @click="loading = !loading"
        >
          {{ loading ? 'Finish loading example' : 'Show loading example' }}
        </Button><AppLogoLoader
          :logo-src="image"
          message="Preparing an example…"
          :loading="loading"
          size="sm"
        /><p
          v-if="!loading"
          role="status"
        >
          Example content is ready.
        </p>
      </div>
      <Button
        :disabled="transitioning"
        @click="transitioning = true"
      >
        Preview optional brand transition
      </Button><LogoZoomTransition
        :show="transitioning"
        :logo-src="image"
        label="Example transition"
        :duration="700"
        @complete="transitioning = false"
      />
      <p class="text-sm text-muted-foreground">
        Motion respects reduced-motion preferences. The transition runs only on request, not on route navigation.
      </p>
    </section>
    <section
      id="effects"
      class="space-y-6 scroll-mt-24"
    >
      <h2 class="text-3xl">
        Contained background renderers
      </h2>
      <p class="text-muted-foreground">
        Enable a preview to load its renderer. Waves, net and dots use WebGL; topology uses p5. Reduced motion or unavailable runtimes keep the static background.
      </p>
      <div class="flex flex-wrap items-end gap-4">
        <div class="space-y-2">
          <label
            for="catalog-effect"
            class="block text-sm"
          >Renderer</label><select
            id="catalog-effect"
            v-model="effect"
            class="rounded-md border border-input bg-background px-3 py-2"
          >
            <option
              v-for="name in effectNames"
              :key="name"
              :value="name"
            >
              {{ name }}
            </option>
          </select>
        </div>
        <div class="space-y-2">
          <label
            for="catalog-effect-fade"
            class="block text-sm"
          >Fade</label><select
            id="catalog-effect-fade"
            v-model="effectFade"
            class="rounded-md border border-input bg-background px-3 py-2"
          >
            <option
              v-for="fade in ['none', 'linear', 'step']"
              :key="fade"
              :value="fade"
            >
              {{ fade }}
            </option>
          </select>
        </div>
        <Button
          variant="outline"
          :aria-pressed="!effectDisabled"
          @click="effectDisabled = !effectDisabled"
        >
          {{ effectDisabled ? 'Enable renderer preview' : 'Disable renderer preview' }}
        </Button>
      </div>
      <p
        role="status"
        class="text-sm text-muted-foreground"
      >
        {{ effectDisabled ? 'Preview disabled · static background' : effect === 'none' ? 'No renderer selected · static background' : effectActive ? 'Renderer active' : 'Static fallback / renderer not active (loading, visibility, reduced motion or unavailable runtime)' }}
      </p>
      <div class="relative isolate min-h-80 overflow-hidden rounded-2xl border border-border">
        <BackgroundEffect
          :effect="effect"
          :fade="effectFade"
          :disabled="effectDisabled"
          mode="section"
          :options="{ mouseControls: false, touchControls: false }"
          @active-change="effectActive = $event"
        />
        <div class="relative z-10 mx-auto my-12 max-w-lg rounded-xl border border-border bg-background/95 p-8 text-foreground">
          <h3 class="text-2xl">
            EXAMPLE: An atmospheric section
          </h3><p class="mt-4 leading-relaxed text-muted-foreground">
            The renderer is decorative. This content and its action remain independent of canvas availability.
          </p><a
            href="#slides"
            class="mt-5 inline-block text-primary underline"
          >Explore slideshow examples</a>
        </div>
      </div>
    </section>
    <section
      id="slides"
      class="space-y-8 scroll-mt-24"
    >
      <h2 class="text-3xl">
        Two slideshow layouts
      </h2>
      <p class="text-muted-foreground">
        The hero combines an authored example with the actual published template post. Each instance resolves its own slides. Use the built-in pause control to stop enabled autoplay.
      </p>
      <div class="flex flex-wrap items-end gap-4">
        <Button
          variant="outline"
          :aria-pressed="slideshowAutoplay"
          @click="slideshowAutoplay = !slideshowAutoplay"
        >
          {{ slideshowAutoplay ? 'Disable hero autoplay' : 'Enable hero autoplay' }}
        </Button>
        <div class="space-y-2">
          <label
            for="catalog-slide-navigation"
            class="block text-sm"
          >Hero navigation style</label><select
            id="catalog-slide-navigation"
            v-model="slideshowNavigation"
            class="rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="icons">
              Icons
            </option><option value="text">
              Text
            </option><option value="dots">
              Dots
            </option>
          </select>
        </div>
      </div>
      <Slideshow
        layout="hero"
        :slides="heroSlides"
        size="small"
        alignment="center-left"
        :autoplay="slideshowAutoplay"
        :autoplay-delay="6000"
        :navigation-style="slideshowNavigation"
        :show-navigation="true"
        background-effect="none"
      />
      <h3 class="text-2xl">
        Vertical story · optional wheel navigation
      </h3>
      <p class="text-muted-foreground">
        Scroll freeze is off by default. When enabled on a non-touch device, wheel input over the visible story moves between slides; normal page scroll continues at the first/last boundary. Touch and reduced motion bypass wheel capture. You can always disable it here or use the navigation buttons.
      </p>
      <Button
        variant="outline"
        :aria-pressed="freezeScroll"
        @click="freezeScroll = !freezeScroll"
      >
        {{ freezeScroll ? 'Disable optional wheel navigation' : 'Enable optional wheel navigation' }}
      </Button>
      <Slideshow
        layout="scroll-slide"
        :slides="verticalSlides"
        size="medium"
        alignment="center-left"
        :scroll-freeze="freezeScroll"
        :autoplay="false"
        navigation-style="text"
        :show-navigation="true"
        background-effect="none"
      />
    </section>
    <section
      id="content"
      class="space-y-8 scroll-mt-24"
    >
      <AppContentTabs
        v-model="tab"
        :items="items"
        title="Example content tabs"
        description="Select a section; the same selection drives the standalone detail below."
      >
        <template #detail="{ item }">
          <Badge variant="outline">
            Selected: {{ item.id }}
          </Badge>
        </template><template #empty>
          <p>No example sections available.</p>
        </template>
      </AppContentTabs>
      <details class="rounded-xl border border-border p-6">
        <summary class="cursor-pointer">
          Standalone detail component
        </summary><AppContentTabDetail
          v-if="detail"
          :item="detail"
          class="mt-6"
        />
      </details>
      <h2 class="text-3xl">
        Facets and search
      </h2><AppFilterBar
        v-model="filters"
        v-model:search-query="search"
        :facets="facets"
        search-label="Search example content"
      />
      <p
        role="status"
        class="text-sm text-muted-foreground"
      >
        {{ results.length }} matching example sections
      </p><div class="grid gap-6 md:grid-cols-2">
        <ValueCard
          v-for="item in results"
          :key="item.id"
          :title="item.title"
          :description="item.summary"
        />
      </div><p v-if="!results.length">
        No matches. Use Reset filters to start again.
      </p>
    </section>
    <section
      id="contact-demo"
      class="space-y-6 scroll-mt-24"
    >
      <h2 class="text-3xl">
        Contact patterns · live endpoint
      </h2>
      <p class="rounded-xl border border-border bg-muted p-6">
        These forms use the real /api/contact/send-email endpoint and require mail configuration. Do not submit test messages to a live site. For browser checks, intercept the request and mock success/failure before submitting.
      </p>
      <div class="grid gap-8 lg:grid-cols-2">
        <AppContactForm
          v-if="inlineFormVisible"
          :state="inlineFormState"
          heading="Example inline form"
          description="Name, email and message are required; phone is optional."
          :categories="['Example planning', 'Example support']"
          submit-text="Send via configured endpoint"
          success-text="Your message was accepted."
        /><div class="space-y-4">
          <Button
            variant="outline"
            @click="inlineFormVisible = !inlineFormVisible"
          >
            {{ inlineFormVisible ? 'Hide inline form (retain state)' : 'Restore inline form' }}
          </Button>
          <p class="text-sm text-muted-foreground">
            The inline form controller is owned by this page, so hiding the form retains its draft, pending request and result.
          </p>
          <p class="text-muted-foreground">
            The modal keeps your draft when dismissed. Escape closes it; reopen to continue.
          </p><AppContactModal
            v-model:open="contactOpen"
            title="Example contact dialog"
            description="Uses the same configured endpoint as the inline form."
            trigger-text="Open contact example"
            :form-props="{ categories: ['Example planning', 'Example support'], submitText: 'Send via configured endpoint' }"
            @success="contactCompletions++"
          />
          <p
            role="status"
            class="text-sm text-muted-foreground"
          >
            {{ contactCompletions }} modal completions (including results received while closed).
          </p>
        </div>
      </div>
    </section>
    <AppBenefitsSection
      title="Reusable benefits"
      description="Example copy about the template, not a service promise."
      :items="benefits"
    />
    <section class="space-y-8">
      <h2 class="text-3xl md:text-4xl">
        Article cards and filters
      </h2>
      <FilterSection
        v-model="selected"
        :options="options"
      />
      <p
        class="text-sm text-muted-foreground"
        role="status"
      >
        {{ filteredPosts.length }} example cards
      </p>
      <div class="grid gap-6 md:grid-cols-2">
        <BlogPostCard
          v-for="post in filteredPosts"
          :key="post.slug"
          :post="post"
        />
      </div>
    </section>
    <AppFaq
      title="Template questions"
      :items="faqs"
    />
  </div>
</template>
