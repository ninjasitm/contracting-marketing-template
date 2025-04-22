<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'close', event: MouseEvent): void;
}>();
const props = defineProps({
  blur: {
    type: Boolean,
    default: true,
  },
  closeButton: {
    type: Boolean,
    default: true,
  },
  closeButtonText: {
    type: String,
    default: '',
  },
});

const isShow = ref(false);

const close = (e: MouseEvent) => {
  isShow.value = false;
  setTimeout(() => emit('close', e), 300);
};

const onCloseComponentClick = (e: MouseEvent) => {
  const acceptedClasses = ['action-sheet', 'action-sheet-container'];
  const target = e.target as HTMLElement;
  const targetClassList = target.classList;
  for (const acceptedClass of acceptedClasses) {
    if (targetClassList.contains(acceptedClass)) {
      close(e);
      break;
    }
  }
};

onMounted(() => {
  isShow.value = true;
});
</script>

<template>
  <Teleport to="body">
    <HeadlessTransitionRoot
      :show="isShow"
      :class="{
        'dark:bg-black bg-white/[0.5]': true,
        'action-sheet fixed z-50 top-0 left-0 w-screen h-screen max-h-screen max-w-full flex flex-col justify-end bg-black/[0.5] justify-center': true,
        'backdrop-blur-lg': props.blur,
      }"
      enter="transition-opacity duration-300"
      enter-from="opacity-0"
      enter-to="opacity-100"
      leave="transition-opacity duration-300"
      leave-from="opacity-100"
      leave-to="opacity-0"
      @click="onCloseComponentClick"
    >
      <div
        class="flex flex-col overflow-hidden relative h-full justify-center p-1"
      >
        <AwesomeActionSheetGroup
          v-if="closeButton"
          transparent
          :blur="false"
          :class="{
            'h-16 pr-0': true,
            'align-end': closeButtonText?.length,
          }"
        >
          <AwesomeButton
            type="none"
            size="lg"
            class="w-16 h-16 pr-0 rounded-full self-end text-gray-400 hover:text-gray-100"
            @click="close"
          >
            <Icon
              v-if="!closeButtonText?.length"
              name="uil:times"
              size="32px"
            />
            <template v-else>{{ closeButtonText }}</template>
          </AwesomeButton>
        </AwesomeActionSheetGroup>
        <div
          class="action-sheet-container flex flex-col overflow-y-auto space-y-1 justify-stretch px-4 lg:px-10 pb-2 pt-1 h-full"
        >
          <slot />
        </div>
      </div>
    </HeadlessTransitionRoot>
  </Teleport>
</template>
