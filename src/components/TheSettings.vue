<script setup lang="ts">
import { ref } from 'vue'
import AppInput from '@/components/app/AppInput.vue'
import AppButton from '@/components/app/AppButton.vue'
import { useAuthStore } from '../stores/auth'
const { checkPassword, setPassword } = useAuthStore()

const oldPassword = ref<string>('')
const newPassword = ref<string>('')
const confirmPassword = ref<string>('')

async function changePassword() {
  const isCorrectPassword = await checkPassword(oldPassword.value, false)
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
  oldPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
}
</script>

<template>
  <h2>Settings</h2>
  <div>
    <h4 class="change-password">Change Password</h4>
    <AppInput
      id="old-password"
      class="change-input"
      v-model="oldPassword"
      label="Old Password"
      placeholder="Old Password"
      type="password"
    />
    <AppInput
      id="new-password"
      class="change-input"
      v-model="newPassword"
      label="New Password"
      placeholder="New Password"
      type="password"
    />
    <AppInput
      id="confirm-password"
      class="change-input"
      v-model="confirmPassword"
      label="Confirm Password"
      placeholder="Confirm Password"
      type="password"
    />
    <AppButton class="confirm-button" text="Confirm" @click="changePassword" />
  </div>
</template>

<style scoped>
.change-password {
  margin-bottom: 1rem;
}
.change-input {
  margin-bottom: 0.5rem;
}
.confirm-button {
  margin-top: 1rem;
  width: 100%;
  text-align: center;
  border: 1px solid;
}
</style>
