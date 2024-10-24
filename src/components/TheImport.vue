<script setup lang="ts">
// Imports
import { ref, computed } from 'vue'
import IconX from '@/components/icons/IconX.vue'
import { useWalletsStore } from '@/stores/wallets'

const { shortenAddress, saveWallets } = useWalletsStore()

const walletsInput = ref<string>('')
const isListShown = ref<boolean>(true)

const placeholder = computed<string>(() => {
  return 'e.g.\nOxEeA6...9506Fc\nOxEeA6...9506Fc\nOxEeA6...9506Fc\nOxEeA6...9506Fc\nOxEeA6...9506Fc'
})

const buttonName = computed<string>(() => {
  return isListShown.value ? 'Continue' : 'Import'
})

async function parseWallets() {
  const wallets = walletsInput.value
    .split('\n')
    .map((wallet) => wallet.trim())
    .filter((wallet) => wallet.length > 0)
    .filter((wallet) => /^(0x)?[0-9a-fA-F]{64}$/.test(wallet))
  walletsInput.value = wallets.join('\n')

  await saveWallets(wallets)

  // На респонзi змiни isListShown на true - це покаже наступний екран
  // const response = await saveWallets(wallets)
  // if (response) isListShown.value = true
}

function importWallets() {
  console.log('importWallets')
}

function handleButton() {
  isListShown.value ? importWallets() : parseWallets()
}
</script>

<template>
  <section class="section">
    <div class="section__head">
      <h1>Import</h1>
    </div>

    <!-- Parse -->
    <div v-if="!isListShown" class="import">
      <label for="wallets">Enter your private keys below:</label>
      <textarea v-model="walletsInput" id="wallets" :placeholder />
    </div>

    <!-- Import -->
    <div v-else class="import">
      <p>
        Recognized {{ '12' }} private keys,
        <span v-if="true" style="color: var(--label-error)">{{ '3' }} failed </span>
      </p>

      <div class="import__list">
        <div v-for="(wallet, i) in 12" :key="i" class="import__wallet" :class="{ failed: i === 3 }">
          <IconX class="import__logo" v-if="i === 3" />
          <img
            v-else
            class="import__logo"
            :src="`/src/assets/img/logo/${'eth'}.svg`"
            :alt="`${'eth'} icon`"
          />

          {{ shortenAddress('0x2da10a1e27bf85cedd8ffb1abbe97e53391c0295') }}
        </div>
      </div>
    </div>

    <div class="section__bottom">
      <button class="button button--blue button--md" @click="handleButton">{{ buttonName }}</button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/main/import.scss';
@import '@/assets/scss/main/section.scss';
</style>
