<template>
  <div class="config-preview">
    <div class="preview-header">
      <span class="preview-title">JSON Preview</span>
      <button class="copy-btn" type="button" :class="{ copied }" @click="copyToClipboard">
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <pre class="preview-code"><code>{{ formattedJson }}</code></pre>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  config: Record<string, unknown>
}>()

const copied = ref(false)

const formattedJson = computed(() => JSON.stringify(props.config, null, 2))

async function copyToClipboard(): Promise<void> {
  try {
    await navigator.clipboard.writeText(formattedJson.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch {
    // Clipboard not available in all environments
  }
}
</script>

<style scoped>
.config-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.preview-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
}

.copy-btn {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.copy-btn:hover {
  background: var(--color-surface-alt);
}

.copy-btn.copied {
  background: var(--color-success-bg);
  border-color: var(--color-success-border);
  color: var(--color-success-text);
}

.preview-code {
  flex: 1;
  overflow: auto;
  padding: 16px;
  margin: 0;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-text);
  background: transparent;
  white-space: pre;
}
</style>
