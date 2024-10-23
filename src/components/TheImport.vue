<script setup lang="ts">
// Imports
import { ref, computed } from 'vue'
import { useWalletsStore } from '@/stores/wallets'

const { saveWallets } = useWalletsStore()

const walletsInput = ref<string>('')

const placeholder = computed<string>(() => {
  return 'e.g.\nOxEeA6...9506Fc\nOxEeA6...9506Fc\nOxEeA6...9506Fc\nOxEeA6...9506Fc\nOxEeA6...9506Fc'
})

async function parseWallets() {
  const wallets = walletsInput.value
    .split('\n')
    .map((wallet) => wallet.trim())
    .filter((wallet) => wallet.length > 0)
    .filter((wallet) => /^(0x)?[0-9a-fA-F]{64}$/.test(wallet))
  walletsInput.value = wallets.join('\n')

  await saveWallets(wallets)
}
</script>

<template>
  <section class="section">
    <div class="section__head">
      <h1>Import</h1>
    </div>

    <div class="import">
      <label for="wallets">Enter your private keys below:</label>
      <textarea v-model="walletsInput" id="wallets" :placeholder />

      <button class="button button--blue button--md" @click="parseWallets">Continue</button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/main/import.scss';
@import '@/assets/scss/main/section.scss';
</style>
