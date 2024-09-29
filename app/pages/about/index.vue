<script lang="ts" setup>
import { reactive } from 'vue';
import config from '@@/app/content/_pages/about.json';
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

const membersParsedContent =
  (
    await useAsyncData('_about.members', () =>
      queryContent('/_about/teammembers').findOne(),
    )
  ).data.value?.members || ([] as Member[]);

const members = membersParsedContent.map(
  (member: any): Member => ({
    name: member.name,
    position: member.position,
    description: member.description,
    photo: member.photo,
    linkedinUrl: member.linkedinUrl,
  }),
);

const state: AboutState = reactive({
  heading: config.heading,
  title: config.title,
  description: config.description,
  teamMembers: {
    title: config.teamMembersTitle,
    members,
  },
});
</script>

<template>
  <div
    class="flex relative flex-col pb-24 w-full md:min-h-[800px] max-md:max-w-full px-2"
  >
    <section class="flex flex-col justify-center pt-40 pb-20 lg:pt-60">
      <h2
        class="text-6xl font-light tracking-tighter text-center text-black uppercase whitespace-nowrap mx-auto max-md:max-w-full max-md:text-4xl"
        v-html="state.heading"
      ></h2>
    </section>
    <section
      class="flex flex-col font-light text-black w-full max-w-screen-xl mx-auto"
    >
      <hr class="w-full border border-black" />
      <h2
        class="gap-2 self-stretch pt-6 w-full text-xl tracking-tight uppercase max-md:max-w-full"
        v-html="state.title"
      ></h2>
      <p
        class="mt-16 text-2xl lg:text-4xl max-md:mt-10 max-md:max-w-full"
        v-html="state.description"
      ></p>
    </section>
    <section
      class="flex flex-col w-full max-w-screen-xl mt-20 mx-auto max-md:mt-10"
    >
      <hr class="w-full border border-black" />
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
