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

const formattedAllowance = computed(() => {
  const K = 1000n
  const M = K * K
  const B = M * K
  const T = B * K

  if (!props.txn.transaction.data) return 'Wrong amount'
  const num = BigInt('0x' + props.txn.transaction.data.slice(74))
  return num < T ? (num < B ? (num < M ? num.toString(10) : '>1M') : '>1B') : '>1T'
})

const formattedAmount = computed(() => {
  if (!props.txn.transaction.value) return '0'
  return formatEther(props.txn.transaction.value)
})

const transactionType = computed(() => {
  if (props.txn.transaction.kind === 'approve') return 'Approve'
  return props.txn.activity.slice(0, 1).toUpperCase() + props.txn.activity.slice(1)
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
      <!--p v-if="transactionType === 'Approve'" class="txn__operation">
        Allow to spend
        {{ formattedAllowance }}
      </p>
      <p v-else class="txn__operation">
        {{ transactionType }}
        {{ formattedAmount }} ETH
        <IconArrowLong />
        250 USDB
      </p-->

      <p class="txn__services">{{ txn.service }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/app/tag.scss';
@import '@/assets/scss/main/txn.scss';
</style>
