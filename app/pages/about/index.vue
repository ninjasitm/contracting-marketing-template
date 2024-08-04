<script lang="ts" setup>
import { reactive } from 'vue';
import TeamMember from './TeamMember.vue';
definePageMeta({ layout: 'page' });

type Member = {
  name: string;
  position: string;
  description: string;
  imageSrc: string;
  linkedinSrc: string;
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
        imageSrc:
          'https://cdn.builder.io/api/v1/image/assets/TEMP/fa3afd6c6c5a743cfe99388e8deacc7a973a9bca04d383fc33a3b0e09062e521?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
        linkedinSrc:
          'https://cdn.builder.io/api/v1/image/assets/TEMP/fb375e91d7f92b531398d50389c7ba9fa725cbd95aa201df7c35dcd82e5df4e9?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
      },
      {
        name: 'First name last name',
        position: 'position',
        description:
          'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus,',
        imageSrc:
          'https://cdn.builder.io/api/v1/image/assets/TEMP/97d802a2ad26e2b0daed5fddceaca0f7a84cd1462ef7badf49aeeb61b4a9d034?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
        linkedinSrc:
          'https://cdn.builder.io/api/v1/image/assets/TEMP/fb375e91d7f92b531398d50389c7ba9fa725cbd95aa201df7c35dcd82e5df4e9?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
      },
      {
        name: 'First name last name',
        position: 'position',
        description:
          'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus,',
        imageSrc:
          'https://cdn.builder.io/api/v1/image/assets/TEMP/b7d375964646f6369cfabd126fe59600404766a9cf02623b01faed4ee9da4ca0?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
        linkedinSrc:
          'https://cdn.builder.io/api/v1/image/assets/TEMP/fb375e91d7f92b531398d50389c7ba9fa725cbd95aa201df7c35dcd82e5df4e9?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
      },
      {
        name: 'First name last name',
        position: 'position',
        description:
          'Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus,',
        imageSrc:
          'https://cdn.builder.io/api/v1/image/assets/TEMP/ce89edd52ddba5c5b73fba1245062d2c6e7ce2547a5ee7d155f7b477b06ef65b?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
        linkedinSrc:
          'https://cdn.builder.io/api/v1/image/assets/TEMP/399572b6a9b300d92cc1d969511a660981ec833a47bbe5f6b935c80143d63685?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa',
      },
    ],
  },
});
</script>

<template>
  <section class="mt-40 max-md:mt-10">
    <h2
      class="text-6xl font-light tracking-tighter text-center text-black uppercase whitespace-nowrap max-w-[1320px] mx-auto max-md:max-w-full max-md:text-4xl"
      v-html="state.title"
    ></h2>
  </section>
  <section class="flex flex-col max-w-full font-light text-black w-[1320px]">
    <h2
      class="gap-2 self-stretch pt-6 w-full text-xl tracking-tight uppercase max-md:max-w-full"
      v-html="state.title"
    ></h2>
    <p
      class="mt-16 text-4xl max-md:mt-10 max-md:max-w-full"
      v-html="state.description"
    ></p>
  </section>
  <section class="flex flex-col mt-32 max-w-full w-[1320px] max-md:mt-10">
    <h2
      class="gap-2 self-stretch pt-6 w-full text-xl font-light tracking-tight text-black uppercase"
      v-html="state.teamMembers.title"
    ></h2>
    <div class="flex flex-col mt-16 w-full max-md:mt-10 max-md:max-w-full">
      <div class="flex gap-5 items-start w-full text-base max-md:max-w-full">
        <TeamMember
          v-for="(member, index) in state.teamMembers.members"
          :key="index"
          :name="member.name"
          :position="member.position"
          :description="member.description"
          :image-src="member.imageSrc"
          :linkedin-src="member.linkedinSrc"
        />
      </div>
      <div
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
      </div>
    </div>
  </section>
</template>
