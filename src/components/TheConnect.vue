<script setup lang="ts">
import { toRefs, computed, onMounted } from 'vue'
import type Wallet from '@/logic/wallet/Wallet'

import WalletsItem from '@/components/WalletsItem.vue'
import { useWalletsStore } from '@/stores/wallets'
import router from '@/router'

const { wallets } = toRefs(useWalletsStore())
const { sendWalletsToPage, refreshWallets } = useWalletsStore()

// Computed
const disconnectedWallets = computed<Wallet[]>(() => {
  return wallets.value.filter((wallet) => wallet.status === 'offline' && wallet.type === 'evm') as Wallet[]
})

const isSomeChecked = computed<boolean>(() => {
  return wallets.value.some(({ checked }) => checked)
})

const buttonName = computed<string>(() => {
  return isSomeChecked.value ? 'Connect selected' : 'Connect all'
})

// Connection
async function connect() {
  if (!isSomeChecked.value) {
    wallets.value.forEach((wallet) => {
      if (wallet.type === 'evm') wallet.checked = true
    })
  }

  await sendWalletsToPage(true)
}

// Close
function closeWindow() {
  // Close window logic
}

onMounted(async () => {
  wallets.value.forEach((wallet) => (wallet.checked = true))
  await refreshWallets(Number(router.currentRoute.value.query.id))
})
</script>

<template>
  <section class="section">
    <div class="section__head">
      <h1>Add wallets</h1>
    </div>

    <div class="wallets">
      <div class="wallets__list" v-if="disconnectedWallets.length">
        <WalletsItem v-for="(wallet, i) in disconnectedWallets" :key="i" class="wallet" :wallet />
      </div>

      <div v-else class="plug">
        <img class="plug__img" src="@/assets/img/checked-wallet.svg" alt="wallet" />
        <h2 class="plug__title">All Wallets Are Connected</h2>
        <p class="plug__text">You ‘ve connected all your wallets.</p>

        <button class="button button--blue button--md" @click="closeWindow">Close</button>
      </div>
    </div>

    <div v-if="disconnectedWallets.length" class="section__bottom">
      <div class="section__connection">
        <button class="button button--md button--outline" @click="sendWalletsToPage(false)">
          Cancel
        </button>
        <button class="button button--md button--blue" @click="connect">{{ buttonName }}</button>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/main/plug.scss';
@import '@/assets/scss/main/wallets.scss';
@import '@/assets/scss/main/section.scss';
</style>
