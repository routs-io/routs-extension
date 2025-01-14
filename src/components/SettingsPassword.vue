<script setup lang="ts">
import { ref, computed } from 'vue'
import type { IPasswordValidation } from '@/types/auth'

import AppInput from '@/components/app/AppInput.vue'
import IconArrowShort from '@/components/icons/IconArrowShort.vue'

import { useAuthStore } from '@/stores/auth'

const { checkPassword, setPassword } = useAuthStore()

const emit = defineEmits<{
  'on-back': [void]
}>()

// Password
const oldPassword = ref<string>('')
const newPassword = ref<string>('')
const confirmPassword = ref<string>('')

const validation = ref<IPasswordValidation[]>([
  { id: 'amount', text: 'At least 8 characters', status: false },
  { id: 'digit', text: 'At least 1 digit', status: false },
  { id: 'case', text: 'Upper & lower case', status: false }
])

const isButtonEnabled = computed<boolean>(() => {
  return validation.value.every((el) => el.status) && newPassword.value === confirmPassword.value
})

function checkValidation() {
  validation.value[0].status = newPassword.value.length >= 8
  validation.value[1].status = /\d/.test(newPassword.value)
  validation.value[2].status = /[a-z]/.test(newPassword.value) && /[A-Z]/.test(newPassword.value)
}

async function changePassword() {
  const isCorrectPassword = await checkPassword(oldPassword.value)

  if (!isCorrectPassword) {
    alert('Incorrect password')
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    alert('Passwords do not match')
    return
  }

  const isSuccess = await setPassword(newPassword.value)

  if (!isSuccess) {
    alert('Failed to change password')
    return
  }

  resetPasswords()
}

function goBack() {
  resetPasswords()
  emit('on-back')
}

function resetPasswords() {
  oldPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
}
</script>

<template>
  <div class="password">
    <button class="password__btn" @click="goBack">
      <IconArrowShort class="password__arrow" />
      Back
    </button>

    <div class="password__body">
      <AppInput
        v-model="oldPassword"
        class="input--lg"
        type="password"
        id="old-password"
        placeholder="Old password"
      />

      <AppInput
        v-model="newPassword"
        class="input--lg"
        type="password"
        id="new-password"
        placeholder="New password"
        @on-input="checkValidation"
      />

      <AppInput
        v-model="confirmPassword"
        class="input--lg"
        type="password"
        id="confirm-password"
        placeholder="Confirm password"
        @on-input="checkValidation"
      />

      <ul class="validation">
        <li v-for="item in validation" :key="item.text" :class="{ valid: item.status }">
          {{ item.text }}
        </li>
      </ul>
    </div>

    <button
      class="button button--md button--blue password__save"
      :disabled="!isButtonEnabled"
      @click="changePassword"
    >
      Save and quit
    </button>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/main/validation.scss';
@use '@/assets/scss/main/password.scss';
</style>
