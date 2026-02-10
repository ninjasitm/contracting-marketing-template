/**
 * Content Query Composable
 *
 * Centralized content querying with consistent useAsyncData wrapping,
 * standardized key generation, error handling, and performance optimizations.
 */

interface WorkProjectOptions {
  category?: string;
  limit?: number;
}

interface WorkProjectQueryResult {
  slug: string;
  heroImage?: string;
  bannerImage?: string;
  description?: string;
  client?: string;
  title: string;
}

export const useContentQueries = {
  /**
   * Load team members with optimized caching
   */
  useTeamMembers: () => {
    return useAsyncData(
      'about-team-members',
      () => queryContent('/_about/teamMembers')
        .only(['name', 'position', 'description', 'photo', 'linkedinUrl', 'order'])
        .sort({ order: 1 })
        .find(),
      {
        server: true,
        default: () => []
      }
    );
  },

  /**
   * Load work projects with optional category filtering
   */
  useWorkProjects: (options: WorkProjectOptions = {}) => {
    const { category, limit = 6 } = options;
    const key = category
      ? `work-projects-category-${category}`
      : 'work-projects-all';

    return useAsyncData(key, () => {
      const query = queryContent('/_work')
        .only(['slug', 'heroImage', 'bannerImage', 'description', 'client', 'title', 'categories'])
        .where({ published: { $eq: true } })
        .limit(limit);

      if (category) {
        query.where({ categories: { $contains: category } });
      }

      return query.find();
    }, {
      server: true,
      default: () => []
    });
  },

  /**
   * Load a single work project by slug
   */
  useWorkProject: (slug: string | string[]) => {
    const projectSlug = Array.isArray(slug) ? slug[0] : slug;
    return useAsyncData(
      `work-project-slug-${projectSlug}`,
      () => queryContent('/_work')
        .where({ slug: projectSlug })
        .findOne(),
      {
        server: true,
        default: () => null
      }
    );
  },

  /**
   * Load work categories with caching
   */
  useWorkCategories: () => {
    return useAsyncData(
      'work-categories-all',
      async () => {
        const projects = await queryContent('/_work')
          .only(['categories'])
          .where({ published: { $eq: true } })
          .find();

        // Extract unique categories
        const categories = [
          ...new Set(
            projects
              .map((item: any) => item.categories)
              .flat()
              .filter((item: any) => item !== null && item !== undefined)
          )
        ];

        return categories.map((category: string) => ({
          name: category,
          filter: category,
        }));
      },
      {
        server: true,
        default: () => []
      }
    );
  },

  /**
   * Get surrounding projects for navigation
   */
  useWorkProjectSurrounds: (path: string) => {
    return useAsyncData(
      `work-project-surrounds-${path.replace(/[^a-zA-Z0-9]/g, '-')}`,
      () => queryContent()
        .only(['title', 'slug', 'description'])
        .where({ published: true })
        .findSurround(path),
      {
        server: true,
        default: () => [null, null]
      }
    );
  },

  /**
   * Load fallback projects for 404 pages
   */
  useWorkProjectsFallback: (limit: number = 3) => {
    return useAsyncData(
      'work-projects-fallback',
      () => queryContent('/_work')
        .only(['title', 'bannerImage', 'heroImage', 'description', 'client', 'slug'])
        .where({ published: { $eq: true } })
        .limit(limit)
        .find(),
      {
        server: true,
        default: () => []
      }
    );
  },

  /**
   * Load posts with pagination support
   */
  usePosts: (options: { limit?: number; featured?: boolean } = {}) => {
    const { limit = 10, featured } = options;
    const key = featured ? 'posts-featured' : `posts-limit-${limit}`;

    return useAsyncData(key, () => {
      const query = queryContent('/_posts/data')
        .only(['title', 'slug', 'summary', 'date', 'heroImage', 'author', 'featured'])
        .where({ published: { $eq: true } })
        .sort({ date: -1 })
        .limit(limit);

      if (featured) {
        query.where({ featured: { $eq: true } });
      }

      return query.find();
    }, {
      server: true,
      default: () => []
    });
  },

  /**
   * Load a single post by slug
   */
  usePost: (slug: string) => {
    return useAsyncData(
      `post-slug-${slug}`,
      () => queryContent('/_posts/data')
        .where({ slug })
        .findOne(),
      {
        server: true,
        default: () => null
      }
    );
  }
};
