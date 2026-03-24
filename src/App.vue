<template>
  <div class="app">
    <!-- Landing state: no schema loaded -->
    <div v-if="!schema" class="landing">
      <div class="landing-header">
        <h1 class="landing-title">Auto Config</h1>
        <p class="landing-subtitle">Generate forms automatically from JSON Schema</p>
      </div>
      <div class="landing-uploader">
        <SchemaUploader @file-selected="handleFileSelected" />
        <p v-if="importError" class="upload-error">{{ importError }}</p>
        <div class="landing-sample">
          <a :href="`${base}samples/example-schema.json`" download class="sample-link">
            Download sample schema
          </a>
        </div>
      </div>
    </div>

    <!-- Form editor state -->
    <template v-else>
      <ConfigToolbar
        :schema-title="schemaTitle"
        :validation-result="validationResult"
        :columns="columns"
        @validate="handleValidate"
        @reset="handleReset"
        @export="handleExport"
        @update:columns="columns = $event"
      />

      <div class="editor-layout">
        <!-- Left: Form panel -->
        <div class="form-panel">
          <div class="form-panel-header">
            <button class="back-btn" type="button" @click="handleBack">
              ← Load another schema
            </button>
          </div>
          <div class="form-scroll">
            <FormRenderer
              :fields="fields"
              :config="config"
              :errors="validationResult?.errors"
              :columns="columns"
              @update="handleFieldUpdate"
            />
          </div>
        </div>

        <!-- Right: Preview panel -->
        <div class="preview-panel">
          <ConfigPreview :config="config" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SchemaUploader from './components/SchemaUploader.vue'
import FormRenderer from './components/FormRenderer.vue'
import ConfigToolbar from './components/ConfigToolbar.vue'
import ConfigPreview from './components/ConfigPreview.vue'
import { useSchemaImport } from './composables/useSchemaImport'
import { useFormState } from './composables/useFormState'
import { useValidation } from './composables/useValidation'
import { downloadJson } from './utils/file-io'

const base = import.meta.env.BASE_URL
const columns = ref(2)

const { schema, fields, schemaTitle, error: importError, importFile, reset: resetImport } = useSchemaImport()
const { config, initFromSchema, setValue, reset: resetForm } = useFormState()
const { result: validationResult, validate, clearErrors } = useValidation()

async function handleFileSelected(file: File): Promise<void> {
  await importFile(file)
  if (schema.value) {
    initFromSchema(schema.value)
    clearErrors()
  }
}

function handleFieldUpdate(payload: { path: string; value: unknown }): void {
  setValue(payload.path, payload.value)
}

function handleValidate(): void {
  if (schema.value) {
    validate(schema.value, config.value)
  }
}

function handleReset(): void {
  if (schema.value) {
    resetForm(schema.value)
    clearErrors()
  }
}

function handleExport(): void {
  downloadJson(config.value, `${schemaTitle.value || 'config'}.json`)
}

function handleBack(): void {
  resetImport()
  clearErrors()
}
</script>

<style>
@import './assets/styles/base.css';
@import './assets/styles/form.css';

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Landing */
.landing {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  gap: 40px;
}

.landing-header {
  text-align: center;
}

.landing-title {
  font-size: 36px;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.landing-subtitle {
  font-size: 16px;
  color: var(--color-text-secondary);
}

.landing-uploader {
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-error {
  font-size: 13px;
  color: var(--color-danger);
  background: var(--color-danger-light);
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid #fca5a5;
}

.landing-sample {
  text-align: center;
}

.sample-link {
  font-size: 13px;
  color: var(--color-primary);
}

/* Editor layout */
.editor-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr var(--sidebar-width);
  min-height: 0;
  overflow: hidden;
  height: calc(100vh - var(--header-height) - 41px);
}

@media (max-width: 900px) {
  .editor-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    height: auto;
  }
}

.form-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-bg);
}

.form-panel-header {
  padding: 10px 24px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  flex-shrink: 0;
}

.back-btn {
  font-size: 12px;
  color: var(--color-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.back-btn:hover {
  color: var(--color-primary);
}

.form-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.preview-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-left: 1px solid var(--color-border);
}
</style>
