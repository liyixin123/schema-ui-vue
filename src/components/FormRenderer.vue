<template>
  <div class="form-renderer" :style="{ '--grid-cols': columns }">
    <template v-for="field in fields" :key="field.path">
      <div
        class="field-cell"
        :class="{ 'field-cell--full': field.controlType === 'group' || field.controlType === 'object-array' }"
      >
        <FieldGroup
          v-if="field.controlType === 'group' && field.children"
          :label="field.label"
          :description="field.description"
          :children="field.children"
          :config="getGroupConfig(field.key)"
          :columns="columns"
          @update="onNestedUpdate(field.key, $event)"
        />
        <FieldWrapper
          v-else-if="field.controlType === 'object-array'"
          :label="field.label"
          :description="field.description"
          :required="field.required"
          :errors="fieldErrors(field.path)"
          :has-error="fieldErrors(field.path).length > 0"
        >
          <ObjectArrayInput
            :model-value="(getFieldValue(field.path) as Record<string, unknown>[])"
            :item-schema="field.itemSchema"
            :has-error="fieldErrors(field.path).length > 0"
            :label="field.label"
            :readonly="field.readonly"
            @update:model-value="onFieldUpdate(field.path, $event)"
          />
        </FieldWrapper>
        <FieldWrapper
          v-else
          :label="field.label"
          :description="field.description"
          :required="field.required"
          :errors="fieldErrors(field.path)"
          :has-error="fieldErrors(field.path).length > 0"
        >
          <component
            :is="controlRegistry[field.controlType as Exclude<ControlType, 'group' | 'object-array'>]"
            :model-value="getFieldValue(field.path)"
            :has-error="fieldErrors(field.path).length > 0"
            :options="field.options"
            :minimum="field.minimum"
            :maximum="field.maximum"
            :min-length="field.minLength"
            :max-length="field.maxLength"
            :label="field.label"
            :input-id="field.path"
            :item-type="field.itemType"
            :readonly="field.readonly"
            @update:model-value="field.readonly ? undefined : onFieldUpdate(field.path, $event)"
          />
        </FieldWrapper>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import type { FormFieldDescriptor, ControlType } from '../types/form'
import type { ValidationError } from '../types/validation'
import { controlRegistry } from './controls/index'
import FieldWrapper from './FieldWrapper.vue'
import FieldGroup from './FieldGroup.vue'
import ObjectArrayInput from './controls/ObjectArrayInput.vue'

const props = withDefaults(
  defineProps<{
    fields: FormFieldDescriptor[]
    config: Record<string, unknown>
    errors?: ValidationError[]
    columns?: number
  }>(),
  { columns: 2 },
)

const emit = defineEmits<{
  update: [payload: { path: string; value: unknown }]
}>()

// Support injected errors from parent or use props
const injectedErrors = inject<ValidationError[]>('validationErrors', [])

function fieldErrors(path: string): string[] {
  const allErrors = props.errors ?? injectedErrors
  return allErrors.filter((e) => e.path === path).map((e) => e.message)
}

function getFieldValue(path: string): unknown {
  const parts = path.split('.')
  return parts.reduce<unknown>((obj, key) => {
    if (obj === null || obj === undefined) return undefined
    return (obj as Record<string, unknown>)[key]
  }, props.config)
}

function getGroupConfig(key: string): Record<string, unknown> {
  const val = props.config[key]
  return (val as Record<string, unknown>) ?? {}
}

function onFieldUpdate(path: string, value: unknown): void {
  emit('update', { path, value })
}

function onNestedUpdate(groupKey: string, event: { path: string; value: unknown }): void {
  emit('update', { path: `${groupKey}.${event.path}`, value: event.value })
}
</script>

<style scoped>
.form-renderer {
  display: grid;
  grid-template-columns: repeat(var(--grid-cols, 2), 1fr);
  column-gap: 20px;
}

.field-cell--full {
  grid-column: 1 / -1;
}
</style>
