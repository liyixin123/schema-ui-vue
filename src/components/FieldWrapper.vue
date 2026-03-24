<template>
  <div class="field-wrapper" :class="{ 'has-error': hasError }">
    <div class="field-left">
      <label class="field-label">
        {{ label }}
        <span v-if="required" class="required-mark" aria-label="required">*</span>
      </label>
      <p v-if="description" class="field-description">{{ description }}</p>
    </div>
    <div class="field-right">
      <slot />
      <ul v-if="errors.length > 0" class="field-errors" role="alert">
        <li v-for="(err, i) in errors" :key="i" class="field-error">{{ err }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    description?: string
    required?: boolean
    errors?: string[]
    hasError?: boolean
  }>(),
  { errors: () => [] },
)
</script>

<style scoped>
.field-wrapper {
  display: grid;
  grid-template-columns: var(--field-label-width, 120px) 1fr;
  column-gap: 12px;
  align-items: start;
  padding-bottom: 12px;
}

.field-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 7px; /* vertically align label with input */
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 3px;
  line-height: 1.3;
  word-break: break-word;
}

.required-mark {
  color: var(--color-danger);
  font-size: 13px;
  line-height: 1;
  flex-shrink: 0;
}

.field-description {
  font-size: 11px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.field-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-errors {
  list-style: none;
  padding: 0;
  margin: 0;
}

.field-error {
  font-size: 12px;
  color: var(--color-danger);
  display: flex;
  align-items: center;
  gap: 4px;
}

.field-error::before {
  content: '!';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-danger);
  color: white;
  font-size: 10px;
  font-weight: bold;
  flex-shrink: 0;
}
</style>
