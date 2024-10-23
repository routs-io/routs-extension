<script setup lang="ts">
import { ref, computed, toRefs } from 'vue'

import SignTxn from '@/components/SignTxn.vue'
import IconCheck from '@/components/icons/IconCheck.vue'
import IconX from '@/components/icons/IconX.vue'
import IconArrowShort from '@/components/icons/IconArrowShort.vue'

import { useSignStore } from '@/stores/sign'

const { signTransaction, addSignedStepToPath } = useSignStore()
const { path } = toRefs(useSignStore())

const currentIndex = ref<number>(0)

// Sign/reject all
function signAll() {
  console.log('signAll')
}

function rejectAll() {
  console.log('rejectAll')
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
  return !!path.value[currentIndex.value].transactions[0].signedHash
})

async function signTxn() {
  const signedHash = await signTransaction(path.value[currentIndex.value].transactions[0])
  console.log('signedHash', signedHash)

  addSignedStepToPath({
    id: path.value[currentIndex.value].id,
    address: path.value[currentIndex.value].address,
    service: path.value[currentIndex.value].service,
    activity: path.value[currentIndex.value].activity,
    transactions: [
      {
        ...path.value[currentIndex.value].transactions[0],
        signedHash
      }
    ]
  })
}

function regectTxn() {
  console.log('regectTxn')
}
</script>

<template>
  <section class="section">
    <div class="section__head">
      <h1>Sign</h1>

      <div class="section__buttons">
        <button class="button button--xs blue" @click="signAll">
          <IconCheck />
          Sign all
        </button>
        <button class="button button--xs red" @click="rejectAll">
          <IconX />
          Reject all
        </button>
      </div>
    </div>

    <div class="sign">
      <p class="sign__amount">3 of 209 transactions</p>

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
          <button class="button button--md button--red" @click="regectTxn">Reject</button>
        </template>

        <button v-else class="button button--md" disabled>Signed</button>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/main/sign.scss';
@import '@/assets/scss/main/section.scss';
</style>
