<template>
    <div class="demo-app">
        <header class="demo-header">
            <div class="demo-header-left">
                <h1 class="demo-title">Auto Config</h1>
                <p class="demo-subtitle">JSON Schema → Form Generator</p>
            </div>
            <div class="demo-header-right">
                <button
                    class="demo-mode-btn"
                    :class="{
                        'demo-mode-btn--active': layoutMode === 'default',
                    }"
                    type="button"
                    @click="setMode('default')"
                >
                    默认布局
                </button>
                <button
                    class="demo-mode-btn"
                    :class="{
                        'demo-mode-btn--active': layoutMode === 'algorithm',
                    }"
                    type="button"
                    @click="setMode('algorithm')"
                >
                    算法参数显示
                </button>
            </div>
        </header>

        <main class="demo-main">
            <AutoConfigForm
                :schema-url="schemaUrl"
                v-model="config"
                :show-toolbar="true"
                :show-preview="layoutMode === 'default'"
                :columns="layoutMode === 'algorithm' ? 3 : 2"
                :layout-mode="layoutMode"
                :readonly-data="readonlyData"
            />
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { AutoConfigForm } from "schema-ui-vue";
import type { LayoutMode } from "schema-ui-vue";

const layoutMode = ref<LayoutMode>("algorithm");
const config = ref<Record<string, unknown>>({});

const schemaUrl = computed(() =>
    layoutMode.value === "algorithm"
        ? "/samples/algorithm-schema.json"
        : "/samples/example-schema.json",
);

// 模拟算法计算结果（实际应用中由外部 API 提供）
const mockResults: Record<string, unknown> = {
    length: {
        result: { measuredValue: 99.97, deviation: -0.03, verdict: "合格" },
    },
    width: {
        result: { measuredValue: 50.12, deviation: 0.12, verdict: "不合格" },
    },
};

const readonlyData = computed(() =>
    layoutMode.value === "algorithm" ? mockResults : undefined,
);

function setMode(mode: LayoutMode): void {
    layoutMode.value = mode;
    config.value = {};
}
</script>

<style>
*,
*::before,
*::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family:
        -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #f7f8fa;
    min-height: 100vh;
}

@media (prefers-color-scheme: dark) {
    body {
        background: #0f1117;
    }
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

@media (prefers-color-scheme: dark) {
    .demo-header {
        background: #1e2130;
        border-bottom-color: #374151;
    }
}

.demo-header-left {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.demo-header-right {
    display: flex;
    gap: 8px;
}

.demo-mode-btn {
    padding: 6px 14px;
    font-size: 13px;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    background: transparent;
    color: #4a5568;
    cursor: pointer;
    transition:
        background 0.15s,
        color 0.15s,
        border-color 0.15s;
}

.demo-mode-btn:hover {
    background: #f0f4f8;
}

.demo-mode-btn--active {
    background: #4a90e2;
    border-color: #4a90e2;
    color: #ffffff;
    font-weight: 600;
}

@media (prefers-color-scheme: dark) {
    .demo-mode-btn {
        border-color: #374151;
        color: #94a3b8;
    }
    .demo-mode-btn:hover {
        background: #2d3748;
    }
    .demo-mode-btn--active {
        background: #4a90e2;
        border-color: #4a90e2;
        color: #ffffff;
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
    .demo-title {
        color: #f1f5f9;
    }
    .demo-subtitle {
        color: #94a3b8;
    }
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
    height: calc(
        100vh - 57px - 49px
    ); /* full height minus header and toolbar */
}

.demo-main .acf-form {
    overflow-y: auto;
}

.demo-main .acf-preview {
    overflow-y: auto;
}
</style>
