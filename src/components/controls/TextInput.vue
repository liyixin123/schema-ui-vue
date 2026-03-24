<template>
  <input
    class="form-control"
    :class="{ 'has-error': hasError }"
    type="text"
    :value="modelValue"
    :placeholder="placeholder"
    :minlength="minLength"
    :maxlength="maxLength"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  hasError?: boolean
  placeholder?: string
  minLength?: number
  maxLength?: number
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
