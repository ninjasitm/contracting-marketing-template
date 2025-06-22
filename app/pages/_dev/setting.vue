<script lang="ts" setup>
// import {
//   TabGroup,
//   TabList,
//   Tab as HeadlessUiTab,
//   TabPanels,
//   TabPanel,
// } from '@headlessui/vue'
// import { capitalize } from '~/utils/str'
// import { Size } from '~/composables'
import { useScreen } from '~/composables/use-screen';

// composable
const screen = useScreen();

// compiler macro
definePageMeta({ layout: 'page' });
useHead({ title: 'Settings' });

// funcs
const randomToken = () => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 255; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

// state
const username = ref('viandwi24');
const id = ref(randomToken());
const enableSpamProtection = ref(false);
const enableDirList = ref(false);
const enableAdvancedSetting = ref(false);

// methods
const validate = async () => {
  // fetch username from github api
  try {
    const response = await fetch(
      `https://api.github.com/users/${username.value}`,
    );
    if (response.status !== 200) {
      throw new Error(
        `error when fetching username : ${response.statusText} (${response.status})`,
      );
    }
    const data = (await response.json()) as {
      name: string;
      id: string;
    };
    alert(`Found Accout Name ${data.name} with id : ${data.id}`);
  } catch (err) {
    alert(err);
  }
};
</script>

<template>
  <LayoutPageWrapper>
    <LayoutPageSection class="mb-0">
      <UiAlert class="mb-6">
        <UiAlertTitle>This is a page for testing purposes</UiAlertTitle>
        <UiAlertDescription>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </UiAlertDescription>
      </UiAlert>
    </LayoutPageSection>
    <LayoutPageHeader>
      <LayoutPageTitle class="capitalize"> Setting </LayoutPageTitle>
    </LayoutPageHeader>
    <LayoutPageSection>
      <div class="mb-6">
        <HeadlessTabGroup
          as="div"
          class="flex flex-col md:flex-row md:space-x-4"
          :vertical="screen.greater('md').value"
        >
          <HeadlessTabList
            class="w-full md:w-1/6 flex md:flex-col rounded-lg mb-2"
          >
            <HeadlessTab
              v-for="(item, i) in ['General', 'Protection', 'Advanced']"
              :key="i"
              v-slot="{ selected }"
              as="template"
            >
              <button
                :class="[
                  'md:w-full text-left px-3 rounded py-2.5 text-sm leading-5 transition-all hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-white/[0.12] dark:hover:text-white',
                  selected
                    ? 'font-extrabold'
                    : 'text-gray-800 dark:text-gray-400',
                ]"
              >
                {{ item }}
              </button>
            </HeadlessTab>
          </HeadlessTabList>
          <HeadlessTabPanels class="flex-1">
            <!-- general -->
            <HeadlessTabPanel>
              <UiCard class="mb-6">
                <UiCardContent>
                  <UiCardTitle class="capitalize">
                    validate github profile
                  </UiCardTitle>
                  <p class="mb-2">
                    type your github username and click the button to validate.
                  </p>
                  <div class="flex">
                    <div class="w-full md:w-1/3 flex">
                      <div
                        class="flex-none flex items-center px-4 py-2 bg-muted border border-r-0 rounded-l-md"
                      >
                        <span class="text-sm text-muted-foreground"
                          >github.com/</span
                        >
                      </div>
                      <UiInput
                        v-model="username"
                        class="rounded-l-none"
                        placeholder="username"
                      />
                    </div>
                  </div>
                </UiCardContent>
                <UiCardFooter
                  class="flex flex-col space-y-2 md:space-y md:flex-row items-center md:justify-between"
                >
                  <p>
                    Learn more about
                    <NuxtLink
                      class="underline font-bold capitalize"
                      href="https://docs.github.com/en/rest/users/users#get-a-user"
                    >
                      github users api
                    </NuxtLink>
                  </p>
                  <UiButton
                    class="capitalize"
                    size="sm"
                    variant="outline"
                    @click="validate"
                  >
                    validate
                  </UiButton>
                </UiCardFooter>
              </UiCard>
              <UiCard class="mb-4">
                <UiCardContent>
                  <UiCardTitle class="capitalize"> bot id </UiCardTitle>
                  <p class="mb-2">This is your bot ID.</p>
                  <div class="flex">
                    <div class="w-full md:w-1/3 flex">
                      <UiInput v-model="id" class="rounded-r-none" readonly />
                      <UiButton
                        variant="outline"
                        class="rounded-l-none border-l-0 flex space-x-1"
                      >
                        <Icon name="ic:baseline-content-copy" />
                        <span>Copy</span>
                      </UiButton>
                    </div>
                  </div>
                </UiCardContent>
                <UiCardFooter class="justify-between">
                  <p>Used when interacting with the bot.</p>
                </UiCardFooter>
              </UiCard>
            </HeadlessTabPanel>
            <!-- protection -->
            <HeadlessTabPanel>
              <UiCard
                :class="{
                  'mb-4': true,
                  'border-red-500 dark:border-red-500': !enableSpamProtection,
                }"
              >
                <UiCardContent>
                  <UiCardTitle class="capitalize">
                    spam protection
                  </UiCardTitle>
                  <p class="mb-2">toggle enable to remove the red border</p>
                  <div class="flex items-center space-x-2">
                    <UiSwitch
                      id="spam-protection"
                      v-model:checked="enableSpamProtection"
                    />
                    <UiLabel for="spam-protection" class="capitalize">
                      {{ enableSpamProtection ? 'enabled' : 'disabled' }}
                    </UiLabel>
                  </div>
                </UiCardContent>
                <UiCardFooter class="justify-between">
                  <p>if enable we will secure your comments from spam</p>
                </UiCardFooter>
              </UiCard>
            </HeadlessTabPanel>
            <!-- advanced -->
            <HeadlessTabPanel>
              <UiCard class="mb-6">
                <UiCardContent>
                  <UiCardTitle class="capitalize">
                    enable advanced settings
                  </UiCardTitle>
                  <p class="mb-2">
                    you can enable advanced settings to change the settings
                  </p>
                  <div class="flex items-center space-x-2">
                    <UiSwitch
                      id="advanced-setting"
                      v-model:checked="enableAdvancedSetting"
                    />
                    <UiLabel for="advanced-setting" class="capitalize">
                      {{ enableAdvancedSetting ? 'enabled' : 'disabled' }}
                    </UiLabel>
                  </div>
                </UiCardContent>
              </UiCard>
              <UiCard class="mb-6" :disabled="!enableAdvancedSetting">
                <UiCardContent>
                  <UiCardTitle class="capitalize">
                    directory listing
                  </UiCardTitle>
                  <p class="mb-2">
                    if no index file is present within a directory, the
                    directory contents will be displayed.
                  </p>
                  <div class="flex items-center space-x-2">
                    <UiSwitch id="dir-list" v-model:checked="enableDirList" />
                    <UiLabel for="dir-list" class="capitalize">
                      {{ enableDirList ? 'enabled' : 'disabled' }}
                    </UiLabel>
                  </div>
                </UiCardContent>
              </UiCard>
            </HeadlessTabPanel>
          </HeadlessTabPanels>
        </HeadlessTabGroup>
      </div>
    </LayoutPageSection>
  </LayoutPageWrapper>
</template>
