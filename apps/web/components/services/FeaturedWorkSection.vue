<script setup lang="ts">
// Adapted from ninjasitm/nitm-marketing @ da649f7e374da848aac277d202a49942d708fc92; see docs/reference/NITM_MARKETING_LICENSE.md.
import FeaturedProjectCard from '../work/FeaturedProjectCard.vue';
import type { FeaturedProject, Project, Client } from '@/types/types';
withDefaults(defineProps<{
  title?: string;
  projects?: (Project | FeaturedProject)[];
  clients?: Record<string, Pick<Client, 'name' | 'logo'>>;
  clickable?: boolean;
}>(), { title: 'Featured Work', projects: () => [], clickable: false });
</script>

<template>
  <section
    v-if="projects.length"
    class="text-foreground"
  >
    <h2 class="text-3xl md:text-4xl mb-8 break-words">
      {{ title }}
    </h2>
    <div class="grid gap-6 md:grid-cols-2">
      <FeaturedProjectCard
        v-for="(project, index) in projects"
        :key="index"
        :project="'slug' in project ? project : { title: project.title, slug: '', description: project.description, heroImage: project.image, client: project.category }"
        :client="'client' in project ? clients?.[project.client] : undefined"
        :href="'slug' in project ? undefined : project.url"
        :clickable="clickable"
      />
    </div>
  </section>
</template>
