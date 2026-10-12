<script setup lang="ts">
// Adapted from ninjasitm/nitm-marketing @ da649f7e374da848aac277d202a49942d708fc92; see docs/reference/NITM_MARKETING_LICENSE.md.
import FeaturedProjectCard from './FeaturedProjectCard.vue';
import type { Project, Client } from '@/types/types';
withDefaults(defineProps<{
  project: Pick<Project, 'title' | 'slug'> & Partial<Pick<Project, 'description' | 'client' | 'heroImage'>>;
  client?: Pick<Client, 'name' | 'logo'>;
  clickable?: boolean;
}>(), { clickable: true });
</script>

<template>
  <FeaturedProjectCard
    :project="project"
    :client="client"
    :clickable="clickable"
    compact
  />
</template>
