<script setup lang="ts">
import { ref, computed, onMounted, toRefs } from 'vue'
import router from '@/router'

import type { IStoredWallet } from '@/types/wallets'

import IconX from '@/components/icons/IconX.vue'
import { useWalletsStore } from '@/stores/wallets'

const { shortenAddress, parseWallets, saveWallets, generateFuelWalletsFromEvm, detectPrivateKeyType } = useWalletsStore()
const { requestId } = toRefs(useWalletsStore())

const walletsInput = ref<string>('')
const formattedWallets = ref<string[]>([])
const wallets = ref<IStoredWallet[]>([])
const isListShown = ref<boolean>(false)
const failedIndexes = ref<number[]>([])

const placeholder = computed<string>(() => {
  return 'e.g.\nOxEeA6...9506Fc\nOxEeA6...9506Fc\nOxEeA6...9506Fc\nOxEeA6...9506Fc\nOxEeA6...9506Fc'
})

const buttonName = computed<string>(() => {
  return isListShown.value ? 'Continue' : 'Import'
})

const failedCount = computed<number>(() => {
  return requestId.value === 0 ? walletsInput.value.split('\n').length - wallets.value.length : 0
})

async function parsePrivateKeys() {
  formattedWallets.value = Array.from(
    new Set(
      walletsInput.value
        .split('\n')
        .map((wallet) => wallet.trim())
        .filter((wallet) => wallet.length > 0)
        .filter((wallet) => detectPrivateKeyType(wallet) !== 'unknown')
    )
  )

  failedIndexes.value = walletsInput.value
    .split('\n')
    .map((wallet) => wallet.trim())
    .map((wallet, i) => (formattedWallets.value.includes(wallet) ? null : i))
    .filter((w) => w !== null)

  wallets.value = await parseWallets(formattedWallets.value)
  wallets.value.forEach((wallet, i) => loadIcon(wallet.type, i))
  if (wallets.value.length) isListShown.value = true
}

async function importWallets() {
  await saveWallets(wallets.value)
  isListShown.value = false
  router.push({ name: 'home' })
}

function handleButton() {
  isListShown.value ? importWallets() : parsePrivateKeys()
}
const icons = ref<{ [key: number]: string }>({})

async function loadIcon(walletName: string, index: number) {
  try {
    const icon = (await import(`@/assets/img/logo/${walletName}.svg`)).default
    icons.value[index] = icon // Store icon URL by wallet index
  } catch (error) {
    console.error(`Failed to load icon for ${walletName}:`, error)
  }
}

onMounted(async () => {
  if (router.currentRoute.value.query.id) {
    requestId.value = Number(router.currentRoute.value.query.id)
    wallets.value = await generateFuelWalletsFromEvm(router.currentRoute.value.query.wallets as string[])
    if (!wallets.value.length) await saveWallets(wallets.value)
    wallets.value.forEach((wallet, i) => loadIcon(wallet.type, i))
    if (wallets.value.length) isListShown.value = true
  }
})
</script>

<template>
  <section class="section">
    <div class="section__head">
      <h1>Import</h1>
    </div>

    <!-- Parse -->
    <div v-if="!isListShown" class="import">
      <label for="wallets">Enter your private keys below:</label>
      <textarea v-model="walletsInput" id="wallets" :placeholder />
    </div>

    <!-- Import -->
    <div v-else class="import">
      <p>
        Recognized {{ wallets.length }} private keys,
        <span v-if="failedCount" style="color: var(--label-error)">{{ failedCount }} failed </span>
      </p>

      <div class="import__list">
        <div
          v-for="(wallet, i) in wallets"
          :key="i"
          class="import__wallet"
          :class="{ failed: failedIndexes.includes(i) }"
        >
          <IconX class="import__logo" v-if="failedIndexes.includes(i)" />
          <img v-else class="import__logo" :src="icons[i]" :alt="`${wallet.type} icon`" />

          {{ shortenAddress(wallet.address) }}
        </div>
      </div>
    </div>

    <div class="section__bottom">
      <button class="button button--blue button--md" @click="handleButton">{{ buttonName }}</button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/main/import.scss';
@import '@/assets/scss/main/section.scss';
</style>
