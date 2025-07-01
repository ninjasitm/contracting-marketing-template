<script lang="ts" setup>
import { reactive } from 'vue';
import _config from '@content/_pages/work.json';
import clients from '@content/clients.json';
import ProjectCard from '@/components/work/ProjectCard.vue';
import Loading from '@/components/layouts/Page/Loading.vue';
import type { Client, Project, BasePageState } from '@/types/types';

interface ProjectContentData {
  title?: string;
  slug?: string;
  client?: string;
  heroImage?: string;
  bannerImage?: string;
  description?: string;
}

export interface WorkPageState extends BasePageState {
  featuredClient?: {
    client: string;
    type?: string;
    description?: string;
    heroImage?: string;
  };
  footer?: {
    title: string;
    description: string;
  };
}

definePageMeta({ layout: 'page' });

const config = _config as WorkPageState;

// Extended WorkPageState to include additional properties
interface ExtendedWorkPageState extends WorkPageState {
  isLoading: boolean;
  currentCategory: string | number | null;
  categories: {
    name: string;
    filter: string;
  }[];
  projects: Project[];
  featuredClientData: Client;
}

const state: ExtendedWorkPageState = reactive({
  isLoading: false,
  hero: config.hero,
  featuredClient: config.featuredClient,
  footer: config.footer,
  callToAction: config.callToAction,
  currentCategory: null,
  featuredClientData: {} as Client,
  categories: [],
  projects: [],
});

await loadData();

async function loadData(): Promise<void> {
  state.isLoading = true;

  // Load projects using the new composable
  const { data: projectsData } = await useContentQueries.useWorkProjects({
    limit: 6,
  });

  // Convert the data to Project objects with correct types
  state.projects = (projectsData.value || []).map(
    (item: ProjectContentData) => ({
      id: item.slug || '',
      title: item.title || '',
      slug: item.slug || '',
      date: '', // Add a default date
      client: item.client || '',
      url: '', // Add a default URL
      heroImage: item.heroImage || item.bannerImage,
      description: item.description || '',
    }),
  );

  // Load categories using the new composable
  const { data: categoriesData } = await useContentQueries.useWorkCategories();
  state.categories = categoriesData.value || [];

  const featuredClientConfig = state.featuredClient || { client: 'chip' };
  state.featuredClientData =
    clients.find((c: Client) => c.slug === featuredClientConfig.client) ||
    ({} as Client);
  state.featuredClientData.type = featuredClientConfig.type || '';
  state.featuredClientData.description = featuredClientConfig.description || '';
  state.isLoading = false;
}

async function onLoadCategory(id: string | null): Promise<void> {
  state.currentCategory = id === state.currentCategory ? null : id;
  console.log('Loading category', id);

  // Use the composable for category filtering
  const { data: projectsData } = await useContentQueries.useWorkProjects({
    category: state.currentCategory || undefined,
    limit: 6,
  });

  // Convert the data to Project objects with correct types
  state.projects = (projectsData.value || []).map(
    (item: ProjectContentData) => ({
      id: item.slug || '',
      title: item.title || '',
      slug: item.slug || '',
      date: '', // Add a default date
      client: item.client || '',
      url: '', // Add a default URL
      heroImage: item.heroImage || item.bannerImage,
      description: item.description || '',
    }),
  );
}
</script>
<template>
  <div
    class="flex relative flex-col pb-24 w-full max-md:max-w-full px-2 lg:px-10"
  >
    <!-- Hero Section using AppHero -->
    <AppHero
      :title="state.hero?.title"
      :description="state.hero?.description"
      :mode="state.hero?.mode || 'text'"
      :alignment="state.hero?.alignment || 'center'"
      :size="state.hero?.size || 'medium'"
      class="pt-40 pb-20 lg:pt-60"
    />

    <!-- Work Projects Section -->
    <LayoutPageSection
      class="flex flex-col text-black w-full max-w-screen-xl mx-auto"
    >
      <header
        v-if="state.featuredClientData && state.featuredClientData.slug"
        class="flex overflow-hidden flex-col w-full rounded-2xl"
      >
        <NuxtLink
          class="shadow-sm"
          :to="{
            name: 'work-slug',
            params: { slug: state.featuredClientData.slug },
          }"
        >
          <div
            class="flex relative flex-col py-4 pt-0 px-0 lg:px-16 w-full min-h-[250px] lg:min-h-[640px] max-md:max-w-full"
          >
            <NuxtImg
              placeholder
              loading="lazy"
              :src="state.featuredClientData.heroImage"
              alt=""
              class="object-cover absolute inset-0 size-full"
            />
            <NuxtImg
              placeholder
              loading="lazy"
              :src="state.featuredClientData.logo"
              alt="Company logo"
              class="object-contain self-end aspect-square w-[90px]"
            />
            <div
              class="flex relative flex-col mt-80 max-w-full w-[413px] max-md:mt-10"
            >
              <p
                class="text-lg font-light"
                v-html="state.featuredClientData.description"
              />
              <p class="mt-4 text-base tracking-tight uppercase">
                {{ state.featuredClientData.type }}
              </p>
            </div>
          </div>
        </NuxtLink>
      </header>

      <!-- Category Navigation -->
      <nav
        class="flex flex-wrap gap-4 py-4 items-start self-start mt-10 text-base max-md:mt-10 max-md:max-w-full snap-x lg:min-h-[100px]"
      >
        <AppButton
          class="h-10 text-center snap-center text-xs"
          variant="default"
          @click="() => onLoadCategory(null)"
        >
          All Projects
        </AppButton>
        <AppButton
          v-for="(category, index) in state.categories"
          :key="index"
          variant="outline"
          class="h-10 text-center snap-center text-nowrap text-xs"
          :class="{
            'bg-sky-600 text-white': state.currentCategory === category.filter,
          }"
          @click="() => onLoadCategory(category.filter)"
        >
          {{ category.name }}
        </AppButton>
      </nav>

      <!-- Projects Grid -->
      <div
        class="flex flex-wrap gap-5 items-start mt-16 w-full lg:mt-6 overflow-visible"
      >
        <div
          v-if="state.isLoading"
          class="flex justify-center w-full"
        >
          <Loading />
        </div>
        <ProjectCard
          v-for="project in state.projects"
          :id="project.id || project.slug"
          :key="project.id"
          :title="project.title"
          :slug="project.slug"
          :client="project.client"
          :image-src="project.heroImage"
          :description="project.description"
        />
      </div>
    </LayoutPageSection>

    <!-- Call to Action Section -->
    <AppCTA
      v-if="
        state.callToAction &&
          (state.callToAction.title || state.callToAction.primaryButtonText)
      "
      :title="state.callToAction.title || 'Ready to Start Your Project?'"
      :description="
        state.callToAction.description ||
          'Let us discuss your project and see how we can help bring your vision to life.'
      "
      :primary-action="state.callToAction.primaryButtonText || 'Get Started'"
      secondary-action="Learn Our Process"
      class="w-full max-w-screen-xl mx-auto mt-20"
      @primary-action="
        navigateTo(state.callToAction.primaryButtonUrl || '/contact')
      "
      @secondary-action="navigateTo('/process')"
    />
  </div>
</template>
