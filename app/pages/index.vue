<script lang="ts" setup>
import { reactive } from 'vue';
const { awesome } = useAppConfig();
definePageMeta({ layout: 'page' });
useHead({
  titleTemplate: '',
  title: awesome?.name || 'Nuxt 3 Awesome Starter',
});

type Differentiator = {
  icon: string;
  description: string;
};

type CoreCompetency = {
  heading: string;
  items: string[];
};

type HomeState = {
  banner: {
    title: string;
    description: string;
    actionText: string;
    actionUrl: string;
  };
  coreCompetencies: {
    title: string;
    description: string;
    items: CoreCompetency[];
  };
  differentiators: {
    title: string;
    items: Differentiator[];
  };
};

const state: HomeState = reactive({
  banner: {
    title: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
    description:
      'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.',
    actionText: 'Download capabilities statement',
    actionUrl: '#download-capabilities',
  },
  coreCompetencies: {
    title: 'Core Competencies',
    description:
      'NITM specializes in product management, development, consulting, and team building for complex and deep-tech solutions across various industries and verticals including Healthcare, EdTech, AI, SaaS, Data, HIPAA compliance, and more.',
    items: [
      {
        heading: 'Product Management',
        items: [
          'Product Strategy',
          'Product Roadmap',
          'Product Design',
          'Product Development',
          'Product Launch',
          'Product Marketing',
        ],
      },
      {
        heading: 'Consulting',
        items: [
          'Business Strategy',
          'Market Research',
          'Competitive Analysis',
          'Go-to-Market Strategy',
          'Growth Strategy',
          'Business Development',
        ],
      },
      {
        heading: 'Team Building',
        items: [
          'Team Structure',
          'Team Culture',
          'Team Development',
          'Team Training',
          'Team Management',
          'Team Leadership',
        ],
      },
    ],
  },
  differentiators: {
    title: 'Differentiators',
    items: [
      {
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/acf526b3811a56de4e85ac6000b6e7bed2d87916ef2a3c3a3d3aba828eaa5df1?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
        description:
          'NITM is a team of experienced product managers, developers, and consultants who have worked with Fortune 500 companies, startups, and government agencies.',
      },
      {
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/acf526b3811a56de4e85ac6000b6e7bed2d87916ef2a3c3a3d3aba828eaa5df1?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
        description:
          'NITM has a proven track record of delivering high-quality products and services on time and within budget.',
      },
      {
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/acf526b3811a56de4e85ac6000b6e7bed2d87916ef2a3c3a3d3aba828eaa5df1?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
        description:
          'NITM is committed to providing exceptional customer service and support to all of our clients.',
      },
    ],
  },
});
</script>

<template>
  <main
    class="flex relative flex-col pb-24 w-full min-h-[800px] max-md:max-w-full"
  >
    <section
      class="flex flex-col mt-56 max-w-full uppercase w-[692px] max-md:mt-10"
    >
      <h2
        class="text-6xl font-light tracking-tighter text-black max-md:max-w-full max-md:text-4xl"
        v-html="state.banner.title"
      ></h2>
      <AwesomeButton
        :href="state.banner.actionUrl"
        class="gap-2 self-start p-4 mt-6 text-sm tracking-tight text-white bg-sky-600 rounded-lg"
      >
        {{ state.banner.actionText }}
      </AwesomeButton>
    </section>
    <section class="flex flex-col w-full max-md:max-w-full">
      <h2
        class="gap-2 self-stretch pt-6 w-full text-xl font-light tracking-tight uppercase text-sky-950"
        v-html="state.coreCompetencies.title"
      ></h2>
      <div class="flex flex-col mt-16 w-full text-black max-md:mt-10">
        <div class="flex flex-col w-full max-md:max-w-full">
          <div class="flex flex-col w-full max-md:max-w-full">
            <p
              class="text-4xl font-light max-md:max-w-full"
              v-html="state.coreCompetencies.description"
            ></p>
            <a
              href="#"
              class="flex gap-1 items-center self-start p-4 mt-6 text-base tracking-tight uppercase rounded-lg"
            >
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/acf526b3811a56de4e85ac6000b6e7bed2d87916ef2a3c3a3d3aba828eaa5df1?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa"
                class="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
                alt=""
              />
              <span class="self-stretch my-auto">View our process</span>
            </a>
          </div>
          <div
            class="flex flex-wrap gap-5 items-start mt-16 w-full max-md:mt-10"
          >
            <div
              v-for="(competency, index) in state.coreCompetencies.items"
              :key="index"
              class="flex flex-col flex-1 shrink basis-0 min-w-[240px]"
            >
              <h3 class="text-base tracking-tight uppercase">
                {{ competency.heading }}
              </h3>
              <ul class="flex flex-col mt-6 w-full text-lg font-light">
                <li
                  v-for="(item, i) in competency.items"
                  :key="i"
                  class="flex-1 shrink gap-2 pb-4 mt-4 w-full"
                  :class="{ 'mt-0': i === 0 }"
                >
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section
      class="flex flex-col mt-32 w-full font-light max-md:mt-10 max-md:max-w-full"
    >
      <h2
        class="gap-2 self-stretch pt-6 w-full text-xl tracking-tight uppercase whitespace-nowrap text-sky-950"
        v-html="state.differentiators.title"
      ></h2>
      <div
        class="flex flex-wrap gap-5 mt-16 w-full text-2xl text-black max-md:mt-10"
      >
        <article
          v-for="(differentiator, index) in state.differentiators.items"
          :key="index"
          class="flex flex-col grow shrink p-10 bg-white rounded-2xl min-w-[240px] w-[330px] max-md:px-5"
          :icon="differentiator.icon"
          :description="differentiator.description"
        >
          <img
            :src="differentiator.icon"
            :alt="differentiator.description"
            class="object-contain w-14 aspect-square"
          />
          <p class="mt-10">{{ differentiator.description }}</p>
        </article>
      </div>
    </section>
  </main>
</template>
