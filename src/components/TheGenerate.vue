<script setup lang="ts">
// Imports
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { IGeneratedWallet, WalletType } from '@/types/wallets'
import { useWalletsStore } from '@/stores/wallets'
const { generateWallets, saveWallets } = useWalletsStore()

import AppCounter from '@/components/app/AppCounter.vue'
import IconEvm from '@/components/icons/IconEvm.vue'
import IconSolana from '@/components/icons/IconSolana.vue'
import IconFuel from '@/components/icons/IconFuel.vue'
import router from '@/router'

// Data
const generators = ref<IGeneratedWallet[]>([
  {
    icon: IconEvm,
    name: 'evm',
    amount: 0
  },
  {
    icon: IconSolana,
    name: 'sol',
    amount: 0
  },
  {
    icon: IconFuel,
    name: 'fuel',
    amount: 0
  }
])

// Computed
const isGenerateDisabled = computed<boolean>(() => {
  return !generators.value.some(({ amount }) => amount)
})

// Generate
async function generate() {
  if (isGenerateDisabled.value) return

  const newWallets = await generateWallets(
    generators.value.map(({ name, amount }) => ({
      type: name as WalletType,
      count: amount
    }))
  )

  console.log('newWallets', newWallets)

  await saveWallets(newWallets)
  router.push({ name: 'wallets' })
}
</script>

<template>
  <section class="section">
    <div class="section__head">
      <h1>Generate Wallets</h1>
    </div>

    <div class="wallets">
      <div class="wallets__head">
        <p>Choose amount of wallets:</p>
      </div>

      <div class="wallets__list">
        <div v-for="(item, i) in generators" :key="i" class="generator">
          <component :is="item.icon" class="generator__icon" />
          <p class="generator__name">{{ item.name }} wallets</p>

          <AppCounter class="generator__counter" :id="item.name" v-model="item.amount" />
        </div>
      </div>
    </div>

    <div class="section__bottom">
      <div class="section__connection">
        <RouterLink class="button button--md button--outline" to="/wallets"> Cancel </RouterLink>

        <button
          class="button button--md button--blue"
          :disabled="isGenerateDisabled"
          @click="generate"
        >
          Generate
        </button>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/app/btn-icon.scss';
@import '@/assets/scss/main/plug.scss';
@import '@/assets/scss/main/generator.scss';
@import '@/assets/scss/main/wallets.scss';
@import '@/assets/scss/main/section.scss';
</style>
