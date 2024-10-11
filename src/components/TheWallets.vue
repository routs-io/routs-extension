<script setup lang="ts">
// Imports
import { onMounted, toRefs } from 'vue'
import { useWalletsStore } from '@/stores/wallets'

const { wallets } = toRefs(useWalletsStore())
const { refreshWallets } = useWalletsStore()

onMounted(async () => {
  await refreshWallets()
})
</script>

<template>
  <div>Wallets</div>
  <div>
    <div class="wallet" v-for="(wallet, index) in wallets" :key="index">{{ wallet.slice(0, 8) + '...' + wallet.slice(-6) }}</div>  
  </div>
</template>

<style scoped>
.wallet {
  margin-bottom: 1rem;
}
</style>