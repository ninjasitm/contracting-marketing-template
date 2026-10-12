<script setup lang="ts">
import Navbar from './Navbar.vue';
</script>

<template>
  <header
    id="main-header"
    class="bg-background border-b border-border w-full"
  >
    <Navbar />
  </header>
  <slot />
</template>
