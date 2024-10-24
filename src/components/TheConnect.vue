<script setup lang="ts">
import { toRefs, computed, onMounted } from 'vue'
import type { IWallet } from '@/types/wallets'

import WalletsItem from '@/components/WalletsItem.vue'
import { useWalletsStore } from '@/stores/wallets'

const { wallets } = toRefs(useWalletsStore())

// Computed
const disconnectedWallets = computed<IWallet[]>(() => {
  return wallets.value.filter(({ status }) => status === 'offline')
})

const isSomeChecked = computed<boolean>(() => {
  return wallets.value.some(({ checked }) => checked)
})

const buttonName = computed<string>(() => {
  return isSomeChecked.value ? 'Connect selected' : 'Connect all'
})

// Connection
function cancel() {
  wallets.value.forEach((wallet) => (wallet.checked = false))
  console.log('cancel')
}

function connect() {
  if (isSomeChecked.value) {
    // Selected
    const selectedWallets = wallets.value.filter(({ checked }) => checked)
    console.log('connect selected', selectedWallets)
  } else {
    // All
    console.log('connect all', wallets.value)
  }
}

onMounted(() => {
  wallets.value.forEach((wallet) => (wallet.checked = true))
})
</script>

<template>
  <section class="section">
    <div class="section__head">
      <h1>Add wallets</h1>
    </div>

    <div class="wallets">
      <div class="wallets__list">
        <WalletsItem
          v-for="(wallet, i) in disconnectedWallets"
          :key="i"
          class="wallet"
          :wallet
          has-checkbox
        />
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
