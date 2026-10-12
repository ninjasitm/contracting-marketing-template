<script lang="ts" setup></script>

<template>
  <section
    class="flex flex-wrap gap-5 justify-center items-center py-12 w-full text-black dark:text-white max-md:max-w-full"
  >
    <hr class="w-full border border-black dark:border-white mt-5 mb-5">
    <h2 class="self-stretch my-auto text-2xl font-light">
      Ready to collaborate?
    </h2>
    <NuxtLink
      class="flex gap-1 items-center self-stretch p-3 my-auto text-base tracking-tight uppercase rounded-lg border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      :to="{ name: 'contact' }"
    >
      <NuxtImg
        placeholder
        loading="lazy"
        src="/images/open-link.svg"
        alt=""
        class="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
      />
      <span class="self-stretch my-auto">Start a Project</span>
    </NuxtLink>
    <hr class="w-full border border-black dark:border-white mt-5">
  </section>
</template>
