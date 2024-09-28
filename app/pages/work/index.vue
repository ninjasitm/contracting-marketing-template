<script lang="ts" setup>
import { reactive } from 'vue';
import config from '@@/app/content/_pages/work.json';
import clients from '@@/app/content/clients.json';
import ProjectCard from '@/components/work/ProjectCard.vue';
import Loading from '@/components/layouts/Page/Loading.vue';
import type { Client, Project } from '@/utils/types';

definePageMeta({ layout: 'page' });

type WorkPageState = {
  isLoading: any;
  title: string;
  featuredClient: Client;
  footer: {
    title: string;
    description: string;
  };
  currentCategory: string | number | null;
  categories: {
    name: string;
    filter: string;
  }[];
  projects: Project[];
};

const state: WorkPageState = reactive({
  isLoading: false,
  title: config?.title,
  footer: config?.footer,
  currentCategory: null,
  featuredClient: null,
  categories: [],
  projects: [],
});

await loadData();

async function loadData(): Promise<void> {
  state.isLoading = true;
  state.projects = (
    await useAsyncData(
      '_work.projects',
      async () =>
        await queryContent('/_work')
          .only(['slug', 'bannerImage', 'description', 'client', 'title'])
          .limit(6)
          .find(),
    )
  ).data;
  state.categories = [
    ...new Set(
      (await queryContent('/_work').only('categories').find())
        .map((item) => item.categories)
        .flat()
        .filter((item) => item !== null && item !== undefined),
    ),
  ].map((item) => ({
    name: item,
    filter: item,
  }));
  config.featuredClient = {
    client: config.featuredClient?.client || 'adf',
    ...(config.featuredClient || {}),
  };
  state.featuredClient =
    clients.find((c: Client) => c.slug === config.featuredClient?.client) ||
    ({} as Client);
  state.featuredClient.type = config.featuredClient?.type || '';
  state.featuredClient.description = config.featuredClient?.description || '';
  state.isLoading = false;
}

async function onLoadCategory(id: any): Promise<void> {
  state.currentCategory = id === state.currentCategory ? null : id;
  console.log('Loading category', id);
  // Implement category load logic here
  const query = queryContent('/_work').only([
    'slug',
    'bannerImage',
    'description',
    'client',
    'title',
  ]);

  if (state.currentCategory) {
    query.where({
      categories: { $contains: state.currentCategory },
    });
  }

  state.projects = (await query.limit(6).find()) as Project[];
}
</script>
<template>
  <div
    class="flex relative flex-col pb-24 w-full md:min-h-[800px] max-md:max-w-full px-4 lg:px-10"
  >
    <section
      class="flex flex-col align-center justify-center pt-40 pb-20 lg:pt-60"
    >
      <h1
        class="w-full max-w-[1320px] text-6xl font-light tracking-tighter text-center text-black uppercase max-md:max-w-full max-md:text-4xl"
        v-html="state?.title || 'Our Work'"
      ></h1>
    </section>
    <section class="flex flex-col text-black w-full max-w-screen-xl mx-auto">
      <header
        v-if="state.featuredClient"
        class="flex overflow-hidden flex-col w-full rounded-2xl"
      >
        <div
          class="flex relative flex-col p-16 w-full min-h-[640px] max-md:px-5 max-md:max-w-full"
        >
          <img
            loading="lazy"
            :src="state.featuredClient.bannerImage"
            alt=""
            class="object-cover absolute inset-0 size-full"
          />
          <img
            loading="lazy"
            :src="state.featuredClient.logo"
            alt="Company logo"
            class="object-contain self-end aspect-square w-[90px]"
          />
          <div
            class="flex relative flex-col mt-80 max-w-full w-[413px] max-md:mt-10"
          >
            <p
              class="text-lg font-light"
              v-html="state.featuredClient.description"
            ></p>
            <p class="mt-4 text-base tracking-tight uppercase">
              {{ state.featuredClient.type }}
            </p>
          </div>
        </div>
      </header>
      <nav
        class="flex flex-wrap gap-4 py-4 items-start self-start mt-10 text-base max-md:mt-10 max-md:max-w-full snap-x lg:min-h-[100px]"
      >
        <AwesomeButton
          class="gap-2 self-stretch text-white bg-sky-600 max-md:px-5 h-10 text-center snap-center text-xs"
          @click="() => onLoadCategory(null)"
        >
          All Projects
        </AwesomeButton>
        <AwesomeButton
          v-for="(category, index) in state.categories"
          :key="index"
          outline
          class="gap-2 self-stretch dark:text-white max-md:px-5 h-10 text-center snap-center text-nowrap text-xs"
          :class="{
            'bg-sky-600 text-white': state.currentCategory === category.filter,
          }"
          :text="category.name"
          @click="() => onLoadCategory(category.filter)"
        >
        </AwesomeButton>
      </nav>
      <div
        class="flex flex-wrap gap-5 items-start mt-16 w-full lg:mt-6 overflow-visible"
      >
        <div v-if="state.isLoading" class="flex justify-center w-full">
          <Loading />
        </div>
        <ProjectCard
          v-for="(project, index) in state.projects"
          v-else
          :id="project.id"
          :key="index"
          class="w-[100%] md:w[31.5%] lg:w-[23.5%] mb-10"
          :title="project.title"
          :image-src="project.bannerImage"
          :description="project.description"
          :client="project.client"
          :slug="project.slug"
        />
      </div>
    </section>
    <section
      class="flex flex-col text-black w-full max-w-screen-xl mt-20 mx-auto"
    >
      <h2
        class="gap-2 self-stretch pt-6 w-full text-xl font-light tracking-tight uppercase max-md:max-w-full"
        v-html="state.footer?.title"
      ></h2>
      <div
        class="flex flex-col mt-16 w-full max-w-[1320px] max-md:mt-10 max-md:max-w-full"
      >
        <p
          class="text-4xl font-light max-md:max-w-full"
          v-html="state.footer?.description"
        ></p>
      </div>
    </section>
  </div>
</template>
