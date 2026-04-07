<template>
  <div class="algo-layout">
    <!-- 左侧垂直标签导航 -->
    <div class="algo-tabs">
      <button
        v-for="tab in tabFields"
        :key="tab.key"
        class="algo-tab"
        :class="{ 'algo-tab--active': activeTab === tab.key }"
        type="button"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 右侧内容区 -->
    <div class="algo-content">
      <!-- 非分组字段（全局，显示在标签页上方） -->
      <FormRenderer
        v-if="preambleFields.length > 0"
        :fields="preambleFields"
        :config="config"
        :errors="errors"
        :columns="columns"
        class="algo-preamble"
        @update="$emit('update', $event)"
      />

      <!-- 当前激活标签的内容 -->
      <AlgorithmTabContent
        v-if="activeField"
        :field="activeField"
        :config="config"
        :errors="errors"
        :columns="columns"
        @update="$emit('update', $event)"
      />

      <div v-else-if="tabFields.length === 0" class="algo-empty">
        暂无可显示的配置项。
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormFieldDescriptor } from '../types/form'
import type { ValidationError } from '../types/validation'
import FormRenderer from './FormRenderer.vue'
import AlgorithmTabContent from './AlgorithmTabContent.vue'

const props = withDefaults(
  defineProps<{
    fields: FormFieldDescriptor[]
    config: Record<string, unknown>
    errors?: ValidationError[]
    columns?: number
  }>(),
  { columns: 3 },
)

defineEmits<{
  update: [payload: { path: string; value: unknown }]
}>()

// depth-0 分组字段 → 标签页
const tabFields = computed(() =>
  props.fields.filter((f) => f.controlType === 'group' && f.children),
)

// depth-0 非分组字段 → 显示在标签页上方（排除画布字段）
const preambleFields = computed(() =>
  props.fields.filter((f) => f.controlType !== 'group' && !f.canvas),
)

const activeTab = ref<string>(tabFields.value[0]?.key ?? '')

// 当 tabFields 变化时（如 schema 切换），重置激活的标签
const activeField = computed<FormFieldDescriptor | undefined>(() => {
  if (!activeTab.value) return tabFields.value[0]
  return tabFields.value.find((f) => f.key === activeTab.value) ?? tabFields.value[0]
})
</script>

<style scoped>
.algo-layout {
  display: grid;
  grid-template-columns: 180px 1fr;
  min-height: 0;
  flex: 1;
}

.algo-tabs {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-border);
  background: var(--color-surface-alt);
  overflow-y: auto;
}

.algo-tab {
  padding: 12px 16px;
  font-size: 13px;
  cursor: pointer;
  border: none;
  background: transparent;
  text-align: left;
  border-left: 3px solid transparent;
  color: var(--color-text);
  transition: background var(--transition-fast), color var(--transition-fast);
  word-break: break-all;
}

.algo-tab:hover:not(.algo-tab--active) {
  background: var(--color-bg);
}

.algo-tab--active {
  background: var(--color-surface);
  border-left-color: var(--color-primary);
  font-weight: 600;
  color: var(--color-primary);
}

.algo-content {
  padding: 16px;
  overflow-y: auto;
  min-width: 0;
}

.algo-preamble {
  margin-bottom: 16px;
}

.algo-empty {
  font-size: 13px;
  color: var(--color-text-secondary);
  padding: 8px 0;
}
</style>
