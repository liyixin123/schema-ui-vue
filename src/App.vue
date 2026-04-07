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
                    :class="{ 'demo-mode-btn--active': layoutMode === 'default' }"
                    type="button"
                    @click="setMode('default')"
                >
                    默认布局
                </button>
                <button
                    class="demo-mode-btn"
                    :class="{ 'demo-mode-btn--active': layoutMode === 'algorithm' }"
                    type="button"
                    @click="setMode('algorithm')"
                >
                    算法参数显示
                </button>
            </div>
        </header>

        <main class="demo-main">
            <!-- Canvas panel: only shown when schema has canvas fields -->
            <CanvasPreview
                v-if="canvasFields.length > 0"
                :canvas-fields="canvasFields"
                :config="config"
                @update="handleCanvasUpdate"
            />

            <AutoConfigForm
                :schema="schema ?? undefined"
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
import { ref, computed, watch } from "vue";
import { AutoConfigForm, parseSchema, extractCanvasFields } from "schema-ui-vue";
import type { LayoutMode, JsonSchema, FormFieldDescriptor } from "schema-ui-vue";
import CanvasPreview from "./CanvasPreview.vue";

const layoutMode = ref<LayoutMode>("algorithm");
const config = ref<Record<string, unknown>>({});
const schema = ref<JsonSchema | null>(null);

const schemaUrl = computed(() =>
    layoutMode.value === "algorithm"
        ? "/samples/algorithm-schema.json"
        : "/samples/example-schema.json",
);

// Fetch schema in app layer so canvas fields can be derived here
watch(schemaUrl, async (url) => {
    schema.value = null;
    config.value = {};
    try {
        const res = await fetch(url);
        schema.value = (await res.json()) as JsonSchema;
    } catch {
        // AutoConfigForm will show its own error
    }
}, { immediate: true });

const canvasFields = computed<FormFieldDescriptor[]>(() =>
    schema.value ? extractCanvasFields(parseSchema(schema.value)) : [],
);

// Nested value setter (immutable) for canvas updates
function setNested(
    obj: Record<string, unknown>,
    path: string,
    value: unknown,
): Record<string, unknown> {
    const [head, ...rest] = path.split(".");
    if (rest.length === 0) return { ...obj, [head]: value };
    return {
        ...obj,
        [head]: setNested(
            ((obj[head] as Record<string, unknown>) ?? {}),
            rest.join("."),
            value,
        ),
    };
}

function handleCanvasUpdate(payload: { path: string; value: unknown }) {
    config.value = setNested(config.value, payload.path, payload.value);
}

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
    flex-shrink: 0;
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
    transition: background 0.15s, color 0.15s, border-color 0.15s;
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
    min-height: 0;
}

/* Make AutoConfigForm fill the available height in demo */
.demo-main .acf-root {
    flex: 1;
    overflow: hidden;
    min-width: 0;
}

.demo-main .acf-body--split {
    height: calc(100vh - 57px - 49px);
}

.demo-main .acf-form {
    overflow-y: auto;
}

.demo-main .acf-preview {
    overflow-y: auto;
}
</style>
