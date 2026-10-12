<script lang="ts" setup>
import { computed, ref } from 'vue';
import _config from '@content/_pages/posts.json';
import _appConfig from '@content/config.json';
import type { BasePageState } from '@/types/types';
import { useSeoConfig } from '@/composables/useSeoConfig';
import BlogPostCard from '@/components/posts/BlogPostCard.vue';
import FilterSection from '@/components/posts/FilterSection.vue';

// Define page metadata
definePageMeta({ layout: 'page' });

const postsConfig = _config as BasePageState;
const appConfig = _appConfig;

// Configure SEO metadata
useSeoConfig(postsConfig.seo, postsConfig.hero, appConfig);

// Fallback title for basic useHead
useHead({
  title: postsConfig.hero?.title || 'Posts',
});

const { data: posts, error: postsError } = await useContentQueries.usePosts();
const selectedTag = ref('');

const tagOptions = computed(() => [
  { label: 'All posts', value: '' },
  ...Array.from(
    new Set(
      (posts.value ?? []).flatMap((post) =>
        Array.isArray(post.tags)
          ? post.tags.filter((tag): tag is string => typeof tag === 'string')
          : [],
      ),
    ),
  )
    .sort((a, b) => a.localeCompare(b))
    .map((tag) => ({ label: tag, value: tag })),
]);

const filteredPosts = computed(() =>
  (posts.value ?? []).filter(
    (post) => !selectedTag.value || post.tags?.includes(selectedTag.value),
  ),
);
</script>

<template>
  <LayoutPageWrapper class="mt-20">
    <header class="px-6 pt-8 md:pt-12">
      <h1 class="text-4xl md:text-5xl text-foreground">
        Posts
      </h1>
    </header>
    <LayoutPageSection class="px-6 py-8 md:py-12 space-y-8">
      <p
        v-if="postsError"
        role="status"
      >
        Posts could not be loaded right now.
      </p>
      <template v-else>
        <FilterSection
          v-model="selectedTag"
          :options="tagOptions"
        />
        <p
          v-if="filteredPosts.length === 0"
          role="status"
        >
          No posts found.
        </p>
        <div
          v-else
          class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <BlogPostCard
            v-for="post in filteredPosts"
            :key="post.slug"
            :post="post"
          />
        </div>
      </template>
    </LayoutPageSection>
  </LayoutPageWrapper>
</template>
