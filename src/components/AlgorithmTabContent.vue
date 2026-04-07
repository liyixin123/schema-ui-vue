<template>
  <div class="algo-tab-content">
    <!-- depth-1 非分组字段：在顶部正常渲染 -->
    <FormRenderer
      v-if="nonGroupChildren.length > 0"
      :fields="nonGroupChildren"
      :config="config"
      :errors="errors"
      :columns="2"
      @update="$emit('update', $event)"
    />

    <!-- 主体区域：左侧tab切换 + 右侧始终显示 -->
    <div
      v-if="tabChildren.length > 0 || alwaysVisibleChildren.length > 0"
      class="algo-main"
      :class="{ 'algo-main--with-sidebar': alwaysVisibleChildren.length > 0 }"
    >
      <!-- 左侧：子tab切换区域（非 readonly 的分组子节点） -->
      <div v-if="tabChildren.length > 0" class="algo-subtabs-container">
        <div class="algo-subtabs">
          <button
            v-for="child in tabChildren"
            :key="child.path"
            class="algo-subtab"
            :class="{ 'algo-subtab--active': activeSubTab === child.key }"
            type="button"
            @click="activeSubTab = child.key"
          >
            {{ child.label }}
          </button>
        </div>

        <div v-if="activeSubTabField" class="algo-subtab-content">
          <FieldGroup
            :label="activeSubTabField.label"
            :description="activeSubTabField.description"
            :children="activeSubTabField.children ?? []"
            :config="config"
            :errors="errors"
            :columns="columns"
            :collapsible="true"
            :collapsible-groups="true"
            @update="$emit('update', $event)"
          />
        </div>
      </div>

      <!-- 右侧：始终显示区域（readonly 的分组子节点） -->
      <div v-if="alwaysVisibleChildren.length > 0" class="algo-sidebar">
        <div
          v-for="child in alwaysVisibleChildren"
          :key="child.path"
          class="algo-always-visible"
        >
          <FieldGroup
            :label="child.label"
            :description="child.description"
            :children="child.children ?? []"
            :config="config"
            :errors="errors"
            :columns="1"
            :collapsible="true"
            :collapsible-groups="true"
            @update="undefined"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormFieldDescriptor } from '../types/form'
import type { ValidationError } from '../types/validation'
import FormRenderer from './FormRenderer.vue'
import FieldGroup from './FieldGroup.vue'

const props = withDefaults(
  defineProps<{
    field: FormFieldDescriptor
    config: Record<string, unknown>
    errors?: ValidationError[]
    columns?: number
  }>(),
  { columns: 3 },
)

defineEmits<{
  update: [payload: { path: string; value: unknown }]
}>()

const groupChildren = computed(() =>
  (props.field.children ?? []).filter(
    (c) => c.controlType === 'group' && c.children,
  ),
)

const nonGroupChildren = computed(() =>
  (props.field.children ?? []).filter(
    (c) => c.controlType !== 'group' && !c.canvas,
  ),
)

// 可切换的tab子组（非 readonly）
const tabChildren = computed(() =>
  groupChildren.value.filter((c) => !c.readonly),
)

// 始终显示的子组（readonly）
const alwaysVisibleChildren = computed(() =>
  groupChildren.value.filter((c) => c.readonly),
)

const activeSubTab = ref<string>(tabChildren.value[0]?.key ?? '')

const activeSubTabField = computed<FormFieldDescriptor | undefined>(() => {
  if (!activeSubTab.value) return tabChildren.value[0]
  return tabChildren.value.find((c) => c.key === activeSubTab.value) ?? tabChildren.value[0]
})
</script>

<style scoped>
.algo-tab-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.algo-main {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.algo-main--with-sidebar {
  flex-direction: row;
  align-items: start;
}

.algo-subtabs-container {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md, 6px);
  overflow: hidden;
}

.algo-subtabs {
  display: flex;
  flex-direction: row;
  background: var(--color-surface-alt);
  border-bottom: 1px solid var(--color-border);
}

.algo-subtab {
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--color-text);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.algo-subtab:hover:not(.algo-subtab--active) {
  background: var(--color-bg);
}

.algo-subtab--active {
  background: var(--color-surface);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
  color: var(--color-primary);
}

.algo-subtab-content {
  padding: 12px;
  background: var(--color-surface);
}

.algo-sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.algo-always-visible {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md, 6px);
  overflow: hidden;
  background: var(--color-surface);
  padding: 12px;
}
</style>
