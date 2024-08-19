<script lang="ts" setup>
import { reactive } from 'vue';
import TeamMember from '../../../components/about/TeamMember.vue';
definePageMeta({ layout: 'page' });

type Member = {
  name: string;
  position: string;
  description: string;
  photo: string;
  linkedinUrl?: string;
};

type TeamMembers = {
  title: string;
  members: Member[];
};

type AboutState = {
  heading: string;
  title: string;
  description: string;
  teamMembers: TeamMembers;
};

const state: AboutState = reactive({
  heading: 'About',
  title: 'Curabitur ullamcorper',
  description:
    'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus,',
  teamMembers: {
    title: 'Curabitur ullamcorper',
    members: [
      {
        name: 'First name last name',
        position: 'position',
        description:
          'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus,',
        photo:
          'https://cdn.builder.io/api/v1/image/assets/TEMP/fa3afd6c6c5a743cfe99388e8deacc7a973a9bca04d383fc33a3b0e09062e521?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
      },
      {
        name: 'First name last name',
        position: 'position',
        description:
          'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus,',
        photo:
          'https://cdn.builder.io/api/v1/image/assets/TEMP/97d802a2ad26e2b0daed5fddceaca0f7a84cd1462ef7badf49aeeb61b4a9d034?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
      },
      {
        name: 'First name last name',
        position: 'position',
        description:
          'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus,',
        photo:
          'https://cdn.builder.io/api/v1/image/assets/TEMP/b7d375964646f6369cfabd126fe59600404766a9cf02623b01faed4ee9da4ca0?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
      },
      {
        name: 'First name last name',
        position: 'position',
        description:
          'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus,',
        photo:
          'https://cdn.builder.io/api/v1/image/assets/TEMP/ce89edd52ddba5c5b73fba1245062d2c6e7ce2547a5ee7d155f7b477b06ef65b?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
      },
    ],
  },
});
</script>

<template>
  <div
    class="flex relative flex-col pb-24 w-full md:min-h-[800px] max-md:max-w-full px-4"
  >
    <section class="h-[450px] flex flex-col justify-center">
      <h2
        class="text-6xl font-light tracking-tighter text-center text-black uppercase whitespace-nowrap mx-auto max-md:max-w-full max-md:text-4xl mt-20"
        v-html="state.heading"
      ></h2>
    </section>
    <section
      class="flex flex-col max-w-full font-light text-black w-full max-w-screen-xl mx-auto"
    >
      <hr class="w-full border border-black" />
      <h2
        class="gap-2 self-stretch pt-6 w-full text-xl tracking-tight uppercase max-md:max-w-full"
        v-html="state.title"
      ></h2>
      <p
        class="mt-16 text-4xl max-md:mt-10 max-md:max-w-full"
        v-html="state.description"
      ></p>
    </section>
    <section
      class="flex flex-col mt-32 max-w-full w-full max-w-screen-xl mt-20 mx-auto max-md:mt-10"
    >
      <h2
        class="gap-2 self-stretch pt-6 w-full text-xl font-light tracking-tight text-black uppercase"
        v-html="state.teamMembers.title"
      ></h2>
      <div class="flex flex-col mt-16 w-full max-md:mt-10 max-md:max-w-full">
        <div
          class="flex flex-wrap gap-5 items-start w-full text-base max-md:max-w-full"
        >
          <TeamMember
            v-for="(member, index) in state.teamMembers.members"
            :key="index"
            class="w-[100%] md:w[31.5%] lg:w-[23.5%] mb-10"
            :name="member.name"
            :position="member.position"
            :description="member.description"
            :photo="member.photo"
            :linkedin-url="member.linkedinUrl"
          />
        </div>
        <!-- <div
          class="flex flex-wrap gap-4 items-start mt-10 w-full max-md:max-w-full"
        >
          <button
            class="flex gap-1 items-center p-4 w-14 rounded-lg"
            aria-label="Previous"
          >
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/f3cd58e252b4f02cf75549f5468ba74e9bedf4be10572a04d9c3b5d1ff2ac199?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa"
              alt=""
              class="object-contain self-stretch my-auto w-6 aspect-square"
            />
          </button>
          <button
            class="flex gap-1 items-center p-4 w-14 rounded-lg"
            aria-label="Next"
          >
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/16ef346dca0a2892d16ae1a4ec110f8e6a9ef8f8a279e5366f3fbee74e4707ca?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa"
              alt=""
              class="object-contain self-stretch my-auto w-6 aspect-square"
            />
          </button>
        </div> -->
      </div>
    </section>
  </div>
</template>
../../../components/about/TeamMember.vue
