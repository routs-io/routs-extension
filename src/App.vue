<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/app/AppHeader.vue'
import TheAuth from '@/components/TheAuth.vue'
import { useAuthStore } from '@/stores/auth'
import { toRefs } from 'vue';

const { isLogged } = toRefs(useAuthStore())

</script>

<template>
  <div class="container">
    <AppHeader />

    <RouterView v-if="isLogged" />
    <TheAuth v-else />
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/app/container.scss';
</style>
