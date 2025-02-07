<script setup lang="ts">
import { onBeforeMount, toRefs, computed } from 'vue'
import { RouterView } from 'vue-router'
import router from '@/router'

// Components
import TheAuth from '@/components/TheAuth.vue'
import AppNavigation from '@/components/app/AppNavigation.vue'
import AppToaster from '@/components/app/AppToaster.vue'

// Stores
import { useAuthStore } from '@/stores/auth'
import { useToasterStore } from '@/stores/toaster'

const { checkIsLocked } = useAuthStore()
const { isLocked, isExternalRequest } = toRefs(useAuthStore())
const { toaster } = toRefs(useToasterStore())

// Computed
const isNavigation = computed<boolean>(() => {
  return !isExternalRequest.value && router.currentRoute.value.fullPath !== '/'
})

// Check authorization
onBeforeMount(async () => {
  await checkIsLocked()
  router.push({ name: 'home' })
})
</script>

<template>
  <template v-if="isLocked !== null">
    <div v-if="!isLocked" class="container">
      <RouterView />
      <AppNavigation v-if="isNavigation" />
    </div>

    <TheAuth class="container" v-else />

    <Transition name="toaster">
      <AppToaster v-if="toaster" />
    </Transition>
  </template>

  <TheScreen v-else />
</template>

<style lang="scss" scoped>
@use '@/assets/scss/app/container.scss';
</style>
