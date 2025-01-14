<script setup lang="ts">
import { ref } from 'vue'

import IconSearch from '@/components/icons/IconSearch.vue'
import IconClose from '@/components/icons/IconClose.vue'

defineProps<{ modelValue: string | number }>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'on-input': [void]
}>()

const debounce = ref<NodeJS.Timeout | null>(null)
const search = ref<string>('')

function debounceEmit() {
  if (debounce.value) clearTimeout(debounce.value)

  debounce.value = setTimeout(() => {
    emit('update:modelValue', search.value)
    emit('on-input')
  }, 300)
}

function clearSearch() {
  search.value = ''
  debounceEmit()
}

function onInput(e: Event) {
  search.value = (e.target as HTMLInputElement).value
  debounceEmit()
}
</script>

<template>
  <div class="search">
    <div class="search__icon">
      <IconSearch width="1.125rem" height="1.125rem" />
    </div>

    <input
      id="search"
      :value="modelValue"
      placeholder="Search wallets..."
      autocomplete="off"
      @input="onInput"
    />

    <button class="search__icon search__icon--clear" @click="clearSearch">
      <IconClose width="1.125rem" height="1.125rem" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/app/search.scss';
</style>
