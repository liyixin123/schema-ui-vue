<template>
  <div
    class="uploader"
    :class="{ 'is-dragging': isDragging }"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="handleDrop"
  >
    <div class="uploader-content">
      <div class="uploader-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </div>
      <p class="uploader-title">Drop your JSON Schema here</p>
      <p class="uploader-subtitle">or click to browse</p>
      <button class="uploader-btn" type="button" @click="triggerInput">
        Browse File
      </button>
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        class="uploader-input"
        @change="handleInputChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  fileSelected: [file: File]
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function triggerInput(): void {
  fileInput.value?.click()
}

function handleDrop(event: DragEvent): void {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) emit('fileSelected', file)
}

function handleInputChange(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) emit('fileSelected', file)
}
</script>

<style scoped>
.uploader {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color var(--transition-base), background var(--transition-base);
  background: var(--color-surface);
}

.uploader:hover,
.uploader.is-dragging {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.uploader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

.uploader-icon {
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.uploader.is-dragging .uploader-icon {
  color: var(--color-primary);
}

.uploader-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.uploader-subtitle {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.uploader-btn {
  pointer-events: auto;
  margin-top: 12px;
  padding: 8px 20px;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.uploader-btn:hover {
  background: var(--color-primary-hover);
}

.uploader-input {
  display: none;
}
</style>
