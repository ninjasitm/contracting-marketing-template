<script lang="ts" setup>
import { reactive, Teleport } from 'vue';
import config from '../../app/content/_pages/home.json';

definePageMeta({ layout: 'page' });
useHead({
  titleTemplate: '',
  title: config?.title || 'Contracting Starter',
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
    backgroundImage: string;
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

const state: HomeState = reactive(config);
</script>

<template>
  <div
    class="flex relative flex-col pb-24 w-full min-h-[500px] md:min-h-[800px] max-md:max-w-full"
  >
    <Teleport defer to="#page-banner">
      <section
        class="flex flex-col max-w-full uppercase w-full justify-end min-h-[500px] pb-12 md:pb-24 md:h-[800px]"
        :style="{
          backgroundImage: `url('${state.banner.backgroundImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }"
      >
        <div class="flex flex-col w-full max-w-screen-xl mx-auto">
          <div class="flex flex-col w-full md:w-[692px] px-4">
            <h2
              class="text-6xl font-light tracking-tighter text-black max-md:max-w-full max-md:text-4xl"
              v-html="state.banner.title"
            ></h2>
            <p
              class="mt-6 text-2xl font-light max-md:max-w-full"
              v-html="state.banner.description"
            ></p>
            <AwesomeButton
              size="lg"
              class="gap-2 self-start p-4 mt-6 text-sm tracking-tight text-white bg-sky-600 rounded-lg w-full md:w-[max-content]"
              :href="state.banner.actionUrl"
            >
              {{ state.banner.actionText }}
            </AwesomeButton>
          </div>
        </div>
      </section>
    </Teleport>
    <section
      class="flex flex-col w-full max-w-screen-xl mt-5 md:mt-20 mx-auto px-4"
    >
      <hr class="w-full border border-black mt-10" />
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
            <AwesomeButton
              size="lg"
              class="flex gap-1 items-center mt-3 p-3 my-auto text-base tracking-tight uppercase rounded-lg border border-black max-w-[max-content]"
            >
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/acf526b3811a56de4e85ac6000b6e7bed2d87916ef2a3c3a3d3aba828eaa5df1?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa"
                alt=""
                class="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
              />
              <span class="self-stretch my-auto">View our processes</span>
            </AwesomeButton>
          </div>
          <div
            class="flex flex-wrap gap-20 items-start mt-16 w-full max-md:mt-10"
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
                  class="flex-1 shrink gap-4 pb-4 mt-4 w-full border-b border-black"
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
      class="flex flex-col mt-32 w-full font-light max-md:mt-10 max-w-screen-xl mx-auto px-4"
    >
      <hr class="w-full border border-black mt-10" />
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
  </div>
</template>
