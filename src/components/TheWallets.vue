<script setup lang="ts">
// Imports
import { onMounted, toRefs, computed } from 'vue'
import router from '@/router'

//import type { IWallet } from '@/types/wallets.ts'

import WalletsItem from '@/components/WalletsItem.vue'
import IconAdd from '@/components/icons/IconAdd.vue'

import { useWalletsStore } from '@/stores/wallets'

const { wallets } = toRefs(useWalletsStore())
const { refreshWallets, sendWalletsToPage } = useWalletsStore()

const total = computed<string>(() => {
  const connected = wallets.value.filter((el) => el.status === 'online').length
  return `${wallets.value.length} total, ${connected} connected`
})

const isSomeWalletOffline = computed<boolean>(() => {
  return wallets.value.some((el) => el.status === 'offline')
})

const buttonName = computed<string>(() => {
  return isSomeWalletOffline.value ? 'Connect all' : 'Disconnect all'
})

function handleConnections() {
  if (isSomeWalletOffline.value) {
    sendWalletsToPage()
  } else {
    console.log('Disconnect all')
  }
}

onMounted(async () => await refreshWallets(Number(router.currentRoute.value.query.id)))
</script>

<template>
  <section class="section">
    <div class="section__head">
      <h1>Wallets</h1>

      <button class="btn-icon">
        <IconAdd />
      </button>
    </div>

    <div class="section__body wallets">
      <div class="wallets__head">
        <p>{{ total }}</p>

        <button
          class="wallets__btn"
          :class="{ red: !isSomeWalletOffline }"
          @click="handleConnections"
        >
          {{ buttonName }}
        </button>
      </div>

      <!-- v-if="wallets.length" -->
      <template v-if="true">
        <!-- <WalletsItem
          class="wallet"
          v-for="(wallet, i) in wallets"
          :key="i"
          :wallet
        /> -->
        <WalletsItem v-for="(wallet, i) in wallets" :key="i" :wallet class="wallet" />
      </template>

      <h2 v-else>No wallets yet</h2>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/app/btn-icon.scss';
@import '@/assets/scss/main/wallets.scss';
@import '@/assets/scss/main/section.scss';
</style>
