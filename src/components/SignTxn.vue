<script setup lang="ts">
import { computed } from 'vue'

import type { IPathStep } from '@/types/sign'

import IconPen from '@/components/icons/IconPen.vue'
import IconArrowLong from '@/components/icons/IconArrowLong.vue'

import { useWalletsStore } from '@/stores/wallets'

const { shortenAddress } = useWalletsStore()

const props = defineProps<{
  txn: IPathStep
}>()

const formattedAllowance = computed(() => {
  const K = 1000n
  const M = K * K
  const B = M * K
  const T = B * K

  if (!props.txn.transaction.data) return 'Wrong amount'
  const num = BigInt('0x' + props.txn.transaction.data.slice(74))
  return num < T ? (num < B ? (num < M ? num.toString(10) : '>1M') : '>1B') : '>1T'
})

const formattedAmountIn = computed(() => {
  if (!props.txn.amount) return '0'
  return `${props.txn.amount}${props.txn.isExactAmount ? '' : '%'} ${props.txn.token ?? props.txn.tokenIn}`
})

const transactionText = computed(() => {
  if (props.txn.transaction.kind === 'approve') return `Allow to spend ${formattedAllowance.value}`
  switch (props.txn.type) {
    case 'swap':
      return `Swap ${formattedAmountIn.value}` + IconArrowLong + `${props.txn.tokenOut}`
    case 'bridge_token':
      return `Bridge ${formattedAmountIn.value}` + IconArrowLong + `${props.txn.networkTo}`
    case 'bridge_tokens':
      return `Bridge ${formattedAmountIn.value}` + IconArrowLong + `${props.txn.tokenOut} on ${props.txn.networkTo}`
    case 'mint':
      return `Mint ${props.txn.repeat} NFT`
    case 'dmail':
      return `Send message via Dmail`
    case 'lending':
      return `${props.txn.direction!.slice(0, 1).toUpperCase() + props.txn.direction!.slice(1)} ${formattedAmountIn.value}` + IconArrowLong + `${props.txn.token}`
    default:
      if(props.txn.service === 'fuelmigration') return `Deposit ${formattedAmountIn.value}` 
      return 'unknown'
  }
})
</script>

<template>
  <div class="txn">
    <div class="txn__box">
      <p class="txn__address">{{ shortenAddress(txn.transaction.from!.toString()) }}</p>

      <!-- div class="txn__tags" -->
      <!-- TODO: change tags -->
      <!-- <div v-for="(tag, i) in 3" :key="i" class="tag" :class="`tag--${tag}`">Scroll</div> -->
      <!-- </div> -->
    </div>

    <IconPen />

    <div class="txn__box">
      <p class="txn__operation">
        {{ transactionText }}
      </p>

      <p class="txn__services">
        {{ txn.service }} on {{ txn.network }}
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/app/tag.scss';
@import '@/assets/scss/main/txn.scss';
</style>
