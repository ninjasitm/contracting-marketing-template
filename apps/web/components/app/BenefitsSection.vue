<script setup lang="ts">
// Concept: ninjasitm/nitm-marketing services/ServiceBenefits.vue, da649f7e374da848aac277d202a49942d708fc92.
defineProps<{
  title: string;
  description?: string;
  items: { title: string; description: string; icon?: string; bullets?: string[]; items?: string[] }[];
}>();
</script>

<template>
  <section
    v-if="items.length"
    class="w-full text-foreground"
  >
    <h2 class="text-3xl md:text-4xl break-words">
      {{ title }}
    </h2>
    <p
      v-if="description"
      class="mt-4 max-w-2xl text-muted-foreground leading-relaxed"
    >
      {{ description }}
    </p>
    <div class="grid gap-6 md:grid-cols-2 mt-8">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="rounded-2xl border border-border bg-card text-card-foreground p-6 min-w-0"
      >
        <Icon
          v-if="item.icon"
          :name="item.icon"
          aria-hidden="true"
          class="w-6 h-6 mb-5 text-primary"
        />
        <h3 class="text-xl font-semibold break-words">
          {{ item.title }}
        </h3>
        <p class="mt-3 text-muted-foreground leading-relaxed break-words">
          {{ item.description }}
        </p>
        <ul
          v-if="(item.bullets ?? item.items)?.length"
          class="mt-4 list-disc pl-5 space-y-2 text-muted-foreground"
        >
          <li
            v-for="(bullet, bulletIndex) in item.bullets ?? item.items"
            :key="bulletIndex"
            class="break-words"
          >
            {{ bullet }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
