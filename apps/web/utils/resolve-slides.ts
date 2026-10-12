// Adapted from ninjasitm/nitm-marketing @ da649f7. Copyright (c) 2025 Ninjas In The Machine. MIT: docs/reference/NITM_MARKETING_LICENSE.md.
import type { SlideshowSlide } from '../types/slideshow';
import { isSafeHref } from './safe-link';
export type ResolvedSlide = SlideshowSlide;
export interface ContentQuery { find(): Promise<Record<string, unknown>[]> }
export type QueryContentFn = (path: string) => ContentQuery;
export type SlideReferenceResolver = (slide: SlideshowSlide) => Promise<SlideshowSlide | null>;
const configs: Record<string, { path: string; ref: keyof SlideshowSlide; title: string; description: string[]; image: string[]; destination?: string; published?: boolean }> = {
  post: { path: '_posts/data', ref: 'postRef', title: 'title', description: ['summary', 'description'], image: ['heroImage', 'image'], destination: '/posts/', published: true },
  work: { path: '_work/data', ref: 'workRef', title: 'title', description: ['description', 'summary'], image: ['heroImage', 'bannerImage'], destination: '/work/', published: true },
  teamMember: { path: '_about/teamMembers', ref: 'teamMemberRef', title: 'name', description: ['description', 'position'], image: ['photo'], destination: '/about' },
  testimonial: { path: '_testimonials', ref: 'testimonialRef', title: 'author', description: ['quote'], image: ['avatar'] },
  service: { path: '_pages/services', ref: 'serviceRef', title: 'title', description: ['description'], image: ['image', 'icon'], destination: '/services' },
};
configs.article = configs.post!;
configs.person = configs.teamMember!;
const normalize = (value: string) => value.trim().replace(/\.md$/i, '').replace(/\/+$/, '');
function first(doc: Record<string, unknown>, keys: string[]) {
  return keys.map(key => doc[key]).find(value => typeof value === 'string' && value.trim()) as string | undefined;
}
export function sanitizeSlide(slide: SlideshowSlide): ResolvedSlide {
  const link = isSafeHref(slide.link) ? slide.link : undefined;
  const cta = slide.cta && isSafeHref(slide.cta.url) ? slide.cta : undefined;
  return { ...slide, link, cta };
}
export async function resolveReferencedSlide(slide: SlideshowSlide, query: QueryContentFn, custom?: SlideReferenceResolver): Promise<ResolvedSlide | null> {
  if (slide.type === 'generic') return sanitizeSlide(slide);
  const config = configs[slide.type];
  try {
    if (!config) { const result = await custom?.(slide); return result ? sanitizeSlide(result) : slide.title ? sanitizeSlide(slide) : null; }
    const ref = slide[config.ref] ?? slide.contentId;
    if (typeof ref !== 'string') return slide.title ? sanitizeSlide(slide) : null;
    const id = normalize(ref);
    // Fresh Content 2 builder for every reference; never share mutable filters.
    let docs = await query(config.path).find();
    if (slide.type === 'service') docs = docs.flatMap(doc => Array.isArray(doc.services) ? doc.services : []);
    const doc = docs.find(doc => (!config.published || doc.published === true) && doc.enabled !== false && (
      id.startsWith('/') ? normalize(String(doc._path ?? '')) === id :
        doc.slug === id || normalize(String(doc._path ?? '')).split('/').pop() === id || (slide.type === 'service' && (doc.id === id || doc.title === id))
    ));
    if (!doc) return slide.title ? sanitizeSlide(slide) : null;
    const slug = typeof doc.slug === 'string' ? doc.slug : normalize(String(doc._path ?? '')).split('/').pop();
    const destination = config.destination?.endsWith('/') ? (slug ? config.destination + encodeURIComponent(slug) : undefined) : config.destination;
    const link = slide.link ?? slide.cta?.url ?? destination ?? first(doc, ['url']);
    return sanitizeSlide({ ...slide, title: slide.title ?? first(doc, [config.title]), description: slide.description ?? first(doc, config.description), image: slide.image ?? first(doc, config.image), link, cta: slide.cta ?? (link ? { text: slide.type === 'post' || slide.type === 'article' ? 'Read Article' : 'Learn More', url: link, type: 'link' } : undefined) });
  } catch { return slide.title ? sanitizeSlide(slide) : null; }
}
export async function resolveSlides(slides: SlideshowSlide[], query: QueryContentFn, custom?: SlideReferenceResolver): Promise<ResolvedSlide[]> {
  return (await Promise.all(slides.map(slide => resolveReferencedSlide(slide, query, custom)))).filter((slide): slide is ResolvedSlide => slide !== null);
}
