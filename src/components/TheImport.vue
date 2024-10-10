<script setup lang="ts">
// Imports
import { ref } from 'vue'
import AppButton from './app/AppButton.vue'
// Password
const walletsInput = ref<string>('')

async function parseWallets() {
  console.log(walletsInput.value.split("\n"))
}
</script>

<template>
  <div>Import wallets</div>
  <br>
  <textarea
    id="wallets"
    class="wallets-input"
    v-model="walletsInput"
    placeholder="Enter wallets one per line..."
  ></textarea>
  <br>
  <AppButton text="Add" @click="parseWallets" />
</template>

<style scoped>
.wallets-input {
  height: 60vh;
  width: 100%;
  border-width: 1px;
}
</style>
