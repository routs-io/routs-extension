<script setup lang="ts">
import { ref, computed, toRefs } from 'vue'
import type { IPathStep } from '@/types/sign'

import SignTxn from '@/components/SignTxn.vue'
import IconCheck from '@/components/icons/IconCheck.vue'
import IconX from '@/components/icons/IconX.vue'
import IconArrowShort from '@/components/icons/IconArrowShort.vue'

import { useSignStore } from '@/stores/sign'

const { generateId, signTransaction, addSignedStepToPath } = useSignStore()
const { path } = toRefs(useSignStore())

const temp: IPathStep = [
  {
    id: 1,
    activity: 'swap',
    service: 'syncswap',
    status: 1,
    transactions: [
      {
        to: '0x2da10a1e27bf85cedd8ffb1abbe97e53391c0295',
        data: '0x2cc4081e00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000016f51000000000000000000000000000000000000000000000000000000006727f4bb00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000210a1fe8f9cb0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000080115c708e12edd42e504c1cd52aea96c547c05c00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000600000000000000000000000005aea5775959fbc2557cc8789bc1bf90a239d9a9100000000000000000000000099dfe571bad692bad7a3a549a15d2c94acd864f100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000',
        value: '0x210a1fe8f9cb',
        kind: 'swap',
        platform: 'EVM',
        from: '0x99DFe571bAd692bAd7A3a549a15D2c94ACd864f1',
        chainId: 324,
        gasLimit: 599277,
        gasPrice: 52037500,
        nonce: 88
      }
    ]
  },
  {
    id: 2,
    activity: 'dmail',
    service: 'dmail',
    status: 1,
    transactions: [
      {
        from: '0x99DFe571bAd692bAd7A3a549a15D2c94ACd864f1',
        to: '0x981F198286E40F9979274E0876636E9144B8FB8E',
        chainId: 324,
        data: '0x5b7d7482000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000413078333536343632333133303633363333333336363233343632333436363339333936323335363436353631333736353337363233303337333636363634363536000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041307833373633333036343339333733303632333233313331333336353333333933353636333133353633333736333334363333363330333433373333363336353300000000000000000000000000000000000000000000000000000000000000',
        kind: 'dmail',
        platform: 'EVM',
        gasLimit: 274189,
        gasPrice: 52037500,
        nonce: 87,
        signedHash: 'asd'
      }
    ]
  },
  {
    id: 3,
    activity: 'swap',
    service: 'syncswap',
    status: 1,
    transactions: [
      {
        to: '0x2da10a1e27bf85cedd8ffb1abbe97e53391c0295',
        data: '0x2cc4081e00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000016f51000000000000000000000000000000000000000000000000000000006727f4bb00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000210a1fe8f9cb0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000080115c708e12edd42e504c1cd52aea96c547c05c00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000600000000000000000000000005aea5775959fbc2557cc8789bc1bf90a239d9a9100000000000000000000000099dfe571bad692bad7a3a549a15d2c94acd864f100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000',
        value: '0x210a1fe8f9cb',
        kind: 'swap',
        platform: 'EVM',
        from: '0x99DFe571bAd692bAd7A3a549a15D2c94ACd864f1',
        chainId: 324,
        gasLimit: 599277,
        gasPrice: 52037500,
        nonce: 89
      }
    ]
  }
]

// const formattedPath = path.value
//   .map((step) => {
//     const id = generateId()
//     return step.transactions.map((transaction) => {
//       return {
//         id,
//         address: step.address,
//         activity: step.activity,
//         service: step.service,
//         transaction: transaction
//       }
//     })
//   })
//   .flat()

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
  return currentIndex.value >= temp.length - 1
})

function prevTxn() {
  if (!isPrevDisabled.value) currentIndex.value--
}

function nextTxn() {
  if (!isNextDisabled.value) currentIndex.value++
}

// Sign one transaction
const isTxnSigned = computed<boolean>(() => {
  return !!temp[currentIndex.value].transactions[0].signedHash
})

async function signTxn() {
  const signedHash = await signTransaction(temp[currentIndex.value].transactions[0])
  console.log('signedHash', signedHash)

  addSignedStepToPath({
    id: temp[currentIndex.value].id,
    address: temp[currentIndex.value].address,
    service: temp[currentIndex.value].service,
    activity: temp[currentIndex.value].activity,
    transactions: [
      {
        ...temp[currentIndex.value].transactions[0],
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

        <SignTxn :txn="temp[currentIndex]" />

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
