<script lang="ts" setup>
import { reactive, computed } from 'vue';
import TeamMember from '../../../components/about/TeamMember.vue';
import _config from '@content/_pages/about.json';
import type { BasePageState } from '@/types/types';

export interface AboutPageState extends BasePageState {
  heading?: string;
  title?: string;
  description?: string;
  teamMembersTitle?: string;
}

definePageMeta({ layout: 'page' });

const config = _config as AboutPageState;

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

// Extended AboutPageState to include teamMembers
interface ExtendedAboutPageState extends AboutPageState {
  teamMembers: TeamMembers;
}

const { data: membersParsedContent } = await useContentQueries.useTeamMembers();

const members = (membersParsedContent.value || []).map(
  (member: Record<string, unknown>): Member => ({
    name: member.name as string,
    position: member.position as string,
    description: member.description as string,
    photo: member.photo as string,
    linkedinUrl: member.linkedinUrl as string,
  }),
);

const state: ExtendedAboutPageState = reactive({
  hero: config.hero,
  heading: config.heading,
  title: config.title,
  description: config.description,
  teamMembersTitle: config.teamMembersTitle,
  callToAction: config.callToAction,
  teamMembers: {
    title: config.teamMembersTitle || 'Team',
    members,
  },
});

// Computed properties for CTA fallbacks
const ctaTitle = computed(
  () => state.callToAction?.title || "Let's Work Together",
);
const ctaDescription = computed(
  () =>
    state.callToAction?.description ||
    "Ready to collaborate with our experienced team? We'd love to hear about your project and discuss how we can help achieve your goals.",
);
const ctaPrimaryAction = computed(
  () => state.callToAction?.primaryButtonText || 'Get In Touch',
);
const ctaPrimaryUrl = computed(
  () => state.callToAction?.primaryButtonUrl || '/contact',
);
</script>

<template>
  <div
    class="flex relative flex-col pb-24 w-full md:min-h-[800px] max-md:max-w-full px-2"
  >
    <!-- Hero Section using AppHero -->
    <AppHero
      :title="state.hero?.title || state.heading"
      :description="state.hero?.description"
      mode="text"
      alignment="center"
      size="medium"
      class="pt-40 pb-20 lg:pt-60"
    />

    <!-- About Description Section -->
    <LayoutPageSection
      class="flex flex-col font-light text-black dark:text-white w-full max-w-screen-xl mx-auto"
    >
      <hr class="w-full border border-black dark:border-white" />
      <h2
        class="gap-2 self-stretch pt-6 w-full text-xl tracking-tight uppercase max-md:max-w-full"
        v-html="state.title"
      />
      <p
        class="mt-16 text-2xl lg:text-4xl max-md:mt-10 max-md:max-w-full"
        v-html="state.description"
      />
    </LayoutPageSection>

    <!-- Team Members Section -->
    <LayoutPageSection
      class="flex flex-col w-full max-w-screen-xl mt-20 mx-auto max-md:mt-10"
    >
      <hr class="w-full border border-black dark:border-white" />
      <h2
        class="gap-2 self-stretch pt-6 w-full text-xl font-light tracking-tight text-black dark:text-white uppercase"
        v-html="state.teamMembers.title"
      />
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
      </div>
    </LayoutPageSection>

    <!-- Call to Action Section -->
    <AppCTA
      v-if="
        state.callToAction &&
        (state.callToAction.title || state.callToAction.primaryButtonText)
      "
      :title="ctaTitle"
      :description="ctaDescription"
      :primary-action="ctaPrimaryAction"
      secondary-action="View Our Work"
      class="w-full max-w-screen-xl mx-auto mt-20"
      @primary-action="navigateTo(ctaPrimaryUrl)"
      @secondary-action="navigateTo('/work')"
    />
  </div>
</template>
