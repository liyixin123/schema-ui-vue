<template>
  <fieldset class="field-group">
    <legend class="field-group-legend">{{ label }}</legend>
    <p v-if="description" class="field-group-description">{{ description }}</p>
    <FormRenderer
      :fields="children"
      :config="config"
      :columns="columns"
      @update="$emit('update', $event)"
    />
  </fieldset>
</template>

<script setup lang="ts">
import type { FormFieldDescriptor } from '../types/form'
import FormRenderer from './FormRenderer.vue'

withDefaults(
  defineProps<{
    label: string
    description?: string
    children: FormFieldDescriptor[]
    config: Record<string, unknown>
    columns?: number
  }>(),
  { columns: 2 },
)

defineEmits<{
  update: [payload: { path: string; value: unknown }]
}>()
</script>

<style scoped>
.field-group {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 16px;
  background: var(--color-surface-alt);
}

.field-group-legend {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
  padding: 0 6px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.field-group-description {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
  line-height: 1.4;
}
</style>
