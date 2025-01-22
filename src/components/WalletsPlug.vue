<template>
  <div class="plug">
    <img class="plug__img" src="@/assets/img/wallet.svg" alt="wallet" />
    <h2 class="plug__title">No wallets</h2>
    <p class="plug__text">You haven’t add any wallets yet.</p>

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

<script setup lang="ts"></script>

<style lang="scss" scoped>
@use '@/assets/scss/main/plug.scss';
</style>
