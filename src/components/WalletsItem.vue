<script setup lang="ts">
import { computed } from 'vue'
import type { IWallet } from '@/logic/wallet/types'

import IconEvm from '@/components/icons/IconEvm.vue'
import IconFuel from '@/components/icons/IconFuel.vue'
import IconSolana from '@/components/icons/IconSolana.vue'
import AppCheckbox from '@/components/app/AppCheckbox.vue'

import { useWalletsStore } from '@/stores/wallets'
import Wallet from '@/logic/wallet/Wallet'

const { shortenAddress, handleConnection } = useWalletsStore()

const props = defineProps<{
  wallet: IWallet
}>()

const buttonName = computed<string>(() => {
  return props.wallet.status === 'online' ? 'Disconnect' : 'Connect'
})

async function handleWalletConnection() {
  await handleConnection(props.wallet)
}
</script>

<template>
  <div class="wallet">
    <AppCheckbox :id="`checkbox-${wallet.address}`" v-model="wallet.checked" />

    <div class="wallet__head">
      <div class="wallet__address">
        <IconEvm v-if="wallet.type === 'evm'" class="wallet__icon" />
        <IconFuel v-else-if="wallet.type === 'fuel'" class="wallet__icon" />
        <IconSolana v-else-if="wallet.type === 'sol'" class="wallet__icon" />

        <p>{{ shortenAddress(wallet.address) }}</p>
      </div>

      <div v-if="wallet.tags.length" class="wallet__tags">
        <div v-for="tag in wallet.tags" :key="tag.id" class="tag" :class="`tag--${tag.color}`">
          {{ tag.name }}
        </div>
      </div>
    </div>

    <button
      v-if="Wallet.AVAILABLE_SIGNER_TYPES.includes(wallet.type)"
      class="button wallet__btn"
      :class="{ 'button--red': wallet.status === 'online' }"
      @click="handleWalletConnection"
    >
      {{ buttonName }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/app/tag.scss';
@import '@/assets/scss/main/wallet.scss';
</style>
