<template>
  <div class="demo-app">
    <header class="demo-header">
      <h1 class="demo-title">Auto Config</h1>
      <p class="demo-subtitle">JSON Schema → Form Generator</p>
    </header>

    <main class="demo-main">
      <AutoConfigForm
        schema-url="/samples/example-schema.json"
        v-model="config"
        :show-toolbar="true"
        :show-preview="true"
        :columns="2"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AutoConfigForm } from 'schema-ui-vue'

const config = ref<Record<string, unknown>>({})
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f7f8fa;
  min-height: 100vh;
}

@media (prefers-color-scheme: dark) {
  body { background: #0f1117; }
}

.demo-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.demo-header {
  background: #ffffff;
  border-bottom: 1px solid #d1d5db;
  padding: 16px 24px;
}

@media (prefers-color-scheme: dark) {
  .demo-header {
    background: #1e2130;
    border-bottom-color: #374151;
  }
}

.demo-title {
  font-size: 20px;
  font-weight: 800;
  color: #1a202c;
  letter-spacing: -0.02em;
}

.demo-subtitle {
  font-size: 13px;
  color: #718096;
  margin-top: 2px;
}

@media (prefers-color-scheme: dark) {
  .demo-title { color: #f1f5f9; }
  .demo-subtitle { color: #94a3b8; }
}

.demo-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Make AutoConfigForm fill the available height in demo */
.demo-main .acf-root {
  flex: 1;
  overflow: hidden;
}

.demo-main .acf-body--split {
  height: calc(100vh - 57px - 49px); /* full height minus header and toolbar */
}

.demo-main .acf-form {
  overflow-y: auto;
}

.demo-main .acf-preview {
  overflow-y: auto;
}
</style>
