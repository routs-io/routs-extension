<script setup lang="ts">
import { toRefs, ref, computed, onBeforeMount } from 'vue'
import type { IPasswordValidation } from '@/types/auth'

import AppInput from '@/components/app/AppInput.vue'
import { useAuthStore } from '@/stores/auth'

// Stores
const { checkIsRegistered, setPassword, checkPassword } = useAuthStore()
const { isRegistered } = toRefs(useAuthStore())

// Title
const setTitle = computed<string>(() => {
  return isRegistered.value ? 'Welcome back!' : 'Create password'
})

// Password
const password = ref<string>('')
const confirmPassword = ref<string>('')
const isWrongPassword = ref<boolean>(false)

const validation = ref<IPasswordValidation[]>([
  { id: 'amount', text: 'At least 8 characters', status: false },
  { id: 'digit', text: 'At least 1 digit', status: false },
  { id: 'case', text: 'Upper & lower case', status: false }
])

const isButtonEnabled = computed<boolean>(() => {
  return isRegistered.value
    ? !!password.value
    : validation.value.every((el) => el.status) && password.value === confirmPassword.value
})

function checkValidation() {
  validation.value[0].status = password.value.length >= 8
  validation.value[1].status = /\d/.test(password.value)
  validation.value[2].status = /[a-z]/.test(password.value) && /[A-Z]/.test(password.value)
}

async function handleEnter() {
  if (!password.value) return

  if (isRegistered.value) {
    isWrongPassword.value = !(await checkPassword(password.value))
  } else if (password.value === confirmPassword.value) {
    await setPassword(password.value)
  }
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

      <div class="auth__form">
        <AppInput
          class="input--lg"
          :class="{ 'input--error': isWrongPassword }"
          id="password"
          type="password"
          v-model="password"
          placeholder="Enter password"
          @keydown.enter="handleEnter"
          @on-input="checkValidation"
        />

        <AppInput
          v-if="!isRegistered"
          class="input--lg"
          :class="{ 'input--error': isWrongPassword }"
          id="confirmPassword"
          type="password"
          v-model="confirmPassword"
          placeholder="Confirm password"
          @keydown.enter="handleEnter"
          @on-input="checkValidation"
        />

        <ul v-if="!isRegistered" class="validation">
          <li v-for="item in validation" :key="item.text" :class="{ valid: item.status }">
            {{ item.text }}
          </li>
        </ul>
      </div>
    </div>

    <button
      class="button button--blue button--lg auth__btn"
      :disabled="!isButtonEnabled"
      @click="handleEnter"
    >
      Continue
    </button>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/main/validation.scss';
@use '@/assets/scss/main/auth.scss';
</style>
