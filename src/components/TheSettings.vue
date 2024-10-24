<script setup lang="ts">
import { ref, toRefs } from 'vue'

import AppCheckbox from '@/components/app/AppCheckbox.vue'
import IconArrowShort from '@/components/icons/IconArrowShort.vue'
import IconLocker from '@/components/icons/IconLocker.vue'
import SettingsPassword from '@/components/SettingsPassword.vue'
import { useAuthStore } from '@/stores/auth'

const { isLocked } = toRefs(useAuthStore())
const { updateIsLocked } = useAuthStore()
const isPasswordShown = ref<boolean>(false)

function showPassword() {
  isPasswordShown.value = !isPasswordShown.value
}

function closePassword() {
  isPasswordShown.value = false
}

function updateExtension() {
  console.log('updateExtension')
}

async function updateLock() {
  await updateIsLocked(!isLocked.value);
}
</script>

<template>
  <section class="section">
    <div class="section__head">
      <h1>Settings</h1>
    </div>

    <div v-if="!isPasswordShown" class="settings">
      <!-- Lock -->
      <div class="settings__row">
        <p class="settings__text">Lock extension</p>
        <IconLocker class="settings__icon" />
        <AppCheckbox class="checkbox--switcher" id="lock-extension" @on-change="updateLock" />
      </div>

      <!-- Password -->
      <div class="settings__row settings__row--password" @click="showPassword">
        <p class="settings__text">Change password</p>
        <IconArrowShort class="settings__icon" width="1rem" height="1rem" />
      </div>

      <!-- Update -->
      <div class="settings__row">
        <p class="settings__text">
          Routs version: {{ '1.23' }}
          <span v-if="true">Update available</span>
        </p>

        <button v-if="true" class="button button--blue settings__btn" @click="updateExtension">
          Update
        </button>
      </div>
    </div>

    <SettingsPassword v-else @on-back="closePassword" />
  </section>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/main/settings.scss';
@import '@/assets/scss/main/section.scss';
</style>
