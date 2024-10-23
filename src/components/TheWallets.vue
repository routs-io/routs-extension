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

      <RouterLink v-if="wallets.length" class="btn-icon" to="/import">
        <IconAdd />
      </RouterLink>
    </div>

    <div class="wallets">
      <template v-if="wallets.length">
        <div class="wallets__head">
          <p>{{ total }}</p>

          <button
            class="button button--xs blue"
            :class="{ red: !isSomeWalletOffline }"
            @click="handleConnections"
          >
            {{ buttonName }}
          </button>
        </div>

        <div class="wallets__list" :class="{ padding: wallets.length > 5 }">
          <WalletsItem class="wallet" v-for="(wallet, i) in wallets" :key="i" :wallet />
        </div>
      </template>

      <!-- Empty -->
      <div v-else class="wallets__plug">
        <img class="wallets__img" src="@/assets/img/wallet.svg" alt="wallet" />
        <h2 class="wallets__title">No wallets</h2>
        <p class="wallets__text">You haven’t add any wallets yet.</p>

        <RouterLink class="button button--blue button--md" to="/import">Add</RouterLink>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/app/btn-icon.scss';
@import '@/assets/scss/main/wallets.scss';
@import '@/assets/scss/main/section.scss';
</style>
