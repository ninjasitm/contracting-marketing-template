<script lang="ts" setup>
import { computed } from 'vue';
import _appConfig from '@content/config.json';
import { getPostLoadFailureStatus } from '@/composables/useContent';
import { useSeoConfig } from '@/composables/useSeoConfig';

definePageMeta({
  layout: 'page',
});

const route = useRoute();
const slug = Array.isArray(route.params.slug)
  ? route.params.slug[0]
  : route.params.slug;
const { data: post, error: postError } = await useContentQueries.usePost(
  String(slug ?? ''),
);

if (postError.value) {
  const statusCode = getPostLoadFailureStatus(postError.value);
  throw createError({
    statusCode,
    statusMessage: statusCode === 404 ? 'Post not found' : 'Unable to load post',
  });
}

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' });
}

const formattedPostDate = computed(() => {
  const dateValue = post.value?.date;
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  return {
    datetime: date.toISOString(),
    label: new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(date),
  };
});

useSeoConfig(
  {
    title: post.value.title,
    description: post.value.summary,
    ogImage: post.value.heroImage,
  },
  undefined,
  _appConfig,
);
</script>

<template>
  <LayoutPageWrapper class="mt-20">
    <template v-if="post">
      <header class="px-6 pt-8 md:pt-12 space-y-6 text-foreground">
        <NuxtLink
          to="/posts"
          class="inline-block rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to posts
        </NuxtLink>
        <h1 class="text-4xl md:text-5xl break-words">
          {{ post.title }}
        </h1>
        <p class="text-muted-foreground">
          <span v-if="post.author">{{ post.author }}</span>
          <span v-if="post.author && formattedPostDate"> · </span>
          <time
            v-if="formattedPostDate"
            :datetime="formattedPostDate.datetime"
          >{{ formattedPostDate.label }}</time>
        </p>
      </header>
      <LayoutPageSection class="px-6 py-8 md:py-12">
        <ContentRenderer :value="post" />
      </LayoutPageSection>
    </template>
  </LayoutPageWrapper>
</template>
