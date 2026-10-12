<script setup lang="ts">
// Adapted from ninjasitm/nitm-marketing @ da649f7e374da848aac277d202a49942d708fc92; see docs/reference/NITM_MARKETING_LICENSE.md.
import { ref, watch } from 'vue';
import { isSafeHref } from '@/utils/safe-link';
const props = defineProps<{ quote: string; author: string; role?: string; company?: string; avatar?: string }>();
const avatarFailed = ref(false);
watch(() => props.avatar, () => { avatarFailed.value = false; });
</script>

<template>
  <figure class="rounded-2xl border border-border bg-card text-card-foreground p-8">
    <blockquote class="text-xl leading-relaxed break-words">
      “{{ quote }}”
    </blockquote>
    <figcaption class="mt-6 flex items-center gap-4">
      <NuxtImg
        v-if="isSafeHref(avatar) && !avatarFailed"
        :src="avatar"
        alt=""
        width="48"
        height="48"
        loading="lazy"
        class="w-12 h-12 rounded-full object-cover shrink-0"
        @error="avatarFailed = true"
      />
      <div>
        <cite class="not-italic font-semibold break-words">{{ author }}</cite>
        <p
          v-if="role || company"
          class="text-sm text-muted-foreground break-words"
        >
          {{ [role, company].filter(Boolean).join(', ') }}
        </p>
      </div>
    </figcaption>
  </figure>
</template>
