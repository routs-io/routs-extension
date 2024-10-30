<script setup lang="ts">
import { ref } from 'vue'

import AppInput from '@/components/app/AppInput.vue'
import IconClose from '@/components/icons/IconClose.vue'

import { useAuthStore } from '@/stores/auth'

const { checkPassword } = useAuthStore()

const emit = defineEmits<{
  'on-close': [void]
}>()

// Password
const password = ref<string>('')
const isWrongPassword = ref<boolean>(false)

async function sendPassword() {
  if (!password.value) return
  isWrongPassword.value = !(await checkPassword(password.value))

  if (!isWrongPassword.value) emit('on-close')
}

// Close modal
function closeModal() {
  emit('on-close')
}
</script>

<template>
  <div class="modal" @mousedown.self="closeModal">
    <div class="modal__window">
      <div class="modal__head">
        <button class="modal__close" @click="closeModal">
          <IconClose />
        </button>

        <h2 class="modal__title">CSV Export</h2>
        <p class="modal__subtitle">Enter password to export selected wallets</p>
      </div>

      <div class="modal__body">
        <AppInput
          class="input--md"
          :class="{ 'input--error': isWrongPassword }"
          id="password"
          type="password"
          v-model="password"
          placeholder="Enter password"
          @keydown.enter="sendPassword"
        />

        <button class="button button--blue button--md" :disabled="!password" @click="sendPassword">
          Export
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/app/modal.scss';
</style>
