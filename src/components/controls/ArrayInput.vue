<template>
  <div class="array-input" :class="{ 'has-error': hasError }">
    <div v-if="modelValue.length === 0" class="array-empty">
      No items yet. Click "Add item" to start.
    </div>

    <div
      v-for="(item, index) in modelValue"
      :key="index"
      class="array-row"
    >
      <input
        v-if="itemType === 'number'"
        class="form-control array-item-input"
        type="number"
        :value="item"
        @input="updateItem(index, parseFloat(($event.target as HTMLInputElement).value))"
      />
      <input
        v-else
        class="form-control array-item-input"
        type="text"
        :value="item"
        @input="updateItem(index, ($event.target as HTMLInputElement).value)"
      />
      <button class="array-remove-btn" type="button" :aria-label="`Remove item ${index + 1}`" @click="removeItem(index)">
        ×
      </button>
    </div>

    <button class="array-add-btn" type="button" @click="addItem">
      + Add item
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ArrayItemType } from '../../types/form'

const props = withDefaults(
  defineProps<{
    modelValue?: (string | number)[]
    itemType?: ArrayItemType
    hasError?: boolean
  }>(),
  { modelValue: () => [] },
)

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]]
}>()

function addItem(): void {
  const newItem = props.itemType === 'number' ? 0 : ''
  emit('update:modelValue', [...props.modelValue, newItem])
}

function removeItem(index: number): void {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== index))
}

function updateItem(index: number, value: string | number): void {
  const updated = props.modelValue.map((item, i) => (i === index ? value : item))
  emit('update:modelValue', updated)
}
</script>

<style scoped>
.array-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.array-empty {
  font-size: 12px;
  color: var(--color-text-secondary);
  padding: 8px 0 4px;
  font-style: italic;
}

.array-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.array-item-input {
  flex: 1;
}

.array-remove-btn {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.array-remove-btn:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.array-add-btn {
  align-self: flex-start;
  padding: 5px 12px;
  border-radius: var(--radius-md);
  border: 1px dashed var(--color-border);
  background: transparent;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.array-add-btn:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}
</style>
