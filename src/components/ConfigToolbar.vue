<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <span class="toolbar-title">{{ schemaTitle }}</span>
      <span
        v-if="validationResult"
        class="validation-badge"
        :class="validationResult.valid ? 'badge-valid' : 'badge-invalid'"
      >
        {{ validationResult.valid ? 'Valid' : `${validationResult.errors.length} error(s)` }}
      </span>
    </div>
    <div class="toolbar-actions">
      <div class="columns-toggle" role="group" aria-label="Columns">
        <span class="toggle-label">列</span>
        <button
          v-for="n in [1, 2, 3]"
          :key="n"
          class="toggle-btn"
          :class="{ active: columns === n }"
          type="button"
          @click="$emit('update:columns', n)"
        >{{ n }}</button>
      </div>
      <button class="btn btn-secondary" type="button" @click="$emit('validate')">
        Validate
      </button>
      <button class="btn btn-secondary" type="button" @click="$emit('reset')">
        Reset
      </button>
      <button class="btn btn-primary" type="button" @click="$emit('export')">
        Export JSON
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ValidationResult } from '../types/validation'

withDefaults(
  defineProps<{
    schemaTitle: string
    validationResult?: ValidationResult | null
    columns?: number
  }>(),
  { columns: 2 },
)

defineEmits<{
  validate: []
  reset: []
  export: []
  'update:columns': [value: number]
}>()
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
}

.validation-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
}

.badge-valid {
  background: var(--color-success-bg);
  color: var(--color-success-text);
}

.badge-invalid {
  background: var(--color-danger-bg);
  color: var(--color-danger-text-strong);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.columns-toggle {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-right: 4px;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 2px;
}

.toggle-label {
  font-size: 11px;
  color: var(--color-text-secondary);
  padding: 0 4px 0 6px;
  user-select: none;
}

.toggle-btn {
  width: 26px;
  height: 22px;
  border-radius: calc(var(--radius-md) - 2px);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.toggle-btn:hover {
  background: var(--color-surface);
  color: var(--color-text);
}

.toggle-btn.active {
  background: var(--color-surface);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.btn {
  padding: 6px 14px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.btn-secondary {
  background: var(--color-surface);
  color: var(--color-text);
  border-color: var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-surface-alt);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}
</style>
