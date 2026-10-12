<script setup lang="ts">
// Concept: ninjasitm/nitm-marketing app/Faq.vue, da649f7e374da848aac277d202a49942d708fc92.
withDefaults(defineProps<{
  items: { question: string; answer: string }[];
  title?: string;
}>(), { title: 'Frequently asked questions' });
</script>

<template>
  <section
    v-if="items.length"
    class="w-full text-foreground"
  >
    <h2
      v-if="title"
      class="text-3xl md:text-4xl mb-8"
    >
      {{ title }}
    </h2>
    <div class="border-t border-border">
      <details
        v-for="(item, index) in items"
        :key="index"
        class="group border-b border-border"
      >
        <summary class="cursor-pointer py-5 text-lg font-semibold break-words rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {{ item.question }}
        </summary>
        <p class="pb-6 text-muted-foreground leading-relaxed whitespace-pre-line break-words">
          {{ item.answer }}
        </p>
      </details>
    </div>
  </section>
</template>
