import type { SeoMetadata, Hero } from '@/types/types';

/**
 * Composable for configuring SEO metadata using useSeoMeta
 * Falls back to hero content when SEO fields are not provided
 */
export const useSeoConfig = (seo?: SeoMetadata, hero?: Hero, config?: any) => {
  const runtimeConfig = useRuntimeConfig();
  const route = useRoute();

  // Get base URL from config or runtime config
  const baseUrl =
    config?.url || runtimeConfig.public?.siteUrl || 'https://localhost:3000';

  // Generate canonical URL
  const canonicalUrl = seo?.canonicalUrl || `${baseUrl}${route.path}`;

  // Determine page title
  const pageTitle =
    seo?.title || hero?.title || config?.title || 'Contracting Template';

  // Determine page description (strip HTML tags if needed)
  const pageDescription =
    seo?.description ||
    (hero?.description
      ? stripHtmlTags(hero.description)
      : config?.description) ||
    'Professional contracting services';

  // Determine OG image
  const ogImage = seo?.ogImage || '/og-image.png';
  const ogImageUrl = ogImage.startsWith('http')
    ? ogImage
    : `${baseUrl}${ogImage}`;

  // Configure SEO metadata
  useSeoMeta({
    title: pageTitle,
    description: pageDescription,
    keywords: seo?.keywords || '',

    // Open Graph
    ogTitle: pageTitle,
    ogDescription: pageDescription,
    ogImage: ogImageUrl,
    ogUrl: canonicalUrl,
    ogType: 'website',
    ogSiteName: config?.companyName || config?.title || 'Contracting Template',

    // Twitter
    twitterCard: seo?.twitterCard || 'summary_large_image',
    twitterTitle: pageTitle,
    twitterDescription: pageDescription,
    twitterImage: ogImageUrl,

    // Robots
    robots: seo?.robots || 'index,follow',
  });

  // Set canonical link and page title using useHead
  useHead({
    title: pageTitle,
    titleTemplate: (title?: string) => {
      const siteName = config?.companyName || config?.title;
      return siteName && title && title !== siteName
        ? `${title} | ${siteName}`
        : title || siteName || '';
    },
    link: [
      {
        rel: 'canonical',
        href: canonicalUrl,
      },
    ],
  });
};

/**
 * Strip HTML tags from a string
 */
function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}
