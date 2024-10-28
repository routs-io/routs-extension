<script setup lang="ts">
import { computed } from 'vue'
import type { IWallet } from '@/types/wallets'

import AppCheckbox from '@/components/app/AppCheckbox.vue'

import { useWalletsStore } from '@/stores/wallets'

const { shortenAddress, handleConnection } = useWalletsStore()

const props = defineProps<{
  wallet: IWallet
  hasCheckbox?: boolean
}>()

console.log(props.wallet.type, props.wallet);

const buttonName = computed<string>(() => {
  return props.wallet.status === 'online' ? 'Disconnect' : 'Connect'
})

async function handleWalletConnection() {
  await handleConnection(props.wallet)
}
</script>

<template>
  <div class="wallet">
    <AppCheckbox v-if="hasCheckbox" :id="`checkbox-${wallet.address}`" v-model="wallet.checked" />

    <div class="wallet__head">
      <div class="wallet__address">
        <span v-if="!hasCheckbox" class="status" :class="`status--${wallet.status}`" />
        <p>{{ shortenAddress(wallet.address) }}</p>
      </div>

      <div v-if="wallet.tags.length" class="wallet__tags">
        <div v-for="tag in wallet.tags" :key="tag.id" class="tag" :class="`tag--${tag.color}`">
          {{ tag.name }}
        </div>
      </div>
    </div>

    <button
      v-if="wallet.type === 'evm'"
      class="button wallet__btn"
      :class="{ 'button--red': wallet.status === 'online' }"
      @click="handleWalletConnection"
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
