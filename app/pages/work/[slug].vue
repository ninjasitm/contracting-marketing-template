<script lang="ts" setup>
import { reactive } from 'vue';
import Loading from '@/components/layouts/Page/Loading.vue';
definePageMeta({ layout: 'page' });

const $route = useRoute();

interface ProcessItem {
  imgSrc: string;
  alt: string;
  description: string;
}

interface DesignItem {
  imgSrc: string;
  alt: string;
}

interface ResultItem {
  imgSrc: string;
  alt: string;
  title: string;
  description: string;
}

interface Client {
  name: string;
  logo?: string;
  description?: string;
  website?: string;
}

interface Project {
  title: string;
  date: string;
  slug: string;
  isOngoing?: boolean;
  description?: string;
  client: string;
  url: string;
  bannerImage?: string;
  categories?: string[];
  problem?: {
    title: string;
    image: string;
    description: string;
  };
  solution?: {
    title: string;
    image: string;
    description: string;
  };
  process?: {
    title: string;
    image: string;
    description: string;
    items: ProcessItem[];
  };
  design?: {
    title: string;
    image: string;
    description: string;
    items: DesignItem[];
  };
  result?: {
    title: string;
    image: string;
    description: string;
    items: ResultItem[];
  };
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
const project = (
  await useAsyncData('_work.project', () =>
    queryContent('/_work').where({ slug: $route.params.slug }).findOne(),
  )
).data as Project;
if (project.value) {
  const client = (
    await useAsyncData('_client', () =>
      queryContent('/').where({ name: project.value.client }).findOne(),
    )
  ).data as Client;
  const [previousProject, nextProject] = await queryContent('_work')
    .only(['title', 'slug', 'description'])
    .where({ published: true })
    .findSurround(`_work/${project.value.slug}`);
} else {
  // Get three random projects
  const projects = (
    await useAsyncData('_work.project.notFound', () =>
      queryContent('/_work')
        .only(['id', 'imageSrc', 'description', 'client', 'slug'])
        .limit(3)
        .find(),
    )
  ).data as Project[];
}
isLoading.value = false;
</script>

<template>
  <div v-if="isLoading.value" class="flex justify-center w-full">
    <Loading />
  </div>
  <div
    v-else-if="project"
    class="flex flex-col items-center mt-40 w-full max-md:mt-10 max-md:max-w-full px-4 lg:px-10"
  >
    <div
      class="flex flex-col max-w-full text-black w-full max-w-screen-xl mt-20 mx-auto"
    >
      <div class="flex flex-col px-32 w-full max-md:px-5 max-md:max-w-full">
        <div
          class="flex flex-col w-full text-xl font-light text-center max-md:max-w-full"
        >
          <h1
            class="leading-relaxed max-md:max-w-full"
            v-html="client?.name"
          ></h1>
          <h2
            class="self-center mt-4 text-6xl tracking-tighter uppercase max-md:max-w-full max-md:text-4xl"
            v-html="project.title"
          ></h2>
          <p
            class="mt-4 text-lg max-md:max-w-full"
            v-html="project.description"
          ></p>
          <time
            datetime="2023-09-28"
            class="mt-4 leading-relaxed max-md:max-w-full"
          >
            {{ project.date }}
          </time>
        </div>
        <div
          class="flex gap-4 justify-center items-start self-center mt-8 text-base"
        >
          <AwesomeButton
            v-for="(category, index) in project.categories"
            :key="index"
            class="roundex-full"
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
        <p
          class="mt-6 text-xl leading-8 max-md:max-w-full"
          v-html="project.problem.description"
        ></p>
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
        <p
          class="mt-6 text-xl leading-8 max-md:max-w-full"
          v-html="project.solution.description"
        ></p>
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
        <p
          class="mt-6 text-xl leading-8 max-md:max-w-full"
          v-html="project.process.description"
        ></p>
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
            <p class="mt-4">{{ item.description }}</p>
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
        <p
          class="mt-6 text-xl leading-8 max-md:max-w-full"
          v-html="project.design.description"
        ></p>
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
        <p
          class="mt-6 text-xl leading-8 max-md:max-w-full"
          v-html="project.result.description"
        ></p>
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
        v-if="previousProject"
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
        v-if="nextProject"
        class="flex flex-col justify-center items-center self-stretch my-auto text-black min-w-[240px] w-[635px] max-md:max-w-full order-first md:order-1"
      >
        <p class="text-base">Next project</p>
        <h2
          class="mt-2 text-xl font-light tracking-tight text-center uppercase"
          v-html="nextProject.title"
        ></h2>
      </div>
      <AwesomeButton
        v-if="nextProject"
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
    <div class="min-h-[450px] flex flex-col align-center justify-center mt-20">
      <h2 class="text-4xl">Oops! We didn't find that project.</h2>
      <p class="mt-6 text-xl">You may be interested in the projects below!</p>
      <main class="flex flex-wrap gap-5 items-start mt-16 w-full max-md:mt-10">
        <ProjectCard
          v-for="(p, index) in projects"
          :id="p.id"
          :key="index"
          :image-src="p.imageSrc"
          :description="p.description"
          :client="p.client"
          :slug="p.slug"
        />
      </main>
    </div>
  </template>
</template>
