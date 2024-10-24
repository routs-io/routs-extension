<script setup lang="ts">
// Imports
import { toRefs, ref, computed, onBeforeMount } from 'vue'
import AppInput from './app/AppInput.vue'
import { useAuthStore } from '@/stores/auth'

// Stores
const { checkIsRegistered, setPassword, checkPassword } = useAuthStore()
const { isRegistered } = toRefs(useAuthStore())

// Title
const setTitle = computed<string>(() => {
  return isRegistered.value ? 'Welcome back!' : 'Set password'
})

// Password
const password = ref<string>('')
const isWrongPassword = ref<boolean>(false)

async function handleEnter() {
  if (!password.value) return

  isRegistered.value
    ? (isWrongPassword.value = !(await checkPassword(password.value)))
    : await setPassword(password.value)
}

onBeforeMount(async () => await checkIsRegistered())
</script>

<template>
  <div class="auth">
    <div class="auth__body">
      <div class="auth__img">
        <img src="@/assets/img/logo.svg" alt="logo" />
      </div>

      <h1 class="auth__title">{{ setTitle }}</h1>

      <AppInput
        class="input--lg"
        :class="{ 'input--error': isWrongPassword }"
        id="password"
        type="password"
        v-model="password"
        placeholder="Enter password"
        @keydown.enter="handleEnter"
      />
    </div>

    <button
      class="button button--blue button--lg auth__btn"
      :disabled="!password"
      @click="handleEnter"
    >
      Continue
    </button>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/main/auth.scss';
</style>
