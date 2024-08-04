<script lang="ts" setup>
import { reactive } from 'vue';
import ProjectCard from './ProjectCard.vue';
definePageMeta({ layout: 'page' });

type Project = {
  imageSrc: string;
  description: string;
  client: string;
};

type WorkPageState = {
  title: string;
  featuredClient: {
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
  title: 'Our Work',
  featuredClient: {
    description:
      'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus maecenas tempus, tellus eget.',
    type: 'Client',
  },
  footer: {
    title: 'Ready to get started?',
    description:
      'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus maecenas tempus, tellus eget.',
  },
  currentCategory: null,
  categories: [
    {
      name: 'All Projects',
      filter: 'all',
    },
    {
      name: 'Filter 3',
      filter: 'filter-3',
    },
    {
      name: 'Filter 4',
      filter: 'filter-4',
    },
    {
      name: 'Filter 5',
      filter: 'filter-5',
    },
  ],
  projects: [
    {
      imageSrc:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/a79e8f6bb4030ac454868679f70a510d01f7ec42192b837dfa23f676c37f7343?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
      description:
        'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus maecenas tempus, tellus eget.',
      client: 'Client',
    },
    {
      imageSrc:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/6895aa2fb41c046d838617416f567f9ec44ef2ca64fbaaf00726ade783c7c607?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
      description:
        'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus maecenas tempus, tellus eget.',
      client: 'Client',
    },
    {
      imageSrc:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/2c03a623fe7f75a84cc754fe319b3d270ca324b672fe26416dfe8bc4743afbb7?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
      description:
        'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus maecenas tempus, tellus eget.',
      client: 'Client',
    },
    {
      imageSrc:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/49eeb5fbf0cf8856126f7db2b831e5b62d6c4023fada9e8e6545761a7e67b992?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
      description:
        'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus maecenas tempus, tellus eget.',
      client: 'Client',
    },
    {
      imageSrc:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/626633f4ad9216f9175cf963a0067be222ac19cb04a9bf5021a5a2e55df86de0?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
      description:
        'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus maecenas tempus, tellus eget.',
      client: 'Client',
    },
    {
      imageSrc:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/277f37ed5b534207661fd4d6906acb0abd483ee78f5028d260ad34dea1a25c98?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
      description:
        'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus maecenas tempus, tellus eget.',
      client: 'Client',
    },
  ],
});

// eslint-disable-next-line require-await
async function onLoadCategory(id: any): Promise<void> {
  state.currentCategory = id;
  // Implement category load logic here
  console.log('Loading category');
}
</script>
<template>
  <section class="mt-40 max-md:mt-10">
    <h1
      class="w-full max-w-[1320px] text-6xl font-light tracking-tighter text-center text-black uppercase max-md:max-w-full max-md:text-4xl"
      v-html="state.title"
    ></h1>
  </section>
  <section class="flex flex-col max-w-full text-black w-[1320px]">
    <header class="flex overflow-hidden flex-col w-full rounded-2xl">
      <div
        class="flex relative flex-col p-16 w-full min-h-[640px] max-md:px-5 max-md:max-w-full"
      >
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/214aba3ece6b47dd2a980da3666eb37b0cd2790e6e9fc59fc093759d5400b428?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa"
          alt=""
          class="object-cover absolute inset-0 size-full"
        />
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/5523b8c1cbaf2e11e916dcb45a41bd6ceafe0ca89d12c89b5ff60c9a9e317c45?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa"
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
      class="flex gap-4 items-start self-start mt-16 text-base max-md:mt-10 max-md:max-w-full"
    >
      <AwesomeButton
        class="gap-2 self-stretch px-6 py-4 text-white bg-sky-600 rounded-[1000px] max-md:px-5"
        @click="onLoadCategory"
      >
        All Projects
      </AwesomeButton>
      <AwesomeButton
        v-for="(category, index) in state.categories"
        :key="index"
        :text="category.name"
      >
      </AwesomeButton>
    </nav>
    <main class="flex flex-wrap gap-5 items-start mt-16 w-full max-md:mt-10">
      <ProjectCard
        v-for="(project, index) in state.projects"
        :key="index"
        :image-src="project.imageSrc"
        :description="project.description"
        :client="project.client"
      />
    </main>
  </section>
  <section class="flex flex-col max-w-full text-black w-[1320px]">
    <h2
      class="gap-2 self-stretch pt-6 w-full text-xl font-light tracking-tight uppercase max-md:max-w-full"
      v-html="state.footer.title"
    ></h2>
    <div
      class="flex flex-col mt-16 w-full max-w-[1320px] max-md:mt-10 max-md:max-w-full"
    >
      <p
        class="text-4xl font-light max-md:max-w-full"
        v-html="state.footer.description"
      ></p>
      <a
        href="#"
        class="flex gap-1 items-center self-start p-4 mt-7 text-base tracking-tight uppercase rounded-lg"
      >
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/acf526b3811a56de4e85ac6000b6e7bed2d87916ef2a3c3a3d3aba828eaa5df1?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa"
          class="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
          alt=""
        />
      </a>
    </div>
  </section>
</template>
