<template>
  <select
    class="form-control"
    :class="{ 'has-error': hasError }"
    :value="modelValue"
    :disabled="readonly"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  options: Array<{ label: string; value: string }>
  hasError?: boolean
  readonly?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
