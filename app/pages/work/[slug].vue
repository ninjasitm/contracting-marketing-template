<script lang="ts" setup>
import { reactive } from 'vue';
import moment from 'moment';
import type { ParsedContent } from '@nuxt/content';
import clients from '@/content/clients.json';
import Loading from '@/components/layouts/Page/Loading.vue';
import ProjectCard from '@/components/work/ProjectCard.vue';
import type { Client, Project } from '@/utils/types';

definePageMeta({ layout: 'page' });

const $route = useRoute();

interface RelatedProject {
  title: string;
  description: string;
  slug: string;
  bannerImage?: string;
  client?: string;
}

interface SingleProjectState {
  project: Project;
  nextProject?: {
    id: string;
    title: string;
    description: string;
  };
  previousProject?: {
    id: string;
    title: string;
    description: string;
  };
}

const isLoading = ref(true);
const projectParsedContent =
  (
    await useAsyncData(
      '_work.project',
      async (): Promise<ParsedContent> =>
        await queryContent('/_work')
          .where({ slug: $route.params.slug })
          .findOne(),
    )
  ).data.value || ({} as Project);
const project = {
  title: projectParsedContent.title,
  date: projectParsedContent.date,
  slug: projectParsedContent.slug,
  isOngoing: projectParsedContent.isOngoing,
  description: projectParsedContent.description,
  client: projectParsedContent.client,
  url: projectParsedContent.url,
  bannerImage: projectParsedContent.bannerImage,
  categories: projectParsedContent.categories,
  problem: projectParsedContent.problem,
  solution: projectParsedContent.solution,
  process: projectParsedContent.process,
  design: projectParsedContent.design,
  result: projectParsedContent.result,
};

let client = {} as Client;
let projects = [] as RelatedProject[];
let nextProject = {} as RelatedProject;
let previousProject = {} as RelatedProject;
if (project && project.slug) {
  client = clients.find((c) => c.slug === project.client) || ({} as Client);

  const { path } = useRoute();
  const [previousProjectParsedContent, nextProjectParsedContent] =
    await queryContent()
      .only(['title', 'slug', 'description'])
      .where({ published: true })
      .findSurround(path);

  nextProject = {
    title: nextProjectParsedContent?.title as string,
    slug: nextProjectParsedContent?.slug as string,
    description: nextProjectParsedContent?.description as string,
  };

  previousProject = {
    title: previousProjectParsedContent?.title as string,
    slug: previousProjectParsedContent?.slug as string,
    description: previousProjectParsedContent?.description as string,
  };
} else {
  // Get three random projects
  const projectsParsedContent =
    (
      await useAsyncData(
        '_work.project.notFound',
        async () =>
          await queryContent('/_work')
            .only(['title', 'bannerImage', 'description', 'client', 'slug'])
            .limit(3)
            .find(),
      )
    ).data.value || ([] as RelatedProject[]);

  projects = projectsParsedContent.map((p) => ({
    title: p.title as string,
    bannerImage: p.bannerImage,
    description: p.description,
    client: p.client,
    slug: p.slug,
  }));
}
isLoading.value = false;
</script>

<template>
  <div v-if="isLoading" class="flex justify-center w-full">
    <Loading />
  </div>
  <div
    v-else-if="project && project.slug"
    class="flex flex-col items-center mt-40 w-full max-md:mt-10 max-md:max-w-full px-4 lg:px-10"
  >
    <div class="flex flex-col text-black w-full max-w-screen-xl mt-20 mx-auto">
      <div class="flex flex-col px-32 w-full max-md:px-5 max-md:max-w-full">
        <div
          class="flex flex-col w-full text-xl font-light text-center max-md:max-w-full"
        >
          <h1 class="leading-relaxed max-md:max-w-full">
            <template v-if="client.logo">
              <img
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
          ></h2>
          <MDC
            v-if="project.description"
            class="md-content mt-6 text-xl leading-8 max-md:max-w-full"
            :value="project.description"
          />
          <AwesomeButton v-if="project.isOngoing">Ongoing</AwesomeButton>
          <time
            v-else
            :datetime="project.date"
            class="leading-relaxed max-md:max-w-full"
          >
            {{ moment(project.date).format('MMMM DD, YYYY') }}
          </time>
        </div>
        <div
          class="flex flex-wrap gap-4 justify-center items-start self-center mt-4 text-base"
        >
          <AwesomeButton
            v-for="(category, index) in project.categories"
            :key="index"
            class="roundex-full text-nowrap"
            outline
            :uppercase="false"
          >
            {{ category }}
          </AwesomeButton>
        </div>
      </div>
      <img
        v-if="project.bannerImage"
        loading="lazy"
        class="object-cover mt-20 h-[450px] w-full rounded-2xl max-md:mt-10 max-md:max-w-full hover:scale-105 transition-transform duration-300"
        :src="project.bannerImage"
        :alt="project.title"
      />
    </div>

    <div>
      <section
        v-if="project.problem"
        class="flex flex-col mt-28 max-w-full md:w-[700px] mx-auto max-md:mt-10"
      >
        <h2
          class="text-4xl max-md:max-w-full"
          v-html="project.problem.title"
        ></h2>
        <MDC
          v-if="project.problem.description"
          class="md-content mt-6 text-xl leading-8 max-md:max-w-full"
          :value="project.problem.description"
        />
        <div
          class="flex overflow-hidden flex-col mt-10 w-full rounded-2xl bg-stone-400 max-md:max-w-full"
        >
          <img
            loading="lazy"
            class="object-cover w-full aspect-[1.59] max-md:max-w-full hover:scale-105 transition-transform duration-300"
            :src="project.problem.image"
            :alt="project.problem.title"
          />
        </div>
      </section>

      <section
        v-if="project.solution"
        class="flex flex-col mt-28 max-w-full md:w-[700px] mx-auto max-md:mt-10"
      >
        <h2
          class="text-4xl max-md:max-w-full"
          v-html="project.solution.title"
        ></h2>
        <MDC
          v-if="project.solution.description"
          class="md-content mt-6 text-xl leading-8 max-md:max-w-full"
          :value="project.solution.description"
        />
        <div
          class="flex overflow-hidden flex-col mt-10 w-full rounded-2xl bg-stone-400 max-md:max-w-full"
        >
          <img
            loading="lazy"
            class="object-cover w-full aspect-[1.59] max-md:max-w-full hover:scale-105 transition-transform duration-300"
            :src="project.solution.image"
            :alt="project.solution.title"
          />
        </div>
      </section>

      <section
        v-if="project.process"
        class="flex flex-col mt-28 max-w-full font-light text-black md:w-[700px] mx-auto max-md:mt-10"
      >
        <h2
          class="text-4xl max-md:max-w-full"
          v-html="project.process.title"
        ></h2>
        <MDC
          v-if="project.process.description"
          class="md-content mt-6 text-xl leading-8 max-md:max-w-full"
          :value="project.process.description"
        />
      </section>

      <section
        v-if="project.process?.items"
        class="flex flex-col mt-28 max-w-full font-light text-black mx-auto max-md:mt-10"
      >
        <div
          class="flex flex-wrap gap-5 justify-center items-start self-center mt-10 w-full text-base leading-7 text-center"
        >
          <div
            v-for="(item, index) in project.process.items"
            :key="index"
            class="flex flex-col flex-wrap w-full md:min-w-[240px] md:w-[414px]"
          >
            <img
              :src="item.imgSrc"
              :alt="item.alt"
              class="object-cover self-center w-36 max-w-full rounded-2xl aspect-square hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <MDC
              v-if="item.description"
              class="md-content mt-6 text-sm leading-8 max-md:max-w-full"
              :value="item.description"
            />
          </div>
        </div>
      </section>

      <section
        v-if="project.design"
        class="flex flex-col mt-28 max-w-full md:w-[700px] mx-auto max-md:mt-10"
      >
        <h2
          class="text-4xl max-md:max-w-full"
          v-html="project.design.title"
        ></h2>
        <MDC
          v-if="project.design.description"
          class="md-content mt-6 text-xl leading-8 max-md:max-w-full"
          :value="project.design.description"
        />
      </section>
      <section
        v-if="project.design?.items"
        class="flex flex-col mt-28 max-w-full w-full mx-auto max-md:mt-10"
      >
        <div
          class="flex flex-wrap gap-5 justify-center items-start self-center mt-10 w-full"
        >
          <div
            v-for="(item, index) in project.design.items"
            :key="index"
            class="flex overflow-hidden flex-col rounded-2xl bg-stone-400 w-full md:min-w-[240px] md:w-[414px]"
          >
            <img
              :src="item.imgSrc"
              :alt="item.alt"
              class="object-cover w-full aspect-[0.86] hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section
        v-if="project.result"
        class="flex flex-col mt-28 max-w-full font-light md:w-[700px] mx-auto max-md:mt-10"
      >
        <h2
          class="text-4xl max-md:max-w-full"
          v-html="project.result.title"
        ></h2>
        <MDC
          v-if="project.result.description"
          class="md-content mt-6 text-xl leading-8 max-md:max-w-full"
          :value="project.result.description"
        />
      </section>
      <section
        v-if="project.result?.items"
        class="flex flex-col mt-28 max-w-full w-full mx-auto max-md:mt-10"
      >
        <div
          class="flex flex-wrap gap-5 justify-center items-start self-center mt-10 w-full text-center text-white"
        >
          <div
            v-for="(item, index) in project.result.items"
            :key="index"
            class="flex overflow-hidden flex-col rounded-2xl bg-stone-400 w-full md:min-w-[240px] md:w-[414px]"
          >
            <div
              class="flex relative flex-col justify-center px-4 lg:px-10 py-40 w-full aspect-[0.863] max-md:px-5 max-md:py-24"
            >
              <img
                :src="item.imgSrc"
                :alt="item.alt"
                class="object-cover absolute inset-0 size-full hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div class="flex relative flex-col mb-0 max-md:mb-2.5">
                <h3 class="text-6xl tracking-tighter max-md:text-4xl">
                  {{ item.title }}
                </h3>
                <p class="mt-2 text-xl leading-8">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <nav
      class="flex flex-wrap gap-5 justify-between items-center mt-28 max-w-full w-full max-w-screen-xl mt-20 mx-auto max-md:mt-10 mb-10"
    >
      <AwesomeButton
        v-if="previousProject?.slug"
        class="flex gap-1 items-center self-stretch p-4 my-auto w-14 h-14 rounded-lg order-0"
        aria-label="Previous project"
        :to="{
          name: 'work-slug',
          params: { slug: previousProject.slug },
        }"
      >
        <img
          loading="lazy"
          src="/images/back.svg"
          alt=""
          class="object-cover self-stretch my-auto w-6 aspect-square"
        />
      </AwesomeButton>
      <div
        v-if="nextProject?.slug"
        class="flex flex-col justify-center items-center self-stretch my-auto text-black min-w-[240px] w-[635px] max-md:max-w-full order-first md:order-1"
      >
        <p class="text-base">Next project</p>
        <h2
          class="mt-2 text-xl font-light tracking-tight text-center uppercase"
          v-html="nextProject.title"
        ></h2>
      </div>
      <AwesomeButton
        v-if="nextProject?.slug"
        class="flex gap-1 items-center self-stretch p-4 my-auto w-14 h-14 rounded-lg order-1"
        aria-label="Next project"
        :to="{
          name: 'work-slug',
          params: { slug: nextProject.slug },
        }"
      >
        <img
          loading="lazy"
          src="/images/next.svg"
          alt=""
          class="object-cover self-stretch my-auto w-6 aspect-square"
        />
      </AwesomeButton>
    </nav>
  </div>
  <template v-else>
    <div
      class="min-h-[450px] flex flex-col align-center justify-center mt-60 max-md:max-w-full px-4 lg:px-10"
    >
      <h2 class="text-4xl">Oops! We didn't find that project.</h2>
      <p class="mt-6 text-xl">You may be interested in the projects below!</p>
      <div class="flex flex-wrap gap-5 items-start mt-16 w-full max-md:mt-10">
        <ProjectCard
          v-for="(p, index) in projects"
          :id="p.slug"
          :key="index"
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
  margin-bottom: 0.5rem;
  margin-left: 1.5rem;
  list-style-type: disc;
}
</style>
