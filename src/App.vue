<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onBeforeMount, toRefs } from 'vue'

import AppNavigation from '@/components/app/AppNavigation.vue'
import TheAuth from '@/components/TheAuth.vue'

import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const { isLocked, isExternalRequest } = toRefs(useAuthStore())
const { checkIsLocked } = useAuthStore()

onBeforeMount(async () => {
  await checkIsLocked()
  router.push({ name: 'home' })
})
</script>

<template>
  <div v-if="!false" class="container">
    <RouterView />
    <AppNavigation v-if="!isExternalRequest" />
  </div>
  <TheAuth class="container" v-else />
</template>

<style lang="scss" scoped>
@import '@/assets/scss/app/container.scss';
</style>
