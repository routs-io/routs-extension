<script setup lang="ts">
import { computed } from 'vue'
import type { IWallet } from '@/types/wallets'

import { useWalletsStore } from '@/stores/wallets'

const { shortenAddress } = useWalletsStore()

const props = defineProps<{
  wallet: IWallet
}>()

const buttonName = computed<string>(() => {
  return props.wallet.status === 'online' ? 'Disconnect' : 'Connect'
})

function handleConnection() {
  if (props.wallet.status === 'online') {
    console.log('disconnect')
  } else {
    console.log('connect')
  }
}
</script>

<template>
  <div class="wallet">
    <div class="wallet__head">
      <div class="wallet__address">
        <span class="status" :class="`status--${wallet.status}`" />
        <p>{{ shortenAddress(wallet.address) }}</p>
      </div>

      <div v-if="wallet.tags.length" class="wallet__tags">
        <div v-for="tag in wallet.tags" :key="tag.id" class="tag" :class="`tag--${tag.color}`">
          {{ tag.name }}
        </div>
      </div>
    </div>

    <button
      class="button wallet__btn"
      :class="{ 'button--red': wallet.status === 'online' }"
      @click="handleConnection"
    >
      {{ buttonName }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/app/status.scss';
@import '@/assets/scss/app/tag.scss';
@import '@/assets/scss/main/wallet.scss';
</style>
