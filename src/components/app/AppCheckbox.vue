<template>
  <div class="checkbox">
    <input
      :id
      v-model="checked"
      type="checkbox"
      :disabled="disabled"
      @change="$emit('on-change')"
    />

    <label :for="id">
      <!-- Order (in globalPath services) -->
      <span v-if="order && order !== 999" class="checkbox__order">
        {{ order }}
      </span>

      <!-- Text -->
      <span v-if="label">{{ label }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  id: string
  label?: string
  order?: number | null
  disabled?: boolean
}>()

defineEmits<{ 'on-change': [void] }>()

const checked = defineModel<boolean>()
</script>

<style lang="scss" scoped>
@use '@/assets/scss/app/checkbox.scss';
</style>
