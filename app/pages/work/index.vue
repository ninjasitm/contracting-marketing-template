<script lang="ts" setup>
import { reactive } from 'vue';
import config from '@@/app/content/_pages/work.json';
import ProjectCard from '@/components/work/ProjectCard.vue';
import Loading from '@/components/layouts/Page/Loading.vue';

definePageMeta({ layout: 'page' });

type Project = {
  id: string;
  slug: string;
  bannerImage: string;
  description: string;
  client: string;
};

type WorkPageState = {
  isLoading: any;
  title: string;
  featuredClient: {
    logo: string | undefined;
    bannerImage: string | undefined;
    description: string;
    type: string;
  };
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
  featuredClient: (
    await useAsyncData('_work.featuredClient', () =>
      queryContent('/_work')
        .only(['slug', 'title', 'description', 'bannerImage'])
        .findOne(),
    )
  ).data,
  categories: [],
  projects: [],
});

await loadData();

async function loadData(): Promise<void> {
  state.isLoading = true;
  state.projects = (
    await useAsyncData('_work.projects', () =>
      queryContent('/_work')
        .only(['slug', 'bannerImage', 'description', 'client'])
        .limit(6)
        .find(),
    )
  ).data;
  state.isLoading = false;
}

async function onLoadCategory(id: any): Promise<void> {
  state.currentCategory = id;
  // Implement category load logic here
  state.projects = (
    await useAsyncData('_work.filteredProjects', () =>
      queryContent('/_work')
        .only(['slug', 'bannerImage', 'description', 'client'])
        .where({
          categories: { $contains: id },
        })
        .limit(6)
        .find(),
    )
  ).data;
  console.log('Loading category');
}
</script>
<template>
  <div
    class="flex relative flex-col pb-24 w-full md:min-h-[800px] max-md:max-w-full px-4"
  >
    <section
      class="min-h-[250px] flex flex-col align-center justify-center mt-20"
    >
      <h1
        class="w-full max-w-[1320px] text-6xl font-light tracking-tighter text-center text-black uppercase max-md:max-w-full max-md:text-4xl"
        v-html="state?.title || 'Our Work'"
      ></h1>
    </section>
    <section
      class="flex flex-col text-black w-full max-w-screen-xl mx-auto overflow-x-hidden"
    >
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
        class="flex gap-4 items-start self-start mt-16 text-base max-md:mt-10 max-md:max-w-full overflow-x-auto overfly-y-hidden snap-x"
      >
        <AwesomeButton
          class="gap-2 self-stretch px-6 py-4 text-white bg-sky-600 rounded-[1000px] max-md:px-5 h-14 text-center snap-center"
          @click="onLoadCategory"
        >
          All Projects
        </AwesomeButton>
        <AwesomeButton
          v-for="(category, index) in state.categories"
          :key="index"
          class="gap-2 self-stretch px-6 py-4 dark:text-white rounded-[1000px] max-md:px-5 h-14 text-center snap-center"
          :text="category.name"
        >
        </AwesomeButton>
      </nav>
      <main class="flex flex-wrap gap-5 items-start mt-16 w-full max-md:mt-10">
        <div v-if="state.isLoading" class="flex justify-center w-full">
          <Loading />
        </div>
        <ProjectCard
          v-for="(project, index) in state.projects"
          v-else
          :id="project.id"
          :key="index"
          :image-src="project.bannerImage"
          :description="project.description"
          :client="project.client"
          :slug="project.slug"
        />
      </main>
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
