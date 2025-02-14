<script setup lang="ts">
import { computed } from 'vue'

interface IPlug {
  img: string
  title: string
  text: string
}

const props = defineProps<{ isEmpty?: boolean }>()

const plug = computed<IPlug>(() => {
  return props.isEmpty
    ? {
        img: 'wallet',
        title: 'No wallets',
        text: 'You haven’t add any wallets yet'
      }
    : {
        img: 'checked-wallet',
        title: 'All wallets are connected',
        text: 'New wallets will be added and connected automatically'
      }
})
</script>

<template>
  <div class="plug">
    <img v-if="isEmpty" class="plug__img" src="@/assets/img/wallet.svg" alt="wallet" />
    <img v-else class="plug__img" src="@/assets/img/checked-wallet.svg" alt="wallet" />

    <h2 class="plug__title">{{ plug.title }}</h2>
    <p class="plug__text">{{ plug.text }}</p>

    <div class="plug__buttons">
      <RouterLink class="button button--blue button--md" to="/import">
        Import Private Keys
      </RouterLink>
      <RouterLink class="button button--outline button--md" to="/generate">
        Generate new wallets
      </RouterLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/main/plug.scss';
</style>
