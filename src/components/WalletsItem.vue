<script setup lang="ts">
import { computed } from 'vue'
import type { IWallet } from '@/types/wallets'

const props = defineProps<{
  wallet: IWallet
}>()

const shortAddress = computed<string>(() => {
  return `${props.wallet.address.substring(0, 8)}...${props.wallet.address.substring(props.wallet.address.length - 6)}`
})

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
        <p>{{ shortAddress }}</p>
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
