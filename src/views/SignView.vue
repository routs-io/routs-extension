<script setup lang="ts">
import TheSign from '@/components/TheSign.vue'
import { useSignStore } from '@/stores/sign'
import { toRefs } from 'vue';

const { generateId } = useSignStore();
const { currentStep, path } = toRefs(useSignStore())

const formattedPath = path.value.map((step) => {
  const id = generateId();
  return step.transactions.map((transaction) => {
    return {
      id,
      address: step.address,
      activity: step.activity,
      service: step.service,
      transaction: transaction
    }
  })
}).flat();
</script>

<template>
  <main>
    <TheSign
      v-for="(step, index) in formattedPath"
      :key="index"
      :id="step.id"
      :address="step.address"
      :service="step.service"
      :activity="step.activity"
      :transaction="step.transaction"
      :style="{ display: currentStep === index ? 'block' : 'none' }"
    />
  </main>
</template>
