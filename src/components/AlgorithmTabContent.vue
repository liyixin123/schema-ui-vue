<template>
  <div class="algo-tab-content">
    <!-- depth-1 非分组字段：在顶部正常渲染 -->
    <FormRenderer
      v-if="nonGroupChildren.length > 0"
      :fields="nonGroupChildren"
      :config="groupConfig"
      :errors="errors"
      :columns="2"
      @update="onUpdate"
    />

    <!-- depth-1 分组字段：多列布局 -->
    <div v-if="groupChildren.length > 0" class="algo-columns" :style="{ '--algo-cols': columnCount }">
      <div
        v-for="child in groupChildren"
        :key="child.path"
        class="algo-column"
        :class="{ 'algo-column--readonly': child.readonly }"
      >
        <FieldGroup
          :label="child.label"
          :description="child.description"
          :children="child.children ?? []"
          :config="getChildConfig(child.key)"
          :columns="1"
          :collapsible="true"
          @update="child.readonly ? undefined : onNestedUpdate(child.key, $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

const emit = defineEmits<{
  update: [payload: { path: string; value: unknown }]
}>()

const columnCount = computed(() => props.columns)

const groupConfig = computed<Record<string, unknown>>(() => {
  const val = props.config[props.field.key]
  return (val as Record<string, unknown>) ?? {}
})

const groupChildren = computed(() =>
  (props.field.children ?? []).filter(
    (c) => c.controlType === 'group' && c.children,
  ),
)

const nonGroupChildren = computed(() =>
  (props.field.children ?? []).filter(
    (c) => c.controlType !== 'group',
  ),
)

function getChildConfig(key: string): Record<string, unknown> {
  const val = groupConfig.value[key]
  return (val as Record<string, unknown>) ?? {}
}

function onUpdate(event: { path: string; value: unknown }): void {
  emit('update', { path: `${props.field.key}.${event.path}`, value: event.value })
}

function onNestedUpdate(childKey: string, event: { path: string; value: unknown }): void {
  emit('update', { path: `${props.field.key}.${childKey}.${event.path}`, value: event.value })
}
</script>

<style scoped>
.algo-tab-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.algo-columns {
  display: grid;
  grid-template-columns: repeat(var(--algo-cols, 3), 1fr);
  gap: 12px;
  align-items: start;
}

.algo-column {
  min-width: 0;
  overflow-y: auto;
}
</style>
