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
    <h2 class="self-stretch my-auto text-2xl font-light">
      Ready to collaborate?
    </h2>
    <button
      class="flex gap-1 items-center self-stretch p-4 my-auto text-base tracking-tight uppercase rounded-lg"
      @click="startProject"
    >
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/acf526b3811a56de4e85ac6000b6e7bed2d87916ef2a3c3a3d3aba828eaa5df1?apiKey=3963d39927114ac982c49f7f4c7787aa&&apiKey=3963d39927114ac982c49f7f4c7787aa"
        alt=""
        class="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
      />
      <span class="self-stretch my-auto">Start a Project</span>
    </button>
  </section>
</template>
