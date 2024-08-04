<script lang="ts" setup>
import { reactive } from 'vue';

const state: any = reactive({
  style: {
    backgroundColor: '#E4F4FB',
  },
  footerStyle: {},
  companyInfoStyle: {
    backgroundColor: '#D7EFF9',
  },
  items: [
    { label: 'Address', value: '1350 College Ave, Bronx, NY, 10456' },
    { label: 'Email', value: 'hello@nitm.co' },
    { label: 'Phone', value: '(347) 903-1557' },
    { label: 'Company Name', value: 'Ninjas in the Machine Inc' },
    { label: 'DUNS', value: '117275000' },
    { label: 'CAGE', value: '8ZQV4' },
  ],
  naicsCodesTitle: 'NAICS Codes',
  naicsCodes: [
    '541511',
    '541512',
    '541513',
    '541519',
    '541611',
    '541618',
    '541690',
    '541720',
    '541990',
  ],
});
</script>

<template>
  <div class="overflow-x-hidden" :style="state.style">
    <LayoutPageNavbar />
    <LayoutPageContent class="container mx-auto">
      <slot />
    </LayoutPageContent>
    <LayoutPageFooter
      :style="state.footerStyle"
      :company-info-style="state.companyInfoStyle"
      :naics-codes="state.naicsCodes"
      :items="state.items"
    />
  </div>
</template>
