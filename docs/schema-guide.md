# Schema 编写指南

本文档面向算法开发人员，说明如何为 `schema-ui-vue` 编写 JSON Schema 配置文件，从而自动生成对应的参数配置界面。

---

## 目录

1. [基本结构](#1-基本结构)
2. [字段类型与对应控件](#2-字段类型与对应控件)
3. [扩展属性（x-*）](#3-扩展属性x-)
4. [导出行为说明](#4-导出行为说明)
5. [完整示例](#5-完整示例)

---

## 1. 基本结构

根节点必须是 `type: "object"`，所有参数定义在 `properties` 下：

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "我的算法配置",
  "description": "可选的说明文字",
  "properties": {
    "参数名": { ... }
  }
}
```

支持任意深度的 `object` 嵌套，每一层 `object` 都会生成一个分组。

---

## 2. 字段类型与对应控件

### 2.1 基础类型

| Schema 类型 | 生成控件 | 示例 |
|------------|---------|------|
| `"type": "string"` | 文本输入框 | `{"type": "string", "default": "abc"}` |
| `"type": "string"` + `"format": "textarea"` | 多行文本框 | `{"type": "string", "format": "textarea"}` |
| `"type": "string"` + `"enum": [...]` | 下拉选择框 | `{"type": "string", "enum": ["A", "B"]}` |
| `"type": "number"` / `"integer"` | 数字输入框 | `{"type": "number", "minimum": 0, "maximum": 100}` |
| `"type": "boolean"` | 复选框 | `{"type": "boolean", "default": true}` |

### 2.2 数组类型

**基础数组**（元素为基本类型）：

```json
{
  "type": "array",
  "title": "排除角度",
  "items": { "type": "number" },
  "default": []
}
```

**对象数组**（元素为对象，生成可增删的列表，每项可展开编辑）：

```json
{
  "type": "array",
  "title": "测量点列表",
  "items": {
    "type": "object",
    "title": "测量点",
    "properties": {
      "name": { "type": "string", "title": "点名称" },
      "x":    { "type": "number", "title": "X 坐标" },
      "y":    { "type": "number", "title": "Y 坐标" }
    }
  },
  "default": []
}
```

> **`items.title`**：每一项折叠标题的前缀，如 `"title": "测量点"` 会生成"测量点 1"、"测量点 2"……若未填写则默认显示"项目 N"。列表中若有 `string` 类型字段且已填值，则优先以该值作为标题。

### 2.3 分组（对象）

```json
{
  "type": "object",
  "title": "高级设置",
  "properties": {
    "threshold": { "type": "number", "title": "阈值", "default": 50 }
  }
}
```

---

## 3. 扩展属性（x-*）

### 3.1 `x-readonly` — 只读字段

标记为只读的字段**显示但不可编辑**，通常用于展示算法输出的结果。只读属性会向子字段继承。

```json
{
  "result": {
    "type": "object",
    "title": "结果显示",
    "x-readonly": true,
    "properties": {
      "measuredValue": { "type": "number", "title": "测量值 (mm)" },
      "verdict": {
        "type": "string",
        "title": "判定结果",
        "enum": ["合格", "不合格", "待检测"],
        "default": "待检测"
      }
    }
  }
}
```

> **注意**：`x-readonly` 字段的值由算法运行时通过 `readonlyData` prop 注入，不包含在配置导出中，只包含在结果导出中。

### 3.2 `x-column` — 布局列标识

在算法布局（`layoutMode: "algorithm"`）中，用于将同一深度的字段排列为并列的子 Tab。常见值为 `"detection"`、`"quality"`、`"result"`，可根据实际布局自定义。

支持两种类型：

**`object` 类型**（固定字段分组）：

```json
{
  "detection": {
    "type": "object",
    "title": "检测参数",
    "x-column": "detection",
    "properties": { ... }
  }
}
```

> `title` 仅用于 Tab 按钮标题，Tab 内容区不会重复渲染标题。

**`array`（对象数组）类型**（可动态增删的规则列表）：

```json
{
  "quality": {
    "type": "array",
    "title": "QA参数",
    "x-column": "quality",
    "items": {
      "type": "object",
      "title": "规则",
      "properties": {
        "nominalValue": { "type": "number", "title": "理论值", "default": 0 },
        "upperLimit":   { "type": "number", "title": "上限",   "default": 0 },
        "lowerLimit":   { "type": "number", "title": "下限",   "default": 0 },
        "unit": {
          "type": "string",
          "title": "单位",
          "enum": ["mm", "cm", "inch", "px"],
          "default": "mm"
        }
      }
    },
    "default": [
      { "nominalValue": 100.0, "upperLimit": 100.1, "lowerLimit": 99.9, "unit": "mm" },
      { "nominalValue": 50.0,  "upperLimit": 50.05, "lowerLimit": 49.95, "unit": "mm" }
    ]
  }
}
```

> 对象数组类型的列在 Tab 内渲染为可折叠列表，用户可自由添加/删除条目。`items.title` 作为每项的编号前缀（如"规则 1"、"规则 2"）。`default` 中可预置初始条目。

### 3.3 `x-canvas` — 画布交互字段

标记为画布字段的数组**不在表单中渲染**，其值由前端图像画布交互产生（用户在图上绘制），并在导出时包含在配置文件中。

**字段格式**：

```json
"x-canvas": {
  "type": "pathpoint" | "roi",
  "group": "分组名称（可选）"
}
```

**简写**（type 默认为 `pathpoint`）：

```json
"x-canvas": true
```

#### items 固定写法

画布字段的 `items` 固定为只含 `x`、`y` 两个坐标属性，**不需要加 `title`**（不渲染表单）：

```json
"items": {
  "type": "object",
  "properties": {
    "x": { "type": "number" },
    "y": { "type": "number" }
  }
}
```

#### 3.3.1 `pathpoint` — 路点（折线）

相同 `group` 内的点按顺序依次连接，形成一条折线。**每组可以有任意多个点**，由用户在图上逐一点击产生。

**Schema 定义**（单组折线）：

```json
{
  "calibrationPath": {
    "type": "array",
    "title": "标定路点",
    "description": "在图像上点击绘制，相邻点依次连接形成折线",
    "x-canvas": { "type": "pathpoint", "group": "calib_line_1" },
    "items": {
      "type": "object",
      "properties": {
        "x": { "type": "number" },
        "y": { "type": "number" }
      }
    },
    "default": []
  }
}
```

**运行时数据**（用户点了 4 个点，形成 3 段折线）：

```json
{
  "calibrationPath": [
    { "x": 120, "y": 80 },
    { "x": 260, "y": 95 },
    { "x": 400, "y": 78 },
    { "x": 540, "y": 92 }
  ]
}
```

**多组路点**（3 组独立折线，各自有多个点），使用不同的字段名和 `group`：

```json
{
  "pathLine1": {
    "type": "array",
    "title": "折线1",
    "x-canvas": { "type": "pathpoint", "group": "line_1" },
    "items": { "type": "object", "properties": { "x": { "type": "number" }, "y": { "type": "number" } } },
    "default": []
  },
  "pathLine2": {
    "type": "array",
    "title": "折线2",
    "x-canvas": { "type": "pathpoint", "group": "line_2" },
    "items": { "type": "object", "properties": { "x": { "type": "number" }, "y": { "type": "number" } } },
    "default": []
  },
  "pathLine3": {
    "type": "array",
    "title": "折线3",
    "x-canvas": { "type": "pathpoint", "group": "line_3" },
    "items": { "type": "object", "properties": { "x": { "type": "number" }, "y": { "type": "number" } } },
    "default": []
  }
}
```

#### 3.3.2 `roi` — ROI 多边形

相同 `group` 内的顶点按顺序构成一个封闭多边形区域。**每组可以有任意多个顶点**，顶点越多多边形越精细。

**Schema 定义**（单个 ROI）：

```json
{
  "detectionRoi": {
    "type": "array",
    "title": "检测区域",
    "description": "在图像上点击绘制多边形顶点，框定检测范围",
    "x-canvas": { "type": "roi", "group": "detect_region_1" },
    "items": {
      "type": "object",
      "properties": {
        "x": { "type": "number" },
        "y": { "type": "number" }
      }
    },
    "default": []
  }
}
```

**运行时数据**（用户点了 4 个顶点，构成矩形区域）：

```json
{
  "detectionRoi": [
    { "x": 50,  "y": 30  },
    { "x": 600, "y": 30  },
    { "x": 600, "y": 450 },
    { "x": 50,  "y": 450 }
  ]
}
```

**多组 ROI**（包含区域 + 排除区域），使用不同字段名和 `group`：

```json
{
  "roiInclude": {
    "type": "array",
    "title": "检测区域",
    "x-canvas": { "type": "roi", "group": "include_zone" },
    "items": { "type": "object", "properties": { "x": { "type": "number" }, "y": { "type": "number" } } },
    "default": []
  },
  "roiExclude": {
    "type": "array",
    "title": "排除区域",
    "x-canvas": { "type": "roi", "group": "exclude_zone" },
    "items": { "type": "object", "properties": { "x": { "type": "number" }, "y": { "type": "number" } } },
    "default": []
  }
}
```

---

## 4. 导出行为说明

| 导出按钮 | 导出内容 | 说明 |
|---------|---------|------|
| **Export Config** | 表单参数 + 画布数据 | 包含用户填写的所有表单字段和图上绘制的路点/ROI；**不包含**算法结果（`x-readonly` 字段） |
| **Export Result** | 算法结果数据 | 仅包含算法运行产生的 `x-readonly` 字段数据 |
| **Export Schema** | 完整 Schema 文件 | 导出当前加载的 JSON Schema 原文（含所有 `x-*` 扩展属性定义） |

---

## 5. 完整示例

以下是一个包含全部特性的完整 Schema 示例：

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "边缘检测算法配置",
  "properties": {
    "detection": {
      "type": "object",
      "title": "检测参数",
      "x-column": "detection",
      "properties": {
        "enabled": {
          "type": "boolean",
          "title": "启用检测",
          "default": true
        },
        "algorithm": {
          "type": "string",
          "title": "检测算法",
          "enum": ["Canny", "Sobel"],
          "default": "Canny"
        },
        "threshold": {
          "type": "number",
          "title": "检测阈值",
          "minimum": 0,
          "maximum": 255,
          "default": 100
        },
        "calibrationPath": {
          "type": "array",
          "title": "标定路点",
          "description": "在图像上点击绘制，形成标定折线",
          "x-canvas": { "type": "pathpoint", "group": "calib_main" },
          "items": {
            "type": "object",
            "properties": {
              "x": { "type": "number" },
              "y": { "type": "number" }
            }
          },
          "default": []
        },
        "roi": {
          "type": "array",
          "title": "检测区域",
          "description": "在图像上圈定检测范围",
          "x-canvas": { "type": "roi", "group": "main_roi" },
          "items": {
            "type": "object",
            "properties": {
              "x": { "type": "number" },
              "y": { "type": "number" }
            }
          },
          "default": []
        }
      }
    },
    "quality": {
      "type": "array",
      "title": "QA参数",
      "x-column": "quality",
      "items": {
        "type": "object",
        "title": "规则",
        "properties": {
          "nominalValue": {
            "type": "number",
            "title": "理论值",
            "default": 0
          },
          "upperLimit": {
            "type": "number",
            "title": "上限",
            "default": 0
          },
          "lowerLimit": {
            "type": "number",
            "title": "下限",
            "default": 0
          },
          "unit": {
            "type": "string",
            "title": "单位",
            "enum": ["mm", "cm", "inch", "px"],
            "default": "mm"
          }
        }
      },
      "default": [
        { "nominalValue": 100.0, "upperLimit": 100.1, "lowerLimit": 99.9, "unit": "mm" }
      ]
    },
    "result": {
      "type": "object",
      "title": "结果显示",
      "x-column": "result",
      "x-readonly": true,
      "properties": {
        "measuredValue": {
          "type": "number",
          "title": "测量值 (mm)"
        },
        "verdict": {
          "type": "string",
          "title": "判定结果",
          "enum": ["合格", "不合格", "待检测"],
          "default": "待检测"
        }
      }
    }
  }
}
```

---

## 附录：x-canvas 字段数据结构

画布字段在导出的 JSON 配置中，以坐标点数组的形式存储：

```json
{
  "detection": {
    "enabled": true,
    "threshold": 100,
    "calibrationPath": [
      { "x": 120, "y": 80 },
      { "x": 340, "y": 95 },
      { "x": 560, "y": 78 }
    ],
    "roi": [
      { "x": 50,  "y": 30 },
      { "x": 600, "y": 30 },
      { "x": 600, "y": 450 },
      { "x": 50,  "y": 450 }
    ]
  }
}
```

算法读取配置时，直接从对应字段名取出坐标数组即可，无需感知 `x-canvas` 扩展属性。
