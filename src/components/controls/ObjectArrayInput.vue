<template>
  <div class="obj-array-input" :class="{ 'has-error': hasError }">
    <div v-if="modelValue.length === 0" class="obj-array-empty">
      暂无项目，点击"添加项"开始。
    </div>

    <div
      v-for="(item, index) in modelValue"
      :key="index"
      class="obj-array-item"
      :class="{ 'obj-array-item--collapsed': collapsedItems.has(index) }"
    >
      <div class="obj-array-item-header" @click="toggleItem(index)">
        <span class="obj-array-item-chevron" :class="{ 'obj-array-item-chevron--open': !collapsedItems.has(index) }">
          ▶
        </span>
        <span class="obj-array-item-title">{{ getItemTitle(item, index) }}</span>
        <button
          v-if="!readonly"
          class="obj-array-delete-btn"
          type="button"
          :aria-label="`删除第 ${index + 1} 项`"
          @click.stop="removeItem(index)"
        >
          ×
        </button>
      </div>

      <div v-show="!collapsedItems.has(index)" class="obj-array-item-body">
        <FormRenderer
          :fields="itemSchema"
          :config="item"
          :columns="2"
          @update="onItemUpdate(index, $event)"
        />
      </div>
    </div>

    <button v-if="!readonly" class="obj-array-add-btn" type="button" @click="addItem">
      + 添加项
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormFieldDescriptor } from '../../types/form'
import { buildDefaultFromDescriptors } from '../../utils/default-values'
import { setNestedValue } from '../../utils/deep-clone'
import FormRenderer from '../FormRenderer.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: Record<string, unknown>[]
    itemSchema?: FormFieldDescriptor[]
    hasError?: boolean
    label?: string
    readonly?: boolean
  }>(),
  { modelValue: () => [], itemSchema: () => [] },
)

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>[]]
}>()

const collapsedItems = ref<Set<number>>(new Set())

function toggleItem(index: number): void {
  const next = new Set(collapsedItems.value)
  if (next.has(index)) {
    next.delete(index)
  } else {
    next.add(index)
  }
  collapsedItems.value = next
}

function getItemTitle(item: Record<string, unknown>, index: number): string {
  // Use the first string-valued field as the item title
  for (const field of props.itemSchema) {
    if (field.controlType === 'text' || field.controlType === 'select') {
      const val = item[field.key]
      if (typeof val === 'string' && val.trim()) return val
    }
  }
  return `项目 ${index + 1}`
}

function addItem(): void {
  const newItem = buildDefaultFromDescriptors(props.itemSchema)
  emit('update:modelValue', [...props.modelValue, newItem])
}

function removeItem(index: number): void {
  // Also clean up collapsed state for removed item
  const next = new Set<number>()
  collapsedItems.value.forEach((i) => {
    if (i < index) next.add(i)
    else if (i > index) next.add(i - 1)
  })
  collapsedItems.value = next
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== index))
}

function onItemUpdate(index: number, event: { path: string; value: unknown }): void {
  const updatedItem = setNestedValue(props.modelValue[index], event.path, event.value)
  const updated = props.modelValue.map((item, i) => (i === index ? updatedItem : item))
  emit('update:modelValue', updated)
}
</script>

<style scoped>
.obj-array-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.obj-array-empty {
  font-size: 12px;
  color: var(--color-text-secondary);
  padding: 8px 0 4px;
  font-style: italic;
}

.obj-array-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.obj-array-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-surface-alt);
  cursor: pointer;
  user-select: none;
}

.obj-array-item-header:hover {
  background: var(--color-bg);
}

.obj-array-item-chevron {
  display: inline-block;
  font-size: 10px;
  flex-shrink: 0;
  transition: transform 0.15s ease;
}

.obj-array-item-chevron--open {
  transform: rotate(90deg);
}

.obj-array-item-title {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.obj-array-delete-btn {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
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

.obj-array-delete-btn:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.obj-array-item-body {
  padding: 12px;
}

.obj-array-add-btn {
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

.obj-array-add-btn:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}
</style>
