<script setup lang="ts">
// Imports
import { ref } from 'vue'
import { useWalletsStore } from '@/stores/wallets'
const { saveWallets } = useWalletsStore()

const walletsInput = ref<string>('')

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
  <div>Import wallets</div>
  <br />
  <textarea
    id="wallets"
    class="wallets-input"
    v-model="walletsInput"
    placeholder="Enter wallets one per line..."
  ></textarea>
  <br />

  <button class="button" @click="parseWallets">Add</button>
</template>

<style scoped>
.wallets-input {
  height: 60vh;
  width: 100%;
  border-width: 1px;
}
</style>
