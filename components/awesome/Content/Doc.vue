<script lang="ts" setup>
const _props = defineProps({
  emptyTip: {
    type: String,
    required: false,
    default: 'This page is empty',
  },
});

const { emptyTip } = _props;
</script>

<template>
  <ContentDoc>
    <template #default="{ doc }">
      <LayoutPageHeader>
        <LayoutPageTitle :text="doc.title" />
      </LayoutPageHeader>
      <LayoutPageSection>
        <ContentRenderer :value="doc" />
      </LayoutPageSection>
    </template>
    <template #empty>
      <h1>{{ emptyTip }}</h1>
    </template>
    <template #not-found>
      <AwesomeError
        :code="404"
        wrap
      />
    </template>
  </ContentDoc>
</template>
