<script lang="ts" setup>
// eslint-disable-next-line require-await
async function startProject() {
  // Implement project start logic here
  console.log('Starting a new project');
}
</script>

<template>
  <section
    class="flex flex-wrap gap-5 justify-center items-center py-12 w-full text-black max-md:max-w-full"
  >
    <hr class="w-full border border-black mt-5 mb-5" />
    <h2 class="self-stretch my-auto text-2xl font-light">
      Ready to collaborate?
    </h2>
    <AwesomeButton
      size="lg"
      class="flex gap-1 items-center self-stretch p-3 my-auto text-base tracking-tight uppercase rounded-lg border border-black"
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
    </AwesomeButton>
    <hr class="w-full border border-black mt-5" />
  </section>
</template>
