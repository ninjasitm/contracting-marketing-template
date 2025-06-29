<script lang="ts" setup>
// Store usage - explicit imports to avoid VueUse conflicts
import { useCounterStore } from '../../stores/use-counter';
import { useIdentityStore } from '../../stores/use-identity';

const counter = useCounterStore();
const identity = useIdentityStore();

// compiler micro
definePageMeta({ layout: 'page' });
useHead({ title: 'Test Page' });
</script>

<template>
  <LayoutPageWrapper>
    <LayoutPageHeader>
      <LayoutPageTitle
        text="Testing"
        class="capitalize"
      />
    </LayoutPageHeader>
    <LayoutPageSection>
      <LayoutPageSectionTitle text="Stores Test" />
      <!-- store::counter -->
      <div class="mb-6">
        <div class="mb-2">
          Counter : {{ counter.count }}
        </div>
        <div
          class="flex flex-col items-center justify-items-center space-y-2 md:space-y-0 md:flex-row md:space-x-2"
        >
          <UiButton
            class="w-full md:w-auto capitalize"
            variant="secondary"
            size="sm"
            @click.prevent="counter.increment"
          >
            increment
          </UiButton>
          <UiButton
            class="w-full md:w-auto"
            variant="secondary"
            size="sm"
            @click.prevent="counter.increment2x"
          >
            increment2x
          </UiButton>
          <UiButton
            class="w-full md:w-auto capitalize"
            variant="secondary"
            size="sm"
            @click.prevent="counter.decrement"
          >
            decrement
          </UiButton>
          <UiButton
            class="w-full md:w-auto capitalize"
            variant="secondary"
            size="sm"
            @click.prevent="counter.reset"
          >
            reset
          </UiButton>
        </div>
      </div>
      <!-- store::identity -->
      <div class="mb-6">
        <div class="mb-2">
          <span class="capitalize">Full Name : </span>
          <span>{{ identity.fullName }}</span>
        </div>
        <div class="mb-2">
          <div
            class="flex flex-col items-center space-y-2 md:space-y-0 md:flex-row md:space-x-2"
          >
            <UiInput
              v-model="identity.firstName"
              class="w-full md:w-1/3"
              placeholder="First Name"
            />
            <UiInput
              v-model="identity.lastName"
              class="w-full md:w-1/3"
              placeholder="Last Name"
            />
            <UiButton
              class="capitalize w-full md:w-auto"
              variant="secondary"
              size="default"
              @click.prevent="identity.reset"
            >
              reset
            </UiButton>
          </div>
        </div>
      </div>
    </LayoutPageSection>
  </LayoutPageWrapper>
</template>
