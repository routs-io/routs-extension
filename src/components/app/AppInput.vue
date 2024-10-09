<template>
  <div class="input" :class="{ 'input--error': error }">
    <label v-if="label" :for="id" class="input__label">
      {{ label }}
    </label>

    <div class="input__block">
      <!-- <Icon v-if="icon" :name="icon" size="0.75rem" class="input__icon" /> -->

      <input
        :id="id"
        v-model="model"
        :type="type"
        :placeholder="placeholder"
        autocomplete="off"
        @input="$emit('on-input')"
      />

      <!-- Error message -->
      <p v-if="error" class="input__error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: string
    id: string
    label?: string
    placeholder: string
    icon?: string
    error?: string
  }>(),
  {
    type: 'text'
  }
)

defineEmits<{ 'on-input': [void] }>()

const model = defineModel<string>()
</script>

<style lang="scss" scoped>
@import '@/assets/scss/app/input.scss';
</style>
