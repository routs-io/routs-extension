<script setup lang="ts">
import { toRefs } from 'vue'
import { useToasterStore } from '@/stores/toaster'

const { toaster } = toRefs(useToasterStore())
</script>

<template>
  <div class="toaster" :class="`toaster--${toaster?.color}`">
    <p>{{ toaster?.text }}</p>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/app/toaster.scss';
</style>
