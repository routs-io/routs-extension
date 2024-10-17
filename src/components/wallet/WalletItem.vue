<script setup lang="ts">
import AppCheckbox from '@/components//app/AppCheckbox.vue'
import { computed, toRefs } from 'vue'
import { useWalletsStore } from '@/stores/wallets'
const { checkedWallets } = toRefs(useWalletsStore())

const props = defineProps<{
  wallet: string
}>()

const isChecked = computed<boolean>(() => {
  return checkedWallets.value.some((wallet) => {
    return wallet.toLowerCase() === props.wallet.toLowerCase()
  })
})

// Add or remove a wallet address to/from the checkedWallets[]
function checkWallet() {
  isChecked.value
    ? (checkedWallets.value = checkedWallets.value.filter(
        (wallet) => wallet.toLowerCase() !== props.wallet.toLowerCase()
      ))
    : checkedWallets.value.push(props.wallet)
}
</script>

<template>
  <AppCheckbox :id="`check-${wallet}`" :model-value="isChecked" @on-change="checkWallet" />
  {{ wallet.slice(0, 8) + '...' + wallet.slice(-6) }}
</template>

<style scoped>
@import "@/assets/scss/wallet/wallet.scss";
</style>