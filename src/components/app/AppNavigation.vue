<script setup lang="ts">
// Imports
import { RouterLink } from 'vue-router'
import IconSign from '@/components/icons/IconSign.vue'
import IconWallet from '@/components/icons/IconWallet.vue'
import IconHistory from '@/components/icons/IconHistory.vue'
import IconSettings from '@/components/icons/IconSettings.vue'

interface INav {
  icon: string
  name: string
  link: string
}

// List
const nav: INav[] = [
  {
    icon: IconSign,
    name: 'Sign',
    link: '/sign'
  },
  {
    icon: IconWallet,
    name: 'Import',
    link: '/import'
  },
  {
    icon: IconWallet,
    name: 'Wallets',
    link: '/'
  },
  {
    icon: IconHistory,
    name: 'History',
    link: '/history'
  },
  {
    icon: IconSettings,
    name: 'Settings',
    link: '/settings'
  }
]
</script>

<template>
  <nav class="nav">
    <ul class="nav__nav">
      <RouterLink v-for="item in nav" :key="item.name" class="nav__item" :to="item.link">
        <component :is="item.icon" />
        {{ item.name }}
      </RouterLink>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/app/nav.scss';
</style>

<style lang="scss" scoped>
.router-link-active {
  color: var(--label-primary);

  svg {
    color: var(--icon-blue);
  }
}
</style>
