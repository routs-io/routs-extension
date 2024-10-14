<script setup lang="ts">
import type { ITransaction } from '@/types/sign'
import ApproveTx from './sign/ApproveTx.vue'
import SwapTx from './sign/SwapTx.vue'
import { useSignStore } from '@/stores/sign'
import { toRefs } from 'vue'

const { currentStep } = toRefs(useSignStore())
const { signTransaction } = useSignStore();

const props = defineProps<{
  service: string
  activity: string
  transaction: ITransaction
}>()

function cancel() {
  currentStep.value = 0;
}

async function sign() {
  const signedTransaction = await signTransaction(props.transaction);
  console.log('signedHash', signedTransaction);
  currentStep.value++;
}
</script>

<template>
  <ApproveTx
    v-if="transaction.kind === 'approve'"
    :service="service"
    :transaction="transaction"
    @on-cancel="cancel"
    @on-sign="sign"
  />
  <SwapTx
    v-else-if="activity === 'swap'"
    :service="service"
    :transaction="transaction"
    @on-cancel="cancel"
    @on-sign="sign"
  />
</template>
