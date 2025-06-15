<script setup lang="ts">
import Navbar from './Navbar.vue';
</script>

<template>
  <header id="main-header" class="bg-white dark:bg-brown-800 w-full">
    <Navbar />
  </header>
  <slot />
</template>
