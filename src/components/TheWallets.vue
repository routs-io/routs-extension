<script setup lang="ts">
// Imports
import { onMounted, toRefs, computed } from 'vue'
import router from '@/router'

import type { IWallet } from '@/types/wallets.ts'

import WalletsItem from '@/components/WalletsItem.vue'
import IconAdd from '@/components/icons/IconAdd.vue'

import { useWalletsStore } from '@/stores/wallets'

const { wallets } = toRefs(useWalletsStore())
const { refreshWallets, sendWalletsToPage } = useWalletsStore()

// TODO: delete later
const tempList: IWallet[] = [
  {
    address: '0x99dfe571bad692bad7a3a549a15d2c94acd864f1',
    tags: [
      {
        id: 24,
        name: 'solana',
        color: 'red'
      },
      {
        id: 52,
        name: '1122',
        color: 'orange'
      }
    ],
    status: 'offline'
  },
  {
    address: '0xe6158a8fec9257a00b0ee3fff10555172744ddd9',
    tags: [
      {
        id: 86,
        name: 'Routs extention',
        color: 'blue'
      },
      {
        id: 48,
        name: 'some tag',
        color: 'purple'
      },
      {
        id: 24,
        name: 'solana',
        color: 'red'
      },
      {
        id: 52,
        name: '1122',
        color: 'orange'
      }
    ],
    status: 'online'
  },
  {
    address: '0x99dfe571bad692bad7a3a549a15d2c94acd864f1',
    tags: [],
    status: 'offline'
  },
  {
    address: '0xe6158a8fec9257a00b0ee3fff10555172744ddd9',
    tags: [
      {
        id: 48,
        name: 'some tag',
        color: 'purple'
      }
    ],
    status: 'online'
  },
  {
    address: '0x99dfe571bad692bad7a3a549a15d2c94acd864f1',
    tags: [],
    status: 'offline'
  },
  {
    address: '0xe6158a8fec9257a00b0ee3fff10555172744ddd9',
    tags: [],
    status: 'online'
  },
  {
    address: '0x99dfe571bad692bad7a3a549a15d2c94acd864f1',
    tags: [],
    status: 'offline'
  },
  {
    address: '0xe6158a8fec9257a00b0ee3fff10555172744ddd9',
    tags: [],
    status: 'online'
  }
]

const total = computed<string>(() => {
  const connected = tempList.filter((el) => el.status === 'online').length
  return `${tempList.length} total, ${connected} connected`
})

const isSomeWalletOffline = computed<boolean>(() => {
  return tempList.some((el) => el.status === 'offline')
})

const buttonName = computed<string>(() => {
  return isSomeWalletOffline.value ? 'Connect all' : 'Disonnect all'
})

function handleConnections() {
  if (isSomeWalletOffline.value) {
    sendWalletsToPage()
  } else {
    console.log('Disconnect all')
  }
}

onMounted(() => refreshWallets(Number(router.currentRoute.value.query.id)))
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
        <WalletsItem v-for="(wallet, i) in tempList" :key="i" :wallet class="wallet" />
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
