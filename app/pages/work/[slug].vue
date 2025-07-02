<script lang="ts" setup>
import moment from 'moment';
import OpenLink from '~/public/images/open-link.svg';
import clients from '@content/clients.json';
import Loading from '@/components/layouts/Page/Loading.vue';
import ProjectCard from '@/components/work/ProjectCard.vue';
import type { Client } from '@/types/types';

definePageMeta({ layout: 'page' });

const $route = useRoute();

interface RelatedProject {
  title: string;
  description: string;
  slug: string;
  bannerImage?: string;
  client?: string;
}

interface ProjectContentData {
  title?: string;
  description?: string;
  slug?: string;
  bannerImage?: string;
  heroImage?: string;
  client?: string;
}

const isLoading = ref(true);

// Load project data
const { data: projectParsedContent } = await useContentQueries.useWorkProject(
  $route.params.slug as string,
);

const project = computed(() => {
  const data = projectParsedContent.value;
  return data
    ? {
        title: data.title,
        date: data.date,
        slug: data.slug,
        isOngoing: data.isOngoing,
        description: data.description,
        client: data.client,
        url: data.url,
        heroImage: data.heroImage || data.bannerImage,
        categories: data.categories,
        problem: data.problem,
        solution: data.solution,
        process: data.process,
        design: data.design,
        result: data.result,
      }
    : null;
});

const client = computed(() => {
  return project.value
    ? clients.find((c) => c.slug === project.value?.client) || ({} as Client)
    : ({} as Client);
});

const projects = ref<RelatedProject[]>([]);
const nextProject = ref<RelatedProject | null>(null);
const previousProject = ref<RelatedProject | null>(null);

if (project.value && project.value.slug) {
  // Load surrounding projects
  const { path } = useRoute();
  const { data: surroundData } =
    await useContentQueries.useWorkProjectSurrounds(path);

  if (surroundData.value) {
    const [prev, next] = surroundData.value;

    nextProject.value = next
      ? {
          title: next.title as string,
          slug: next.slug as string,
          description: next.description as string,
        }
      : null;

    previousProject.value = prev
      ? {
          title: prev.title as string,
          slug: prev.slug as string,
          description: prev.description as string,
        }
      : null;
  }
} else {
  // Get fallback projects
  const { data: fallbackProjects } =
    await useContentQueries.useWorkProjectsFallback(3);

  projects.value = (fallbackProjects.value || []).map(
    (p: ProjectContentData) => ({
      title: p.title || '',
      bannerImage: p.bannerImage || p.heroImage,
      description: p.description || '',
      client: p.client,
      slug: p.slug || '',
    }),
  );
}

isLoading.value = false;
</script>

<template>
  <div
    v-if="isLoading"
    class="flex justify-center w-full"
  >
    <Loading />
  </div>
  <div
    v-else-if="project && project.slug"
    class="flex flex-col items-center mt-40 w-full max-md:mt-10 max-md:max-w-full px-4 lg:px-10"
  >
    <LayoutPageSection
      class="flex w-full text-xl font-light align-center justify-center max-md:max-w-full mt-20"
    >
      <AppButton
        variant="outline"
        :to="{
          name: 'work',
          params: { category: project.client },
        }"
        class="flex flex-row gap-1 items-center justify-center p-4 my-auto rounded-lg h-14 w-[100px]"
        aria-label="Back to Work"
      >
        <NuxtImg
          placeholder
          loading="lazy"
          src="/images/back.svg"
          alt=""
          class="object-cover self-stretch my-auto w-6 aspect-square"
        />&nbsp;<span>Back</span>
      </AppButton>
    </LayoutPageSection>
    <LayoutPageSection
      class="flex flex-col text-black dark:text-white w-full max-w-screen-xl mt-20 mx-auto"
    >
      <div class="flex flex-col px-2 w-full lg:px-32 max-md:max-w-full">
        <div
          class="flex flex-col w-full text-xl font-light text-center max-md:max-w-full"
        >
          <h1 class="leading-relaxed max-md:max-w-full">
            <template v-if="client.logo">
              <NuxtImg
                placeholder
                :src="client.logo"
                :alt="client.name"
                class="object-contain max-h-20 mx-auto"
              />
            </template>
            <template v-else>
              {{ client.name }}
            </template>
          </h1>
          <h2
            class="self-center mt-4 text-6xl tracking-tighter uppercase max-md:max-w-full max-md:text-4xl"
            v-html="project.title"
          />
          <div
            class="flex flex-wrap gap-4 justify-center items-center self-center mt-4 text-base"
          >
            <AppButton
              v-if="project.url"
              size="lg"
              variant="default"
              class="text-nowrap"
              :href="project.url"
            >
              Visit {{ project.title }}
              <OpenLink
                class="stroke-white"
                stroke="#fff"
              />
            </AppButton>
          </div>
          <MDC
            v-if="project.description"
            class="md-content mt-6 text-xl leading-8 max-md:max-w-full text-center"
            :value="project.description"
          />
          <div
            class="flex flex-wrap gap-4 justify-center items-center self-center mt-4 text-base"
          >
            <AppButton
              v-if="project.isOngoing"
              variant="secondary"
              size="sm"
            >
              Ongoing
            </AppButton>
            <time
              v-else
              :datetime="project.date"
              class="leading-relaxed max-md:max-w-full"
            >
              {{ moment(project.date).format('MMMM DD, YYYY') }}
            </time>
          </div>
        </div>
        <div
          class="flex flex-wrap gap-4 justify-center items-start self-center mt-4 text-base"
        >
          <AppButton
            v-for="(category, index) in project.categories"
            :key="index"
            variant="outline"
            size="sm"
            class="text-nowrap"
          >
            {{ category }}
          </AppButton>
        </div>
      </div>
      <NuxtImg
        v-if="project.heroImage"
        placeholder
        loading="lazy"
        class="object-cover mt-20 h-[240px] md:h-[640px] w-full rounded-2xl max-md:mt-10 max-md:max-w-full hover:scale-105 transition-transform duration-300"
        :src="project.heroImage"
        :alt="project.title"
      />
    </LayoutPageSection>

    <div>
      <section
        v-if="project.problem && project.problem.title"
        id="problem"
        class="flex flex-col mt-28 max-w-full md:w-[700px] mx-auto max-md:mt-10"
      >
        <h2
          class="text-4xl max-md:max-w-full"
          v-html="project.problem.title"
        />
        <MDC
          v-if="project.problem.description"
          class="md-content mt-6 text-xl leading-8 max-md:max-w-full text-left"
          :value="project.problem.description"
        />
        <div
          v-if="project.problem.image"
          class="flex overflow-hidden flex-col mt-10 w-full rounded-2xl bg-stone-400 max-md:max-w-full"
        >
          <NuxtImg
            placeholder
            loading="lazy"
            class="object-cover w-full aspect-[1.59] max-md:max-w-full hover:scale-105 transition-transform duration-300"
            :src="project.problem.image"
            :alt="project.problem.title"
          />
        </div>
      </section>

      <section
        v-if="project.solution && project.solution.title"
        id="solution"
        class="flex flex-col mt-28 max-w-full md:w-[700px] mx-auto max-md:mt-10"
      >
        <h2
          class="text-4xl max-md:max-w-full"
          v-html="project.solution.title"
        />
        <MDC
          v-if="project.solution.description"
          class="md-content mt-6 text-xl leading-8 max-md:max-w-full text-left"
          :value="project.solution.description"
        />
        <div
          v-if="project.solution.image"
          class="flex overflow-hidden flex-col mt-10 w-full rounded-2xl bg-stone-400 max-md:max-w-full"
        >
          <NuxtImg
            placeholder
            loading="lazy"
            class="object-cover w-full aspect-[1.59] max-md:max-w-full hover:scale-105 transition-transform duration-300"
            :src="project.solution.image"
            :alt="project.solution.title"
          />
        </div>
      </section>

      <section
        v-if="project.process && project.process.title"
        id="process"
        class="flex flex-col mt-28 max-w-full font-light text-black dark:text-white md:w-[700px] mx-auto"
      >
        <h2
          class="text-4xl max-md:max-w-full"
          v-html="project.process.title"
        />
        <MDC
          v-if="project.process.description"
          class="md-content mt-6 text-xl leading-8 max-md:max-w-full text-left"
          :value="project.process.description"
        />
      </section>

      <section
        v-if="project.process?.items?.length > 0"
        id="process-items"
        class="flex flex-col mt-2 max-w-full font-light text-black dark:text-white mx-auto justify-center align-center"
      >
        <div
          class="flex flex-col md:flex-row flex-wrap gap-5 items-start self-center mb-10 w-full text-base leading-7"
        >
          <div
            v-for="(item, index) in project.process.items"
            :key="index"
            class="flex flex-wrap flex-col md:flex-row w-full md:w-[48%]"
          >
            <div
              class="bg-white dark:bg-gray-800 w-[144px] h-[144px] flex align-center justify-center"
            >
              <NuxtImg
                v-if="item.imgSrc"
                placeholder
                :src="item.imgSrc"
                :alt="item.alt"
                class="object-contain self-center w-24 max-w-full rounded-2xl aspect-square hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <div class="flex-1 md:px-3">
              <h3
                v-if="item.alt"
                class="text-xl mt-3 max-md:max-w-full"
                v-html="item.alt"
              />
              <MDC
                v-if="item.description"
                class="md-content mt-3 text-sm leading-8 max-md:max-w-full text-left"
                :value="item.description"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        v-if="project.design && project.design.title"
        id="design"
        class="flex flex-col mt-28 max-w-full md:w-[700px] mx-auto max-md:mt-10"
      >
        <h2
          class="text-4xl max-md:max-w-full"
          v-html="project.design.title"
        />
        <MDC
          v-if="project.design.description"
          class="md-content mt-6 text-xl leading-8 max-md:max-w-full"
          :value="project.design.description"
        />
      </section>
      <section
        v-if="project.design?.items?.length > 0"
        id="design-items"
        class="flex flex-col max-w-full w-full mx-auto"
      >
        <div
          class="flex flex-wrap gap-5 justify-center items-start self-center md:mt-10 w-full"
        >
          <div
            v-for="(item, index) in project.design.items"
            :key="index"
            class="flex overflow-hidden flex-col rounded-2xl bg-stone-400"
            :class="{
              'w-full': item.fullWidthImage,
              'md:w-[49%]': !item.fullWidthImage,
            }"
          >
            <NuxtImg
              placeholder
              :src="item.imgSrc"
              :alt="item.alt"
              class="object-contain w-full hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section
        v-if="project.result && project.result.title"
        id="result"
        class="flex flex-col mt-28 max-w-full font-light md:w-[700px] mx-auto"
      >
        <h2
          class="text-4xl max-md:max-w-full"
          v-html="project.result.title"
        />
        <MDC
          v-if="project.result.description"
          class="md-content mt-6 text-xl leading-8 max-md:max-w-full text-left"
          :value="project.result.description"
        />
      </section>
      <section
        v-if="project.result?.items?.length > 0"
        id="result-items"
        class="flex mt-2 max-w-full w-full mx-auto"
      >
        <div
          class="grid grid-cols-1 md:grid-cols-2 flex-wrap gap-5 justify-center align-center mb-10 w-full text-inherit lg:max-w-screen-md mx-auto"
        >
          <div
            v-for="(item, index) in project.result.items"
            :key="index"
            class="flex flex-grow rounded-2xl bg-stone-400 flex-1 w-full to-transparent"
            :style="{
              backgroundColor: '#FFFAF1',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }"
          >
            <div
              class="flex grow relative flex-col justify-start px-4 lg:px-10 py-10 w-full aspect-[0.863] max-md:px-5"
            >
              <div class="flex relative flex-col mb-0 max-md:mb-2.5">
                <h3 class="text-3xl tracking-tighter text-left">
                  {{ item.title }}
                </h3>
                <MDC
                  v-if="item.description"
                  class="md-content mt-6 text-md leading-8 max-md:max-w-full text-left"
                  :value="item.description"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <nav
      class="flex flex-wrap gap-5 justify-between items-center max-w-full w-full mt-20 mx-auto max-md:mt-10 mb-10"
    >
      <AppButton
        v-if="previousProject?.slug"
        variant="outline"
        :to="{
          name: 'work-slug',
          params: { slug: previousProject.slug },
        }"
        class="flex gap-1 items-center self-stretch p-4 my-auto w-14 h-14 rounded-lg order-0"
        aria-label="Previous project"
      >
        <NuxtImg
          placeholder
          loading="lazy"
          src="/images/back.svg"
          alt=""
          class="object-cover self-stretch my-auto w-6 aspect-square"
        />
      </AppButton>
      <div
        v-if="nextProject?.slug"
        class="flex flex-col justify-center items-center self-stretch my-auto text-black dark:text-white min-w-[240px] w-[635px] max-md:max-w-full order-first md:order-1"
      >
        <p class="text-base">
          Next project
        </p>
        <h2
          class="mt-2 text-xl font-light tracking-tight text-center uppercase"
          v-html="nextProject.title"
        />
      </div>
      <AppButton
        v-if="nextProject?.slug"
        variant="outline"
        :to="{
          name: 'work-slug',
          params: { slug: nextProject.slug },
        }"
        class="flex gap-1 items-center self-stretch p-4 my-auto w-14 h-14 rounded-lg order-1"
        aria-label="Next project"
      >
        <NuxtImg
          placeholder
          loading="lazy"
          src="/images/next.svg"
          alt=""
          class="object-cover self-stretch my-auto w-6 aspect-square"
        />
      </AppButton>
    </nav>
  </div>
  <template v-else>
    <div
      class="min-h-[450px] flex flex-col align-center justify-center mt-60 max-md:max-w-full px-4 lg:px-10"
    >
      <h2 class="text-4xl">
        Oops! We didn't find that project.
      </h2>
      <p class="mt-6 text-xl">
        You may be interested in the projects below!
      </p>
      <div class="flex flex-wrap gap-5 items-start mt-16 w-full max-md:mt-10">
        <ProjectCard
          v-for="(p, index) in projects"
          :id="p.slug"
          :key="index"
          :title="p.title || ''"
          class="w-full md:w-[31.5%] lg:w-[23.5%] mb-10"
          :image-src="p.bannerImage"
          :description="p.description"
          :client="p.client"
          :slug="p.slug"
        />
      </div>
    </div>
  </template>
</template>
<style lang="css">
.md-content p {
  margin-bottom: 1.5rem;
}

.md-content ol li {
  margin-bottom: 0.15rem;
  margin-left: 1.5rem;
  list-style-type: disc;
}

.md-content ul li {
  margin-bottom: 0.15rem;
  margin-left: 1.5rem;
  list-style-type: number;
}

.md-content h2,
h3,
h4,
h5,
h6 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}
</style>
