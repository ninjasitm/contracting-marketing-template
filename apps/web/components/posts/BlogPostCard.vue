<script setup lang="ts">
import { computed, ref } from 'vue';

// Concept: ninjasitm/nitm-marketing posts/BlogPostCard.vue, da649f7e374da848aac277d202a49942d708fc92.
const props = defineProps<{
  post: {
    title: string;
    slug: string;
    summary?: string;
    date?: string;
    heroImage?: string;
    author?: string;
    tags?: string[];
  };
}>();
const failedImage = ref<string>();
const formattedDate = computed(() => {
  if (!props.post.date) return null;
  const date = new Date(props.post.date);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat('en', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  }).format(date);
});
</script>

<template>
  <article class="flex flex-col h-full min-w-0 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground">
    <NuxtImg
      v-if="post.heroImage && post.heroImage !== failedImage"
      :src="post.heroImage"
      alt=""
      loading="lazy"
      width="640"
      height="360"
      class="aspect-video w-full object-cover"
      @error="failedImage = post.heroImage"
    />
    <div class="flex flex-col flex-1 p-6">
      <time
        v-if="formattedDate"
        :datetime="post.date"
        class="text-sm text-muted-foreground mb-3"
      >{{ formattedDate }}</time>
      <h3 class="text-2xl font-semibold break-words">
        <NuxtLink
          :to="`/posts/${post.slug}`"
          class="block rounded-sm hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {{ post.title }}
        </NuxtLink>
      </h3>
      <p
        v-if="post.summary"
        class="mt-3 text-muted-foreground leading-relaxed break-words"
      >
        {{ post.summary }}
      </p>
      <ul
        v-if="post.tags?.length"
        aria-label="Tags"
        class="flex flex-wrap gap-2 mt-5"
      >
        <li
          v-for="(tag, index) in post.tags"
          :key="index"
          class="rounded-full bg-muted text-muted-foreground px-3 py-1 text-xs break-words max-w-full"
        >
          {{ tag }}
        </li>
      </ul>
      <p
        v-if="post.author"
        class="pt-6 mt-auto text-sm font-medium break-words"
      >
        {{ post.author }}
      </p>
    </div>
  </article>
</template>
