<script setup lang="ts">
// Imports
import { onMounted, toRefs, ref, computed } from 'vue'
import type { IWallet } from '@/logic/wallet/types'

import WalletsExport from '@/components/WalletsExport.vue'
import WalletsItem from '@/components/WalletsItem.vue'
import IconAdd from '@/components/icons/IconAdd.vue'
import IconFlash from '@/components/icons/IconFlash.vue'
import IconShare from '@/components/icons/IconShare.vue'
import IconDelete from '@/components/icons/IconDelete.vue'

import { useWalletsStore } from '@/stores/wallets'

const { wallets } = toRefs(useWalletsStore())
const { refreshWallets, connectAll, disconnectAll, exportToCSV } = useWalletsStore()

// Computed
const total = computed<string>(() => {
  const connected = wallets.value.filter((el) => el.status === 'online').length
  return `${wallets.value.length} total, ${connected} connected`
})

const isSomeWalletOffline = computed<boolean>(() => {
  return wallets.value.some((el) => el.status === 'offline')
})

const buttonConnectName = computed<string>(() => {
  return isSomeWalletOffline.value ? 'Connect all' : 'Disconnect all'
})

const checkedWallets = computed<IWallet[]>(() => {
  return wallets.value.filter((wallet) => wallet.checked)
})

const buttonExportName = computed<string>(() => {
  const amount = checkedWallets.value.length
  return `Export ${amount} wallet${amount > 1 ? 's' : ''}`
})

// Connect
async function handleConnections() {
  isSomeWalletOffline.value ? await connectAll() : await disconnectAll()
}

// Modal
const isModalOpen = ref<boolean>(false)

function openModal() {
  isModalOpen.value = !isModalOpen.value
}

async function closeModal() {
  isModalOpen.value = false
}

async function exportWallets() {
  isModalOpen.value = false
  await exportToCSV(checkedWallets.value)
}

// Delete
function onDelete() {
  console.log('onDelete')
}

onMounted(async () => await refreshWallets(0))
</script>

<template>
  <section class="section">
    <div class="section__head">
      <h1>Wallets</h1>

      <div class="section__buttons">
        <RouterLink v-if="wallets.length" class="btn-icon" to="/generate">
          <IconFlash />
        </RouterLink>
        <RouterLink v-if="wallets.length" class="btn-icon" to="/import">
          <IconAdd />
        </RouterLink>
      </div>
    </div>

    <div class="wallets">
      <template v-if="wallets.length">
        <div class="wallets__head">
          <p>{{ total }}</p>

          <button
            class="button button--xs blue"
            :class="{ red: !isSomeWalletOffline }"
            @click="handleConnections"
          >
            {{ buttonConnectName }}
          </button>
        </div>

        <div class="wallets__list">
          <WalletsItem class="wallet" v-for="(wallet, i) in wallets" :key="i" :wallet />
        </div>
      </template>

      <!-- Empty -->
      <div v-else class="plug">
        <img class="plug__img" src="@/assets/img/wallet.svg" alt="wallet" />
        <h2 class="plug__title">No wallets</h2>
        <p class="plug__text">You haven’t add any wallets yet.</p>

        <RouterLink class="button button--blue button--md" to="/import">Add</RouterLink>
      </div>
    </div>

    <div v-if="checkedWallets.length" class="section__bottom">
      <div class="section__connection section__connection--export">
        <button class="button button--md button--blue" @click="openModal">
          <IconShare />
          {{ buttonExportName }}
        </button>

        <button class="button button--md button--outline" @click="onDelete">
          <IconDelete color="var(--icon-error)" />
        </button>
      </div>
    </div>

    <!-- Modal: export wallets -->
    <Transition name="fade-down-medium">
      <WalletsExport v-if="isModalOpen" @on-close="closeModal" @on-success="exportWallets" />
    </Transition>
  </section>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/app/btn-icon.scss';
@import '@/assets/scss/main/plug.scss';
@import '@/assets/scss/main/wallets.scss';
@import '@/assets/scss/main/section.scss';

.fade-down-medium {
  &-enter-from {
    opacity: 0;
    transform: translateY(-0.5rem);
  }

  &-leave-to {
    opacity: 0;
    transform: translateY(0.5rem);
  }

  &-enter-active,
  &-leave-active {
    transition: var(--ease);
  }
}
</style>
