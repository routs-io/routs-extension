<template>
    <button class="button">
      <Icon v-if="icon" :name="icon" size="1rem" />
      {{ text }}
    </button>
  </template>
  
  <script setup lang="ts">
  defineProps<{
    text?: string;
    icon?: string;
  }>();
  </script>
  