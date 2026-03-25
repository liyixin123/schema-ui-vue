# schema-ui-vue

> JSON Schema → Vue 表单，自动生成配置界面。

[![CI](https://github.com/your-username/schema-ui-vue/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/schema-ui-vue/actions)
[![npm](https://img.shields.io/npm/v/schema-ui-vue)](https://www.npmjs.com/package/schema-ui-vue)
[![license](https://img.shields.io/github/license/your-username/schema-ui-vue)](./LICENSE)

传入一个 JSON Schema，自动渲染对应的表单控件（文本框、数字输入、复选框、下拉框、文本域、数组列表）。支持嵌套对象、实时验证、多列布局，可嵌入任意 Vue 3 页面。

---

## 快速开始

```bash
npm install schema-ui-vue
```

```vue
<template>
  <AutoConfigForm :schema="schema" v-model="config" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AutoConfigForm } from 'schema-ui-vue'

const schema = {
  type: 'object',
  properties: {
    host:  { type: 'string',  title: '主机',    default: 'localhost' },
    port:  { type: 'integer', title: '端口',    default: 8080 },
    debug: { type: 'boolean', title: '调试模式', default: false },
    level: { type: 'string',  title: '日志级别', enum: ['debug', 'info', 'warn', 'error'] },
  },
  required: ['host', 'port'],
}

const config = ref({})
</script>
```

---

## Schema → 控件对照表

| JSON Schema 类型 | 条件 | 渲染控件 |
|------------------|------|---------|
| `boolean` | — | 复选框 |
| `number` / `integer` | — | 数字输入框 |
| `string` | 有 `enum` 字段 | 下拉选择框 |
| `string` | `format: "textarea"` | 多行文本域 |
| `string` | 其他 | 单行文本框 |
| `array` | `items.type: "string"` | 字符串列表（可增删） |
| `array` | `items.type: "integer"/"number"` | 数字列表（可增删） |
| `object` | 有 `properties` | 分组（`<fieldset>`，支持递归嵌套） |

---

## API

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `schema` | `JsonSchema` | — | Schema 对象（与 `schemaUrl` 二选一） |
| `schemaUrl` | `string` | — | Schema 文件 URL，组件自动 fetch |
| `modelValue` | `Record<string, unknown>` | — | v-model 绑定，双向同步配置数据 |
| `columns` | `number` | `2` | 每行显示几列控件（1 / 2 / 3） |
| `showToolbar` | `boolean` | `false` | 显示工具栏（验证、重置、导出 JSON、列数切换） |
| `showPreview` | `boolean` | `false` | 右侧显示实时 JSON 预览面板 |

### Emits

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `Record<string, unknown>` | 任意字段变更时触发 |

### 暴露方法（通过 `ref` 调用）

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `validate()` | `ValidationResult` | 用 ajv 验证当前配置，返回 `{ valid, errors }` |
| `reset()` | `void` | 重置为 Schema 默认值，并触发 `update:modelValue` |

```vue
<AutoConfigForm ref="formRef" :schema="schema" v-model="config" />

<script setup lang="ts">
const formRef = ref()

function save() {
  const { valid, errors } = formRef.value.validate()
  if (!valid) {
    console.log('验证失败', errors)
    return
  }
  // 提交 config.value ...
}
</script>
```

---

## 使用示例

### 嵌入页面局部区域

```vue
<template>
  <div class="settings-panel">
    <h3>服务器配置</h3>
    <AutoConfigForm
      :schema="serverSchema"
      v-model="serverConfig"
      :columns="2"
      :show-toolbar="true"
    />
    <button @click="save">保存</button>
  </div>
</template>
```

### 从 URL 加载 Schema

```vue
<!-- 组件自动 fetch，支持 watch schemaUrl 变化 -->
<AutoConfigForm
  schema-url="/api/config-schema.json"
  v-model="config"
  :show-preview="true"
/>
```

### 监听变更（实时保存）

```vue
<AutoConfigForm
  :schema="schema"
  v-model="config"
  @update:model-value="autosave"
/>
```

### 手动触发验证并高亮错误

```vue
<AutoConfigForm ref="form" :schema="schema" v-model="config" />
<button @click="form.validate()">提交前验证</button>
```

---

## 类型导出

```ts
import type {
  JsonSchema,           // JSON Schema 接口
  FormFieldDescriptor,  // 字段描述符（用于自定义扩展）
  ValidationResult,     // { valid: boolean; errors: ValidationError[] }
  ValidationError,      // { path: string; message: string }
  ControlType,          // 'text' | 'number' | 'checkbox' | 'select' | 'textarea' | 'array' | 'group'
} from 'schema-ui-vue'
```

---

## 开发

```bash
# 克隆项目
git clone https://github.com/your-username/schema-ui-vue.git
cd schema-ui-vue
npm install

npm run dev            # 启动 demo 开发服务器
npm test               # 运行测试
npm run test:coverage  # 查看覆盖率报告
npm run build:lib      # 构建组件库到 dist-lib/
npm run build          # 构建 demo 应用到 dist/
```

### 项目结构

```
src/
├── components/
│   ├── AutoConfigForm.vue   # 对外 API：主组件
│   ├── FormRenderer.vue     # 动态渲染字段列表
│   ├── FieldWrapper.vue     # 字段标签 + 描述 + 错误展示
│   ├── FieldGroup.vue       # 嵌套对象 fieldset（递归）
│   ├── ConfigToolbar.vue    # 工具栏
│   ├── ConfigPreview.vue    # JSON 预览面板
│   └── controls/            # TextInput / NumberInput / CheckboxInput / SelectInput / TextareaInput / ArrayInput
├── composables/
│   ├── useFormState.ts      # 不可变状态管理
│   └── useValidation.ts     # ajv 验证 + 错误映射
├── utils/
│   ├── schema-parser.ts     # JsonSchema → FormFieldDescriptor[]
│   ├── default-values.ts    # 提取 Schema 默认值
│   └── deep-clone.ts        # setNestedValue / getNestedValue（不可变更新）
├── types/                   # TypeScript 接口定义
└── index.ts                 # 库入口（导出组件 + 类型）
```

---

## License

[MIT](./LICENSE)
