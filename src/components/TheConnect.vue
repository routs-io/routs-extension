<script setup lang="ts">
import { toRefs, computed, onMounted } from 'vue'
import type { IWallet } from '@/types/wallets'

import WalletsItem from '@/components/WalletsItem.vue'
import { useWalletsStore } from '@/stores/wallets'
import router from '@/router';

const { wallets } = toRefs(useWalletsStore())
const { sendWalletsToPage, refreshWallets } = useWalletsStore()

// Computed
const disconnectedWallets = computed<IWallet[]>(() => {
  return wallets.value.filter(({ status, type }) => status === 'offline' && type === 'evm')
})

const isSomeChecked = computed<boolean>(() => {
  return wallets.value.some(({ checked }) => checked)
})

const buttonName = computed<string>(() => {
  return isSomeChecked.value ? 'Connect selected' : 'Connect all'
})

// Connection
async function cancel() {
  await sendWalletsToPage(false)
}

async function connect() {
  if (isSomeChecked.value) {
    await sendWalletsToPage(true)
  } else {
    // All
    wallets.value.filter(({ type }) => type === 'evm').forEach((wallet) => (wallet.checked = true))
    await sendWalletsToPage(true)
  }
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
        <WalletsItem
          v-for="(wallet, i) in disconnectedWallets"
          :key="i"
          class="wallet"
          :wallet
          has-checkbox
        />
      </div>
      <div class="wallets__list" v-else>
        All wallets connected to the Routs
      </div>
    </div>

    <div class="section__bottom">
      <div class="section__connection">
        <button class="button button--md button--outline" @click="cancel">Cancel</button>
        <button class="button button--md button--blue" @click="connect">{{ buttonName }}</button>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/main/wallets.scss';
@import '@/assets/scss/main/section.scss';
</style>
