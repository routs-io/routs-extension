<script setup lang="ts">
// Imports
import { onBeforeMount, ref, toRefs } from 'vue'
import AppInput from '@/components/app/AppInput.vue'
import { useAuthStore } from '@/stores/auth'
import AppButton from './app/AppButton.vue'

const { checkIsRegistered, setPassword, checkPassword, logout } = useAuthStore()
const { isRegistered, isLogged } = toRefs(useAuthStore())
// Password
const password = ref<string>('')
const isWrongPassword = ref<boolean>(false)

async function login() {
  isWrongPassword.value = !(await checkPassword(password.value))
}

async function register() {
  await setPassword(password.value)
}

onBeforeMount(async () => {
  await checkIsRegistered()
})
</script>

<template>
  <div class="auth">
    <div class="auth__img">
      <img src="@/assets/img/logo.svg" alt="logo" />
    </div>

    <h1 v-if="isRegistered" class="auth__title">Welcome back!</h1>
    <h1 v-else-if="isLogged" class="auth__title">Logged In</h1>
    <h1 v-else class="auth__title">Set password</h1>

    <AppInput
      v-if="!isLogged"
      :style="{ color: isWrongPassword ? 'red' : '' }"
      id="password"
      v-model="password"
      label="Password"
      placeholder="Enter password"
      @keydown.enter="isRegistered ? login() : register()"
    />
    <AppButton v-else class="auth__button" text="Log Out" @click="logout"></AppButton>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/main/auth.scss';
</style>
