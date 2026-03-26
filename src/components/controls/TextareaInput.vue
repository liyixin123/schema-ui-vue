<template>
  <textarea
    class="form-control"
    :class="{ 'has-error': hasError }"
    :value="modelValue"
    :placeholder="placeholder"
    rows="4"
    :disabled="readonly"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  hasError?: boolean
  placeholder?: string
  readonly?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
