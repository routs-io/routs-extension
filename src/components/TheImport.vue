<script setup lang="ts">
import { ref, computed } from 'vue'
import IconX from '@/components/icons/IconX.vue'
import { useWalletsStore } from '@/stores/wallets'
import type { IStoredWallet } from '@/types/wallets';
import router from '@/router';

const { shortenAddress, parseWallets, saveWallets } = useWalletsStore()

const walletsInput = ref<string>('')
const formattedWallets = ref<string[]>([])
const wallets = ref<IStoredWallet[]>([])
const isListShown = ref<boolean>(false)
const failedIndexes = ref<number[]>([])

const placeholder = computed<string>(() => {
  return 'e.g.\nOxEeA6...9506Fc\nOxEeA6...9506Fc\nOxEeA6...9506Fc\nOxEeA6...9506Fc\nOxEeA6...9506Fc'
})

const buttonName = computed<string>(() => {
  return isListShown.value ? 'Continue' : 'Import'
})

const failedCount = computed<number>(() => {
  return walletsInput.value.split('\n').length - wallets.value.length
})

async function parsePrivateKeys() {
  formattedWallets.value = walletsInput.value
    .split('\n')
    .map((wallet) => wallet.trim())
    .filter((wallet) => wallet.length > 0)
    .filter((wallet) => /^(0x)?[0-9a-fA-F]{64}$/.test(wallet))

  failedIndexes.value = formattedWallets.value.map((wallet, i) => !/^(0x)?[0-9a-fA-F]{64}$/.test(wallet) ? i : null).filter(w => w !== null)

  wallets.value = await parseWallets(formattedWallets.value)
  if (wallets.value.length) isListShown.value = true
}

async function importWallets() {
  await saveWallets(wallets.value);
  isListShown.value = false;
  router.push({ name: 'home' })
}

function handleButton() {
  isListShown.value ? importWallets() : parsePrivateKeys()
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
        Recognized {{ wallets.length }} private keys,
        <span v-if="failedCount" style="color: var(--label-error)">{{ failedCount }} failed </span>
      </p>

      <div class="import__list">
        <div v-for="(wallet, i) in wallets" :key="i" class="import__wallet" :class="{ failed: failedIndexes.includes(i) }">
          <IconX class="import__logo" v-if="failedIndexes.includes(i)" />
          <img
            v-else
            class="import__logo"
            :src="`/src/assets/img/logo/${'eth'}.svg`"
            :alt="`${'eth'} icon`"
          />

          {{ shortenAddress(wallet.address) }}
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
