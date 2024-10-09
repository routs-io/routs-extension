<script setup lang="ts">
// Imports
import { ref } from 'vue'
import AppInput from '@/components/app/AppInput.vue'

// Password
const password = ref<string>('')
</script>

<template>
  <div class="auth">
    <div class="auth__img">
      <img src="@/assets/img/logo.svg" alt="logo" />
    </div>

    <h1 class="auth__title">Welcome back!</h1>

    <AppInput
      type="password"
      id="password"
      v-model="password"
      label="Password"
      placeholder="Enter password"
    />
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/main/auth.scss';
</style>
