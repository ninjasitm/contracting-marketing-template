<script lang="ts" setup>
import { reactive } from 'vue';
definePageMeta({ layout: 'page' });

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

interface SingleProjectState {
  project: {
    client: {
      name: string;
    };
    bannerImage: string;
    title: string;
    description: string;
    date: string;
    categories: string[];
    problem: {
      title: string;
      image: string;
      description: string;
    };
    solution: {
      title: string;
      image: string;
      description: string;
    };
    process: {
      title: string;
      description: string;
      items: ProcessItem[];
    };
    design: {
      title: string;
      description: string;
      items: DesignItem[];
    };
    result: {
      title: string;
      description: string;
      items: ResultItem[];
    };
  };
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

const state: SingleProjectState = reactive({
  project: {
    client: {
      name: 'Walmart',
    },
    bannerImage:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/0db99a745dd1f8ce609fba75bddb17fde7b5dd5eda9f66caea7fbbea7a9bd5b2?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
    title: 'Lorem ipsum dolor sit amet.',
    description:
      'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero.',
    date: 'September 28, 2023',
    categories: ['Product Design', 'Development'],
    problem: {
      title: 'Problem',
      image:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/0db99a745dd1f8ce609fba75bddb17fde7b5dd5eda9f66caea7fbbea7a9bd5b2?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
      description:
        'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero.',
    },
    solution: {
      title: 'Solution',
      image:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/0db99a745dd1f8ce609fba75bddb17fde7b5dd5eda9f66caea7fbbea7a9bd5b2?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
      description:
        'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero.',
    },
    process: {
      title: 'Process',
      image:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/0db99a745dd1f8ce609fba75bddb17fde7b5dd5eda9f66caea7fbbea7a9bd5b2?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
      description:
        'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero.',
      items: [
        {
          imgSrc:
            'https://cdn.builder.io/api/v1/image/assets/TEMP/c2edc28aff1766154b031eb83c8940fa575e1ccc6d5de8b2b00a99ac19f0ae60?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
          alt: 'Process step 1',
          description:
            'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus.',
        },
        {
          imgSrc:
            'https://cdn.builder.io/api/v1/image/assets/TEMP/edbc5048782e495a4f21533fa41ed67f9583c34f0d64d72e552409e6e9a26ace?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
          alt: 'Process step 2',
          description:
            'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus.',
        },
        {
          imgSrc:
            'https://cdn.builder.io/api/v1/image/assets/TEMP/c2edc28aff1766154b031eb83c8940fa575e1ccc6d5de8b2b00a99ac19f0ae60?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
          alt: 'Process step 3',
          description:
            'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus.',
        },
        {
          imgSrc:
            'https://cdn.builder.io/api/v1/image/assets/TEMP/edbc5048782e495a4f21533fa41ed67f9583c34f0d64d72e552409e6e9a26ace?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
          alt: 'Process step 4',
          description:
            'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus.',
        },
      ] as ProcessItem[],
    },
    design: {
      title: 'Design',
      image:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/0db99a745dd1f8ce609fba75bddb17fde7b5dd5eda9f66caea7fbbea7a9bd5b2?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
      description:
        'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero.',
      items: [
        {
          imgSrc:
            'https://cdn.builder.io/api/v1/image/assets/TEMP/c91a91d65a1d46df79a3976489054c2b5d4e9bb3580a8e5a4e708b5b173dd75d?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
          alt: 'Design example 1',
        },
        {
          imgSrc:
            'https://cdn.builder.io/api/v1/image/assets/TEMP/0db99a745dd1f8ce609fba75bddb17fde7b5dd5eda9f66caea7fbbea7a9bd5b2?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
          alt: 'Design example 2',
        },
        {
          imgSrc:
            'https://cdn.builder.io/api/v1/image/assets/TEMP/302f2e1b2d329d9098717d96876b85467505b78c29050604c5b9d27635d1506a?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
          alt: 'Design example 3',
        },
      ] as DesignItem[],
    },
    result: {
      title: 'Results',
      image:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/0db99a745dd1f8ce609fba75bddb17fde7b5dd5eda9f66caea7fbbea7a9bd5b2?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
      description:
        'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc.',
      items: [
        {
          imgSrc:
            'https://cdn.builder.io/api/v1/image/assets/TEMP/d43355f7d96cb8e8aca4bfc67b7ce44fa95791d0d460a6939c9c46282e820c1a?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
          alt: 'Result 1 background',
          title: '98+ million',
          description:
            'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget',
        },
        {
          imgSrc:
            'https://cdn.builder.io/api/v1/image/assets/TEMP/901d0a9606d36da0fe73dab0ee94e46dc3d4b9258cdd2700ae283736b1d6a920?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
          alt: 'Result 2 background',
          title: '98+ million',
          description:
            'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget',
        },
        {
          imgSrc:
            'https://cdn.builder.io/api/v1/image/assets/TEMP/c9d10623429b428a7f8e06f88e463fd0a86b14fb913364eea70657ac1e8aaaa6?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
          alt: 'Result 3 background',
          title: '98+ million',
          description:
            'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget',
        },
      ] as ResultItem[],
    },
  },
  nextProject: {
    id: '2',
    title: 'Lorem ipsum dolor sit amet.',
    description:
      'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus maecenas tempus, tellus eget.',
  },
  previousProject: {
    id: '6',
    title: 'Lorem ipsum dolor sit amet.',
    description:
      'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus maecenas tempus, tellus eget.',
  },
});
</script>

<template>
  <div
    class="flex flex-col items-center mt-40 w-full max-md:mt-10 max-md:max-w-full px-4"
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
            v-html="state.project.client.name"
          ></h1>
          <h2
            class="self-center mt-4 text-6xl tracking-tighter uppercase max-md:max-w-full max-md:text-4xl"
            v-html="state.project.title"
          ></h2>
          <p
            class="mt-4 text-lg max-md:max-w-full"
            v-html="state.project.description"
          ></p>
          <time
            datetime="2023-09-28"
            class="mt-4 leading-relaxed max-md:max-w-full"
          >
            {{ state.project.date }}
          </time>
        </div>
        <div
          class="flex gap-4 justify-center items-start self-center mt-8 text-base"
        >
          <AwesomeButton
            v-for="(category, index) in state.project.categories"
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
        v-if="state.project.bannerImage"
        loading="lazy"
        class="object-cover mt-20 h-[450px] w-full rounded-2xl max-md:mt-10 max-md:max-w-full hover:scale-105 transition-transform duration-300"
        :src="state.project.bannerImage"
        :alt="state.project.title"
      />
    </div>

    <div>
      <section
        class="flex flex-col mt-28 max-w-full md:w-[700px] mx-auto max-md:mt-10"
      >
        <h2
          class="text-4xl max-md:max-w-full"
          v-html="state.project.problem.title"
        ></h2>
        <p
          class="mt-6 text-xl leading-8 max-md:max-w-full"
          v-html="state.project.problem.description"
        ></p>
        <div
          class="flex overflow-hidden flex-col mt-10 w-full rounded-2xl bg-stone-400 max-md:max-w-full"
        >
          <img
            loading="lazy"
            class="object-cover w-full aspect-[1.59] max-md:max-w-full hover:scale-105 transition-transform duration-300"
            :src="state.project.problem.image"
            :alt="state.project.problem.title"
          />
        </div>
      </section>

      <section
        class="flex flex-col mt-28 max-w-full md:w-[700px] mx-auto max-md:mt-10"
      >
        <h2
          class="text-4xl max-md:max-w-full"
          v-html="state.project.solution.title"
        ></h2>
        <p
          class="mt-6 text-xl leading-8 max-md:max-w-full"
          v-html="state.project.solution.description"
        ></p>
        <div
          class="flex overflow-hidden flex-col mt-10 w-full rounded-2xl bg-stone-400 max-md:max-w-full"
        >
          <img
            loading="lazy"
            class="object-cover w-full aspect-[1.59] max-md:max-w-full hover:scale-105 transition-transform duration-300"
            :src="state.project.solution.image"
            :alt="state.project.solution.title"
          />
        </div>
      </section>

      <section
        class="flex flex-col mt-28 max-w-full font-light text-black md:w-[700px] mx-auto max-md:mt-10"
      >
        <h2
          class="text-4xl max-md:max-w-full"
          v-html="state.project.process.title"
        ></h2>
        <p
          class="mt-6 text-xl leading-8 max-md:max-w-full"
          v-html="state.project.process.description"
        ></p>
      </section>

      <section
        class="flex flex-col mt-28 max-w-full font-light text-black mx-auto max-md:mt-10"
      >
        <div
          class="flex flex-wrap gap-5 justify-center items-start self-center mt-10 w-full text-base leading-7 text-center"
        >
          <div
            v-for="(item, index) in state.project.process.items"
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
        class="flex flex-col mt-28 max-w-full md:w-[700px] mx-auto max-md:mt-10"
      >
        <h2
          class="text-4xl max-md:max-w-full"
          v-html="state.project.design.title"
        ></h2>
        <p
          class="mt-6 text-xl leading-8 max-md:max-w-full"
          v-html="state.project.design.description"
        ></p>
      </section>
      <section
        class="flex flex-col mt-28 max-w-full w-full mx-auto max-md:mt-10"
      >
        <div
          class="flex flex-wrap gap-5 justify-center items-start self-center mt-10 w-full"
        >
          <div
            v-for="(item, index) in state.project.design.items"
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
        class="flex flex-col mt-28 max-w-full font-light md:w-[700px] mx-auto max-md:mt-10"
      >
        <h2
          class="text-4xl max-md:max-w-full"
          v-html="state.project.result.title"
        ></h2>
        <p
          class="mt-6 text-xl leading-8 max-md:max-w-full"
          v-html="state.project.result.description"
        ></p>
      </section>
      <section
        class="flex flex-col mt-28 max-w-full w-full mx-auto max-md:mt-10"
      >
        <div
          class="flex flex-wrap gap-5 justify-center items-start self-center mt-10 w-full text-center text-white"
        >
          <div
            v-for="(item, index) in state.project.result.items"
            :key="index"
            class="flex overflow-hidden flex-col rounded-2xl bg-stone-400 w-full md:min-w-[240px] md:w-[414px]"
          >
            <div
              class="flex relative flex-col justify-center px-10 py-40 w-full aspect-[0.863] max-md:px-5 max-md:py-24"
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
        v-if="state.previousProject"
        class="flex gap-1 items-center self-stretch p-4 my-auto w-14 h-14 rounded-lg order-0"
        aria-label="Previous project"
        :to="{
          name: 'work-slug',
          params: { slug: state.previousProject.id },
        }"
      >
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/f3cd58e252b4f02cf75549f5468ba74e9bedf4be10572a04d9c3b5d1ff2ac199?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa"
          alt=""
          class="object-cover self-stretch my-auto w-6 aspect-square"
        />
      </AwesomeButton>
      <div
        v-if="state.nextProject"
        class="flex flex-col justify-center items-center self-stretch my-auto text-black min-w-[240px] w-[635px] max-md:max-w-full order-first md:order-1"
      >
        <p class="text-base">Next project</p>
        <h2
          class="mt-2 text-xl font-light tracking-tight text-center uppercase"
          v-html="state.nextProject.title"
        ></h2>
      </div>
      <AwesomeButton
        v-if="state.nextProject"
        class="flex gap-1 items-center self-stretch p-4 my-auto w-14 h-14 rounded-lg order-1"
        aria-label="Next project"
        :to="{
          name: 'work-slug',
          params: { slug: state.nextProject.id },
        }"
      >
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/16ef346dca0a2892d16ae1a4ec110f8e6a9ef8f8a279e5366f3fbee74e4707ca?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa"
          alt=""
          class="object-cover self-stretch my-auto w-6 aspect-square"
        />
      </AwesomeButton>
    </nav>
  </div>
</template>
