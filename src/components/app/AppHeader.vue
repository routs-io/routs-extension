<script setup lang="ts">
// Imports
import { RouterLink } from 'vue-router'

// List
const nav: { name: string; link: string }[] = [
  {
    name: 'Auth',
    link: '/'
  },
  {
    name: 'Import',
    link: '/import'
  },
  {
    name: 'Wallets',
    link: '/wallets'
  },
  {
    name: 'Sign',
    link: '/sign'
  },
  {
    name: 'Settings',
    link: '/settings'
  }
]
</script>

<template>
  <header class="header">
    <nav>
      <ul class="header__nav">
        <RouterLink v-for="item in nav" :key="item.name" class="header__item" :to="item.link">
          {{ item.name }}
        </RouterLink>
      </ul>
    </nav>
  </header>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/app/header.scss';
</style>
