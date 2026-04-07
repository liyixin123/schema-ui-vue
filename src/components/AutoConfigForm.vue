<template>
  <div class="acf-root">
    <div v-if="loadError" class="acf-error">{{ loadError }}</div>

    <template v-else-if="effectiveSchema">
      <ConfigToolbar
        v-if="showToolbar"
        :schema-title="effectiveSchema.title ?? ''"
        :validation-result="validationResult"
        :columns="internalColumns"
        @validate="handleValidate"
        @reset="handleReset"
        @export="handleExport"
        @export-schema="handleExportSchema"
        @export-result="handleExportResult"
        @update:columns="internalColumns = $event"
      />

      <div class="acf-body" :class="{ 'acf-body--split': showPreview }">
        <div class="acf-form">
          <AlgorithmLayout
            v-if="props.layoutMode === 'algorithm'"
            :fields="fields"
            :config="displayConfig"
            :errors="validationResult?.errors"
            :columns="internalColumns"
            @update="handleFieldUpdate"
          />
          <FormRenderer
            v-else
            :fields="fields"
            :config="displayConfig"
            :errors="validationResult?.errors"
            :columns="internalColumns"
            @update="handleFieldUpdate"
          />
        </div>
        <div v-if="showPreview" class="acf-preview">
          <ConfigPreview :config="internalConfig" />
        </div>
      </div>
    </template>

    <div v-else class="acf-loading">Loading schema…</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { JsonSchema } from '../types/schema'
import type { ValidationResult } from '../types/validation'
import type { FormFieldDescriptor, LayoutMode } from '../types/form'
import { parseSchema } from '../utils/schema-parser'
import { useFormState } from '../composables/useFormState'
import { useValidation } from '../composables/useValidation'
import { downloadJson } from '../utils/file-io'
import { deepMerge } from '../utils/deep-clone'
import { stripReadonlyPaths } from '../utils/default-values'
import FormRenderer from './FormRenderer.vue'
import AlgorithmLayout from './AlgorithmLayout.vue'
import ConfigToolbar from './ConfigToolbar.vue'
import ConfigPreview from './ConfigPreview.vue'

// Import scoped library styles (CSS variables + form controls under .acf-root)
import '../assets/styles/library.css'

const props = withDefaults(
  defineProps<{
    schema?: JsonSchema
    schemaUrl?: string
    modelValue?: Record<string, unknown>
    columns?: number
    showToolbar?: boolean
    showPreview?: boolean
    layoutMode?: LayoutMode
    readonlyData?: Record<string, unknown>
  }>(),
  {
    columns: 2,
    showToolbar: false,
    showPreview: false,
    layoutMode: 'default',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
}>()

// ── Internal state ────────────────────────────────────────────
const fetchedSchema = ref<JsonSchema | null>(null)
const loadError = ref<string | null>(null)
const fields = ref<FormFieldDescriptor[]>([])
const internalColumns = ref(props.columns)

const { config: internalConfig, initFromSchema, setValue, reset: resetForm } = useFormState()
const { result: validationResult, validate, clearErrors } = useValidation()

// The schema that is actually in use (prop takes priority over fetched)
const effectiveSchema = computed<JsonSchema | null>(() =>
  props.schema ?? fetchedSchema.value,
)

// Merge editable config with readonly data for display only
const displayConfig = computed(() =>
  deepMerge(internalConfig.value, props.readonlyData),
)

// ── Schema initialization ─────────────────────────────────────

function applySchema(schema: JsonSchema): void {
  fields.value = parseSchema(schema)
  initFromSchema(schema)
  // If a modelValue was already provided by the parent, prefer it over schema defaults
  if (props.modelValue && Object.keys(props.modelValue).length > 0) {
    internalConfig.value = props.modelValue
  }
  clearErrors()
  emit('update:modelValue', internalConfig.value)
}

// React to schema prop changes
watch(
  () => props.schema,
  (schema) => { if (schema) applySchema(schema) },
  { immediate: true },
)

// React to schemaUrl changes
watch(
  () => props.schemaUrl,
  async (url) => {
    if (!url || props.schema) return
    loadError.value = null
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      fetchedSchema.value = (await res.json()) as JsonSchema
      applySchema(fetchedSchema.value)
    } catch (err) {
      loadError.value = err instanceof Error ? err.message : 'Failed to load schema'
    }
  },
  { immediate: true },
)

// ── v-model sync ──────────────────────────────────────────────

// When parent updates modelValue from outside, sync into internal state.
// Guard with JSON comparison to avoid infinite emit loops.
watch(
  () => props.modelValue,
  (incoming) => {
    if (!incoming) return
    if (JSON.stringify(incoming) !== JSON.stringify(internalConfig.value)) {
      internalConfig.value = incoming
    }
  },
  { deep: true },
)

// When internal config changes (user edits), propagate to parent (readonly fields excluded).
watch(internalConfig, (val) => {
  emit('update:modelValue', stripReadonlyPaths(val, fields.value))
})

// ── Field update handler ──────────────────────────────────────

function handleFieldUpdate(payload: { path: string; value: unknown }): void {
  // Readonly fields should not trigger state updates; FormRenderer already
  // guards against this, but we double-check here at the orchestrator level.
  setValue(payload.path, payload.value)
}

// ── Toolbar handlers ──────────────────────────────────────────

function handleValidate(): void {
  if (effectiveSchema.value) {
    validate(effectiveSchema.value, internalConfig.value)
  }
}

function handleReset(): void {
  if (effectiveSchema.value) {
    resetForm(effectiveSchema.value)
    clearErrors()
  }
}

function handleExport(): void {
  const title = effectiveSchema.value?.title ?? 'config'
  // 导出配置参数（表单数据 + 画布数据），排除 readonly 结果字段
  downloadJson(stripReadonlyPaths(internalConfig.value, fields.value), `${title}-config.json`)
}

function handleExportResult(): void {
  const title = effectiveSchema.value?.title ?? 'result'
  // 导出算法结果（readonlyData），无 readonlyData 时跳过
  if (props.readonlyData) {
    downloadJson(props.readonlyData, `${title}-result.json`)
  }
}

function handleExportSchema(): void {
  if (!effectiveSchema.value) return
  const title = effectiveSchema.value.title ?? 'schema'
  downloadJson(effectiveSchema.value, `${title}-schema.json`)
}

// ── Exposed methods ───────────────────────────────────────────

function validate_(): ValidationResult {
  if (!effectiveSchema.value) return { valid: true, errors: [] }
  return validate(effectiveSchema.value, internalConfig.value)
}

function reset_(): void {
  handleReset()
}

defineExpose({ validate: validate_, reset: reset_ })
</script>

<style scoped>
.acf-root {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.acf-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.acf-body--split {
  display: grid;
  grid-template-columns: 1fr 380px;
  min-height: 0;
}

.acf-form {
  padding: 16px;
  overflow-y: auto;
  min-width: 0;
}

.acf-preview {
  border-left: 1px solid var(--color-border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.acf-error {
  padding: 12px 16px;
  background: var(--color-danger-light);
  color: var(--color-danger);
  border-radius: var(--radius-md);
  border: 1px solid #fca5a5;
  font-size: 13px;
}

.acf-loading {
  padding: 16px;
  color: var(--color-text-secondary);
  font-size: 13px;
}
</style>
