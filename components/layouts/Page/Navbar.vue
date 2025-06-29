<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useAppConfig } from '#imports';
import { useNavbarParser } from '~/composables/use-navbar-parser';
import { useScreen } from '~/composables/use-screen';
import type { LayoutPageNavbarMenu } from '~/utils/types';

const { config } = useAppConfig();
const { parseMenuRoute, parseMenuTitle } = useNavbarParser();
const $screen = useScreen();

const menus = computed(
  () => (config?.layout?.page?.navbar?.menus || []) as LayoutPageNavbarMenu[],
);

// const links = computed((): Record<string, string> => {
//   return (config?.layout?.page?.navbar?.links || {}) as Record<string, string>;
// });

// drawer
const showDrawer = ref(false);

/**
 * Get social icon component based on platform name
 */
const getSocialIcon = (title: string) => {
  switch (title.toLowerCase()) {
    case 'instagram':
      return 'i-mdi-instagram';
    case 'facebook':
      return 'i-mdi-facebook';
    case 'linkedin':
      return 'i-mdi-linkedin';
    case 'twitter':
      return 'i-mdi-twitter';
    default:
      return 'i-mdi-link';
  }
};
</script>

<template>
  <div
    id="main-navbar"
    class="mx-auto w-full flex flex-col fixed backdrop-filter backdrop-blur-md top-0 z-40 flex-none transition-colors duration-300 md:z-50 border-b border-gray-950/10 h-[75px] md:min-h-[75px] bg-white dark:bg-brown-800"
  >
    <!-- header banner -->
    <div
      v-if="config.layout?.page?.navbar?.hasBanner"
      class="navbar-banner w-full h-[47px] flex overflow-hidden space-x-4 group"
      :style="config.layout?.page?.navbar?.bannerStyle || {
        backgroundColor: '#4A7C3C',
      }
      "
    >
      <div class="align-center flex space-x-4 animate-loop-scroll group-hover:paused">
        <span
          v-for="info in config.companyInfo"
          :key="info.title"
          class="text-white text-xs px-2 py-1 flex items-center w-[max-content]"
        >{{ info.title }}<strong class="ml-2">{{ info.value }}</strong></span>
      </div>
      <div
        class="align-center flex space-x-4 animate-loop-scroll group-hover:paused"
        aria-hidden="true"
      >
        <span
          v-for="info in config.companyInfo"
          :key="info.title"
          class="text-white text-xs px-2 py-1 flex items-center w-[max-content]"
        >{{ info.title }} <strong class="ml-2">{{ info.value }}</strong></span>
      </div>
    </div>
    <!-- content -->
    <div class="w-full px-4 lg:px-10 max-w-screen-xl flex-1 flex items-center justify-between mx-auto">
      <!-- title -->
      <div>
        <slot name="title">
          <NuxtLink
            :to="{ name: 'index' }"
            class="font-bold text-lg"
          >
            <NuxtImg
              v-if="config.logo"
              placeholder
              :src="config.logo"
              :alt="config.title"
              class="w-auto h-[50px] md:h-[50px] object-contain"
            />
            <span
              v-else
              class="text-2xl font-bold text-green-500"
            >{{
              config.title
            }}</span>
          </NuxtLink>
        </slot>
      </div>
      <!-- menus -->
      <div
        v-if="$screen.greater('md').value"
        class="flex space-x-4 items-center bg-white/[0.75] dark:bg-brown-700/[0.75] rounded-xl px-4 lg:px-10 py-4"
      >
        <div class="flex space-x-4 text-sm items-center">
          <!-- dynamic menus -->
          <template
            v-for="(item, i) in menus"
            :key="i"
          >
            <LayoutPageNavbarMenuWrapper :menu="item" />
          </template>
        </div>
        <div class="flex space-x-4 gap-4 items-center">
          <a
            v-for="link in config.socialLinks"
            :key="link.title"
            :href="link.url"
            class="text-white hover:text-orange-400 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="sr-only">{{ link.title }}</span>
            <div class="w-4 h-4 flex items-center justify-center rounded-full hover:border-orange-400">
              <Icon
                :name="getSocialIcon(link.title)"
                class="w-4 h-4"
              />
            </div>
          </a>
        </div>
        <!-- others -->
        <!-- <div class="pl-4 flex space-x-4 text-xl align-center items-center"> -->
        <!-- todo: feat/localization -->
        <!-- TODO: Add language switcher when localization is implemented -->
        <!-- <a
            v-if="links.capabilities?.length"
            download="nitm-capabilities-statement.pdf"
            class="gap-2 p-4 px-2 text-sm tracking-tight bg-transparent rounded-lg border border-black dark:text-white text-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            :href="links.capabilities"
          >
            Capabilities Statement
          </a>
          <NuxtLink
            v-if="links.startWorkshop?.length"
            class="gap-2 p-4 text-sm tracking-tight text-white bg-primary rounded-lg hover:bg-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 inline-flex items-center justify-center"
            :to="links.startWorkshop"
          >
            Start a Workshop
          </NuxtLink> -->
        <!-- <LayoutPageNavbarDropdownThemeSwitcher
            class="gap-2 p-4 text-sm tracking-tight"
          /> -->
        <!-- </div> -->
      </div>
      <!-- drawer:btn -->
      <div
        v-else
        class="flex space-x-4 items-center"
        :class="{ 'divide-x divide-gray-500': menus.length > 0 }"
      >
        <div class="pl-4 flex space-x-3 text-xl">
          <button
            type="button"
            class="text-gray-400 hover:text-gray-100 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            @click.prevent="() => (showDrawer = !showDrawer)"
          >
            <Icon
              name="heroicons:bars-3-bottom-right-20-solid"
              size="32px"
            />
          </button>
        </div>
      </div>
    </div>
    <!-- misc -->
    <!-- drawer -->
    <UiSheet
      :open="showDrawer"
      @update:open="showDrawer = $event"
    >
      <UiSheetContent
        side="right"
        class="w-full sm:w-[400px]"
      >
        <UiSheetHeader class="text-left">
          <UiSheetTitle>Menu</UiSheetTitle>
        </UiSheetHeader>

        <div class="flex flex-col space-y-4 mt-6">
          <!-- Home Link -->
          <NuxtLink
            class="flex justify-center items-center text-base space-x-2 h-[4rem] w-full border-b"
            :to="{ name: 'index' }"
            @click="() => (showDrawer = false)"
          >
            <span class="text-lg">Home</span>
          </NuxtLink>

          <!-- Dynamic menus -->
          <template
            v-for="(item, i) in menus"
            :key="i"
          >
            <template v-if="item?.type === 'link'">
              <NuxtLink
                :to="parseMenuRoute(item.to)"
                #="{ isActive }"
                class="flex justify-center items-center text-base space-x-2 h-[4rem] w-full border-b"
                @click="() => (showDrawer = false)"
              >
                <span
                  :class="{
                    'text-lg': true,
                    'text-gray-900 dark:text-gray-100 font-bold': isActive,
                    'text-gray-700 dark:text-gray-300': !isActive,
                  }"
                >{{ parseMenuTitle(item?.title) }}</span>
              </NuxtLink>
            </template>

            <template v-if="item?.type === 'button'">
              <NuxtLink
                :to="parseMenuRoute(item.to)"
                class="flex justify-center items-center text-base space-x-2 h-[4rem] w-full border-b bg-primary text-primary-foreground rounded-md"
                @click="() => (showDrawer = false)"
              >
                <span class="text-lg">{{ parseMenuTitle(item?.title) }}</span>
              </NuxtLink>
            </template>

            <template v-if="item?.type === 'dropdown'">
              <div class="w-full border-b">
                <HeadlessDisclosure v-slot="{ open }">
                  <HeadlessDisclosureButton
                    class="text-gray-700 dark:text-gray-300 w-full py-4 flex items-center justify-center duration-300 transition-all"
                    :class="{ 'font-bold': open }"
                  >
                    <span class="text-lg">{{
                      parseMenuTitle(item?.title)
                    }}</span>
                    <Icon
                      name="carbon:chevron-right"
                      class="ml-2"
                      :class="[
                        open
                          ? 'duration-300 transition-all transform rotate-90'
                          : 'rotate-0',
                      ]"
                    />
                  </HeadlessDisclosureButton>
                  <Transition
                    enter-active-class="transition duration-100 ease-out"
                    enter-from-class="transform scale-95 opacity-0"
                    enter-to-class="transform scale-100 opacity-100"
                    leave-active-class="transition duration-75 ease-out"
                    leave-from-class="transform scale-100 opacity-100"
                    leave-to-class="transform scale-95 opacity-0"
                  >
                    <HeadlessDisclosurePanel class="pb-4">
                      <template
                        v-for="(child, j) in item?.children || []"
                        :key="j"
                      >
                        <NuxtLink
                          :to="parseMenuRoute(child.to)"
                          #="{ isActive }"
                          class="block w-full py-2 pl-4 text-sm"
                          @click="() => (showDrawer = false)"
                        >
                          <span
                            :class="[
                              isActive
                                ? 'text-gray-900 dark:text-gray-100 font-bold'
                                : 'text-gray-700 dark:text-gray-300',
                            ]"
                          >{{ parseMenuTitle(child?.title) }}</span>
                        </NuxtLink>
                      </template>
                    </HeadlessDisclosurePanel>
                  </Transition>
                </HeadlessDisclosure>
              </div>
            </template>
          </template>

          <!-- Action Buttons -->
          <!-- <div class="space-y-4 pt-4">
            <a
              v-if="links.capabilities?.length"
              class="flex justify-center items-center text-base h-[4rem] w-full border border-border rounded-md hover:bg-accent transition-colors"
              :href="links.capabilities"
              download="nitm-capabilities-statement.pdf"
              @click="() => (showDrawer = false)"
            >
              <span class="text-lg">Capabilities Statement</span>
            </a>

            <NuxtLink
              v-if="links.startWorkshop?.length"
              class="flex justify-center items-center text-base h-[4rem] w-full bg-primary text-primary-foreground rounded-md"
              :to="links.startWorkshop || { name: 'contact' }"
              @click="() => (showDrawer = false)"
            >
              <span class="text-lg">Start a Workshop</span>
            </NuxtLink>
          </div> -->

          <!-- Social Links -->
          <div class="pt-6 border-t">
            <div class="flex justify-center space-x-4">
              <a
                v-for="link in config.socialLinks"
                :key="link.title"
                :href="link.url"
                class="text-foreground hover:text-primary transition-colors p-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span class="sr-only">{{ link.title }}</span>
                <Icon
                  :name="getSocialIcon(link.title)"
                  class="w-5 h-5"
                />
              </a>
            </div>
          </div>
        </div>
      </UiSheetContent>
    </UiSheet>
  </div>
</template>