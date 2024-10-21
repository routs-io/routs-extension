<script setup lang="ts">
import type { ITransaction } from '@/types/sign'
import ApproveTx from './sign/ApproveTx.vue'
import SwapTx from './sign/SwapTx.vue'
import OtherTx from './sign/OtherTx.vue'
import { useSignStore } from '@/stores/sign'
import { toRefs } from 'vue'

const { currentStep } = toRefs(useSignStore())
const { signTransaction, addSignedStepToPath } = useSignStore()

const props = defineProps<{
  id: number
  address: string
  service: string
  activity: string
  transaction: ITransaction
}>()

function cancel() {
  currentStep.value = 0
}

async function sign() {
  const signedHash = await signTransaction(props.transaction)
  console.log('signedHash', signedHash)

  addSignedStepToPath({
    id: props.id,
    address: props.address,
    service: props.service,
    activity: props.activity,
    transactions: [
      {
        ...props.transaction,
        signedHash
      }
    ]
  })
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
  <OtherTx
    v-else
    :service="service"
    :transaction="transaction"
    @on-cancel="cancel"
    @on-sign="sign"
  />
</template>
