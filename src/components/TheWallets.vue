<script setup lang="ts">
// Imports
import { onMounted, toRefs } from 'vue'
import { useWalletsStore } from '@/stores/wallets'
import WalletItem from '@/components/wallet/WalletItem.vue'
import AppButton from './app/AppButton.vue'
import router from '@/router';

const { wallets } = toRefs(useWalletsStore())
const { refreshWallets, sendWalletsToPage } = useWalletsStore()

onMounted(async () => {
  console.log(router.currentRoute.value.query);
  await refreshWallets(Number(router.currentRoute.value.query.id));
})
</script>

<template>
  <div>Wallets</div>
  <div>
    <WalletItem class="wallet" v-for="(wallet, index) in wallets" :key="index" :wallet="wallet" />
  </div>
  <AppButton @click="sendWalletsToPage" :text="'Connect'" />
</template>

<style scoped>
.wallet {
  margin-bottom: 1rem;
}
</style>
