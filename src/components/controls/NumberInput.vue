<template>
  <input
    class="form-control"
    :class="{ 'has-error': hasError }"
    type="number"
    :value="modelValue"
    :min="minimum"
    :max="maximum"
    :disabled="readonly"
    @input="$emit('update:modelValue', parseFloat(($event.target as HTMLInputElement).value))"
  />
</template>

<script setup lang="ts">
defineProps<{
  modelValue: number
  hasError?: boolean
  minimum?: number
  maximum?: number
  readonly?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: number]
}>()
</script>
