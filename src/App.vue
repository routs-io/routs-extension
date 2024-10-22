<script setup lang="ts">
import { RouterView } from 'vue-router'
import { toRefs } from 'vue'

import AppNavigation from './components/app/AppNavigation.vue'
import TheAuth from './components/TheAuth.vue'

import { useAuthStore } from './stores/auth'

const { isLogged } = toRefs(useAuthStore())
</script>

<template>
  <div class="container">
    <!-- <RouterView v-if="isLogged" /> -->
    <!-- <TheAuth v-else /> -->

    <!-- TODO: delete when finished -->
    <!-- <AppNavigation v-if="isLogged" /> -->

    <RouterView />
    <AppNavigation />
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/app/container.scss';
</style>
