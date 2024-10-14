<template>
  <div class="approval-modal">
    <div class="modal-header">
      <h3>Swap</h3>
      <p>{{ service }}</p>
      <h4>{{ formattedAddressFrom }}</h4>
    </div>

    <div class="modal-content">
      <div class="application-info">
        <div class="address-info">
          <p>Application</p>
          <p>{{ formattedAddressTo }}</p>
        </div>
      </div>

      <div v-if="transaction.value" class="allow-to-spend">
        <p>Value</p>
        <div class="usdt-amount">
          <p>{{ formattedAmount }} ETH</p>
        </div>
      </div>

      <div class="allow-to-spend">
        <p>Fee</p>
        <div class="usdt-amount">
          <p>{{ formattedFee }}</p>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button @click="cancel" class="cancel-btn">Cancel</button>
      <button @click="sign" class="sign-btn">Sign</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ITransaction } from '@/types/sign'
import { computed } from 'vue'
import { formatEther } from 'ethers'

const props = defineProps<{
  service: string
  transaction: ITransaction
}>()

const formattedAddressTo = computed(() => {
  return props.transaction.to
    ? props.transaction.to.toString().slice(0, 8) +
        '...' +
        props.transaction.to.toString().slice(-6)
    : 'Wrong address'
})

const formattedAddressFrom = computed(() => {
  return props.transaction.from
    ? props.transaction.from.toString().slice(0, 8) +
        '...' +
        props.transaction.from.toString().slice(-6)
    : 'Wrong address'
})

const formattedFee = computed(() => {
  if (!props.transaction.gasLimit || !props.transaction.gasPrice) return 'Failed to estimate fee'
  const num = BigInt(props.transaction.gasLimit) * BigInt(props.transaction.gasPrice)
  return formatEther(num)
})

const formattedAmount = computed(() => {
  if (!props.transaction.value) return '0'
  return formatEther(props.transaction.value)
})

const emit = defineEmits<{
  "on-cancel": [void],
  "on-sign": [void]
}>();

async function cancel() {
  emit("on-cancel")
}

async function sign() {
  emit("on-sign")
}
</script>

<style scoped>
.approval-modal {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  color: rgb(0, 0, 0);
  font-family: 'Arial', sans-serif;
}

.modal-header {
  text-align: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 24px;
}

.modal-header p {
  color: #7a7a7a;
}

.application-info,
.allow-to-spend,
.status {
  margin-top: 20px;
}

.application-info {
  display: flex;
  align-items: center;
}

.application-info .icon {
  width: 40px;
  height: 40px;
  background-color: #3c3c44;
  border-radius: 50%;
  margin-right: 10px;
}

.application-info .address-info p {
  margin: 0;
}

.allow-to-spend {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.usdt-amount {
  display: flex;
  align-items: center;
}

.usdt-amount button {
  background-color: #3c3c44;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
}

.status {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.verified {
  display: flex;
  align-items: center;
}

.verified-icon {
  margin-right: 5px;
}

.advanced-view button {
  background: none;
  border: none;
  color: #007aff;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.cancel-btn,
.sign-btn {
  width: 45%;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
}

.cancel-btn {
  background-color: transparent;
  color: #ff3b30;
  border: 1px solid #ff3b30;
}

.sign-btn {
  background-color: #007aff;
  color: white;
  border: none;
}
</style>
