<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './components/app/AppHeader.vue'
</script>

<template>
  <div class="container">
    <AppHeader />

    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/app/container.scss';
</style>
