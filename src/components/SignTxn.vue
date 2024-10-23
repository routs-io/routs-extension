<script setup lang="ts">
import { computed } from 'vue'
import { formatEther } from 'ethers'

import type { IPathStep } from '@/types/sign'

import IconPen from '@/components/icons/IconPen.vue'
import IconArrowLong from '@/components/icons/IconArrowLong.vue'

import { useWalletsStore } from '@/stores/wallets'

const { shortenAddress } = useWalletsStore()

const props = defineProps<{
  txn: IPathStep
}>()

const formattedAmount = computed(() => {
  if (!props.txn.transactions[0].value) return '0'
  return formatEther(props.txn.transactions[0].value)
})
</script>

<template>
  <div class="txn">
    <div class="txn__box">
      <p class="txn__address">{{ shortenAddress(txn.transactions[0].from!.toString()) }}</p>

      <div class="txn__tags">
        <!-- TODO: change tags -->
        <div v-for="(tag, i) in 3" :key="i" class="tag" :class="`tag--${tag}`">Scroll</div>
      </div>
    </div>

    <IconPen />

    <div class="txn__box">
      <p class="txn__operation">
        Swap
        {{ formattedAmount }} ETH
        <IconArrowLong />
        250 USDB
      </p>

      <p class="txn__services">{{ txn.service }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/app/tag.scss';
@import '@/assets/scss/main/txn.scss';
</style>
