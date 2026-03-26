<template>
  <div class="checkbox-wrapper">
    <input
      type="checkbox"
      :id="inputId"
      :checked="modelValue"
      :disabled="readonly"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <label :for="inputId">{{ label }}</label>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
  label?: string
  inputId?: string
  readonly?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const inputId = computed(() => props.inputId ?? `checkbox-${Math.random().toString(36).slice(2)}`)
</script>
