<script setup lang="ts">
// Imports
import { computed } from 'vue'
import IconMinus from '@/components/icons/IconMinus.vue'
import IconPlus from '@/components/icons/IconPlus.vue'

const props = defineProps<{
  id: string
  modelValue: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

// ----- COMPUTED
const isDecrementDisabled = computed<boolean>(() => {
  return props.modelValue <= 0
})

const isIncrementDisabled = computed<boolean>(() => {
  return props.modelValue >= 100
})

const isError = computed<boolean>(() => {
  return props.modelValue < 0 || props.modelValue > 100
})

// ----- LOGIC
// Decrease / Increase buttons
function handleCounter(action: 'decrement' | 'increment') {
  let value: number = props.modelValue

  if (action === 'decrement' && !isDecrementDisabled.value) {
    value -= 1
  } else if (action === 'increment' && !isIncrementDisabled.value) {
    value += 1
  }

  // Set min or max if the value is out of range
  if (value < 0) value = 0
  if (value > 100) value = 100

  emit('update:modelValue', value)
}

// Input
function sendValue(e: Event) {
  const target = e.target as HTMLInputElement

  // Remove non-numeric characters
  target.value = target.value.replace(/[^\d]/g, '')

  if (+target.value > 100) target.value = '100'
  else if (+target.value === 0 && +target.value.length > 1) target.value = '0'

  emit('update:modelValue', +target.value)
}

// Blur
function onBlur() {
  // Set min or max if the value is out of range
  if (props.modelValue < 0) emit('update:modelValue', 0)
  else if (props.modelValue > 100) emit('update:modelValue', 100)
}
</script>

<template>
  <div class="counter" :class="{ 'counter--error': isError }">
    <button
      class="counter__btn"
      :disabled="isDecrementDisabled"
      @click="handleCounter('decrement')"
    >
      <IconMinus size="0.75rem" />
    </button>

    <input
      class="counter__input"
      :id="`counter-${id}`"
      :value="modelValue"
      type="text"
      maxlength="100"
      @input="sendValue"
      @blur="onBlur"
    />

    <button
      class="counter__btn"
      :disabled="isIncrementDisabled"
      @click="handleCounter('increment')"
    >
      <IconPlus size="0.75rem" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/app/counter.scss';
</style>
