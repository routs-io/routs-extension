<script setup lang="ts">
// Imports
import { RouterLink } from 'vue-router'
import IconWallet from '@/components/icons/IconWallet.vue'
import IconHistory from '@/components/icons/IconHistory.vue'
import IconSettings from '@/components/icons/IconSettings.vue'

interface INav {
  icon: string
  name: string
  link: string
  disabled?: boolean
}

// List
const nav: INav[] = [
  {
    icon: IconWallet,
    name: 'Wallets',
    link: '/wallets'
  },
  {
    icon: IconHistory,
    name: 'History',
    link: '/history',
    disabled: true
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
    <ul class="nav__list">
      <RouterLink
        v-for="item in nav"
        :key="item.name"
        :style="item.disabled ? { 'pointer-events': 'none', opacity: 0.3 } : {}"
        class="nav__item"
        :to="item.link"
      >
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
