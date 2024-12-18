<script setup lang="ts">
import { ref, computed, toRefs } from 'vue'

import SignTxn from '@/components/SignTxn.vue'
import IconCheck from '@/components/icons/IconCheck.vue'
import IconX from '@/components/icons/IconX.vue'
import IconArrowShort from '@/components/icons/IconArrowShort.vue'

import { useSignStore } from '@/stores/sign'

const { signTransaction, signAll, rejectAll, sendTransactionsToPage } = useSignStore()
const { path } = toRefs(useSignStore())

const currentIndex = ref<number>(0)

// Sign/reject all
async function signAllTransactions() {
  await signAll()
}

async function rejectAllTransactions() {
  await rejectAll()
}

// Prev/next transaction
const isPrevDisabled = computed<boolean>(() => {
  return currentIndex.value <= 0
})

const isNextDisabled = computed<boolean>(() => {
  return currentIndex.value >= path.value.length - 1
})

function prevTxn() {
  if (!isPrevDisabled.value) currentIndex.value--
}

function nextTxn() {
  if (!isNextDisabled.value) currentIndex.value++
}

// Sign one transaction
const isTxnSigned = computed<boolean>(() => {
  return !!path.value[currentIndex.value].transaction.signedHash
})

const isAllSigned = computed<boolean>(() => {
  return path.value.every((step) => typeof step.transaction.signedHash !== 'undefined')
})

async function signTxn() {
  const signedHash = await signTransaction(path.value[currentIndex.value].transaction)
  console.log('signedHash', signedHash)

  path.value[currentIndex.value].transaction.signedHash = signedHash

  if (isAllSigned.value) await sendTransactionsToPage()
}

async function rejectTxn() {
  path.value.forEach((step) => {
    console.log(step);
    console.log(path.value[currentIndex.value]);
    if (step.address.toLowerCase() === path.value[currentIndex.value].address.toLowerCase()) {
      step.transaction.signedHash = null
    }
  })

  if (isAllSigned.value) await sendTransactionsToPage()
}
</script>

<template>
  <section class="section">
    <div class="section__head">
      <h1>Sign</h1>

      <div class="section__buttons">
        <button class="button button--xs blue" @click="signAllTransactions">
          <IconCheck />
          Sign all
        </button>
        <button class="button button--xs red" @click="rejectAllTransactions">
          <IconX />
          Reject all
        </button>
      </div>
    </div>

    <div class="sign">
      <p class="sign__amount">{{ currentIndex }} of {{ path.length }} transactions</p>

      <div class="sign__transactions">
        <button class="sign__arrow sign__arrow--prev" :disabled="isPrevDisabled" @click="prevTxn">
          <IconArrowShort />
        </button>

        <SignTxn :txn="path[currentIndex]" />

        <button class="sign__arrow sign__arrow--next" :disabled="isNextDisabled" @click="nextTxn">
          <IconArrowShort />
        </button>
      </div>

      <div class="sign__buttons">
        <template v-if="!isTxnSigned">
          <button class="button button--md button--blue" @click="signTxn">Sign</button>
          <button class="button button--md button--red" @click="rejectTxn">Reject</button>
        </template>

        <button v-else class="button button--md" disabled>
          {{ path[currentIndex].transaction.signedHash === null ? 'Rejected' : 'Signed' }}
        </button>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/main/sign.scss';
@import '@/assets/scss/main/section.scss';
</style>
