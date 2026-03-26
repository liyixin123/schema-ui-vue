<template>
  <fieldset class="field-group" :class="{ 'field-group--collapsed': collapsed }">
    <legend
      class="field-group-legend"
      :class="{ 'field-group-legend--clickable': collapsible }"
      @click="toggle"
    >
      <span v-if="collapsible" class="field-group-chevron" :class="{ 'field-group-chevron--open': !collapsed }">
        ▶
      </span>
      {{ label }}
    </legend>
    <p v-if="description" v-show="!collapsed" class="field-group-description">{{ description }}</p>
    <div v-show="!collapsed">
      <FormRenderer
        :fields="children"
        :config="config"
        :columns="columns"
        @update="$emit('update', $event)"
      />
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormFieldDescriptor } from '../types/form'
import FormRenderer from './FormRenderer.vue'

const props = withDefaults(
  defineProps<{
    label: string
    description?: string
    children: FormFieldDescriptor[]
    config: Record<string, unknown>
    columns?: number
    collapsible?: boolean
  }>(),
  { columns: 2, collapsible: false },
)

defineEmits<{
  update: [payload: { path: string; value: unknown }]
}>()

const collapsed = ref(false)

function toggle(): void {
  if (props.collapsible) {
    collapsed.value = !collapsed.value
  }
}
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

.field-group-legend--clickable {
  cursor: pointer;
  user-select: none;
}

.field-group-chevron {
  display: inline-block;
  font-size: 10px;
  margin-right: 6px;
  transition: transform 0.15s ease;
}

.field-group-chevron--open {
  transform: rotate(90deg);
}

.field-group-description {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
  line-height: 1.4;
}
</style>
