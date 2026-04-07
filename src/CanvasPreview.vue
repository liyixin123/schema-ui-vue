<template>
  <div class="cp-wrap">
    <!-- Toolbar -->
    <div class="cp-bar">
      <button
        v-for="(field, i) in canvasFields"
        :key="field.path"
        class="cp-btn"
        :class="{ 'cp-btn--active': activeField === field.path }"
        :style="{ '--c': palette[i % palette.length] }"
        type="button"
        @click="toggleActive(field.path)"
      >
        <span class="cp-btn-icon">{{ field.canvas?.type === 'roi' ? '▲' : '◉' }}</span>
        {{ field.label }}
        <span class="cp-count">({{ getPoints(field.path).length }})</span>
      </button>
      <template v-if="activeField">
        <button class="cp-btn cp-btn--action" type="button" @click="undo">撤销</button>
        <button class="cp-btn cp-btn--action" type="button" @click="clearActive">清除</button>
        <button class="cp-btn cp-btn--dim" type="button" @click="activeField = null">取消</button>
      </template>
    </div>

    <!-- Canvas -->
    <svg
      ref="svgEl"
      class="cp-svg"
      :viewBox="`0 0 ${svgW} ${svgH}`"
      @click="handleClick"
    >
      <!-- Background -->
      <rect :width="svgW" :height="svgH" fill="#0f1117" />

      <!-- Grid pattern -->
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e2130" stroke-width="1" />
        </pattern>
      </defs>
      <rect :width="svgW" :height="svgH" fill="url(#grid)" />

      <!-- Render each canvas field -->
      <g v-for="(field, i) in canvasFields" :key="field.path">
        <template v-if="field.canvas?.type === 'pathpoint' && getPoints(field.path).length > 0">
          <!-- Connecting lines -->
          <polyline
            v-if="getPoints(field.path).length > 1"
            :points="toSvgPoints(getPoints(field.path))"
            :stroke="palette[i % palette.length]"
            stroke-width="2"
            fill="none"
            opacity="0.7"
          />
          <!-- Dots + labels -->
          <g v-for="(pt, j) in getPoints(field.path)" :key="j">
            <circle
              :cx="pt.x" :cy="pt.y" r="5"
              :fill="palette[i % palette.length]"
              stroke="#0f1117" stroke-width="1.5"
            />
            <text :x="pt.x + 7" :y="pt.y - 5" fill="white" font-size="10" font-family="monospace" opacity="0.8">
              {{ j + 1 }}
            </text>
          </g>
        </template>

        <template v-if="field.canvas?.type === 'roi' && getPoints(field.path).length > 0">
          <!-- Polygon fill (3+ pts) or line (2 pts) -->
          <polygon
            v-if="getPoints(field.path).length >= 3"
            :points="toSvgPoints(getPoints(field.path))"
            :fill="palette[i % palette.length]"
            :stroke="palette[i % palette.length]"
            fill-opacity="0.15"
            stroke-width="2"
          />
          <polyline
            v-else-if="getPoints(field.path).length === 2"
            :points="toSvgPoints(getPoints(field.path))"
            :stroke="palette[i % palette.length]"
            stroke-width="2"
            fill="none"
          />
          <!-- Vertices + labels -->
          <g v-for="(pt, j) in getPoints(field.path)" :key="j">
            <circle
              :cx="pt.x" :cy="pt.y" r="5"
              :fill="palette[i % palette.length]"
              stroke="#0f1117" stroke-width="1.5"
            />
            <text :x="pt.x + 7" :y="pt.y - 5" fill="white" font-size="10" font-family="monospace" opacity="0.8">
              {{ j + 1 }}
            </text>
          </g>
        </template>
      </g>

      <!-- Active field: dashed ring on last point -->
      <circle
        v-if="activeField && getPoints(activeField).length > 0"
        :cx="getPoints(activeField).at(-1)!.x"
        :cy="getPoints(activeField).at(-1)!.y"
        r="11"
        fill="none"
        stroke="white"
        stroke-width="1"
        stroke-dasharray="4 3"
        opacity="0.5"
      />

      <!-- Cursor hint when active but no points yet -->
      <text
        v-if="activeField && getPoints(activeField).length === 0"
        :x="svgW / 2" :y="svgH / 2"
        text-anchor="middle"
        fill="white"
        font-size="13"
        opacity="0.3"
        font-family="sans-serif"
      >
        点击此处添加点
      </text>
    </svg>

    <!-- Status hint -->
    <div class="cp-hint">
      <template v-if="activeField">
        <span class="cp-hint-dot" :style="{ background: palette[activeIndex % palette.length] }" />
        <span>{{ activeMeta?.label }}</span>
        <span class="cp-hint-sep">·</span>
        <span>{{ activeMeta?.canvas?.type === 'roi' ? 'ROI 多边形' : '路点折线' }}</span>
        <span class="cp-hint-sep">·</span>
        <span>{{ getPoints(activeField).length }} 个点</span>
        <span class="cp-hint-sep">·</span>
        <span class="cp-hint-dim">点击画布添加，右键最后一点撤销</span>
      </template>
      <span v-else class="cp-hint-dim">选择上方字段后点击画布绘制</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { FormFieldDescriptor } from 'schema-ui-vue'

interface Point { x: number; y: number }

const props = defineProps<{
  canvasFields: FormFieldDescriptor[]
  config: Record<string, unknown>
}>()

const emit = defineEmits<{
  update: [payload: { path: string; value: Point[] }]
}>()

const svgEl = ref<SVGSVGElement | null>(null)
const activeField = ref<string | null>(null)

// Track actual SVG pixel dimensions — no viewBox scaling needed
const svgW = ref(800)
const svgH = ref(240)

let ro: ResizeObserver | null = null
onMounted(() => {
  if (!svgEl.value) return
  ro = new ResizeObserver((entries) => {
    const { width, height } = entries[0].contentRect
    svgW.value = Math.round(width)
    svgH.value = Math.round(height)
  })
  ro.observe(svgEl.value)
})
onBeforeUnmount(() => ro?.disconnect())

const palette = [
  '#60a5fa', // blue
  '#34d399', // emerald
  '#fb923c', // orange
  '#f472b6', // pink
  '#a78bfa', // violet
  '#22d3ee', // cyan
]

const activeIndex = computed(() =>
  props.canvasFields.findIndex((f) => f.path === activeField.value),
)

const activeMeta = computed(() =>
  props.canvasFields.find((f) => f.path === activeField.value),
)

function toggleActive(path: string) {
  activeField.value = activeField.value === path ? null : path
}

function getPoints(path: string): Point[] {
  const parts = path.split('.')
  let obj: unknown = props.config
  for (const key of parts) {
    if (obj === null || typeof obj !== 'object') return []
    obj = (obj as Record<string, unknown>)[key]
  }
  return Array.isArray(obj) ? (obj as Point[]) : []
}

function toSvgPoints(pts: Point[]): string {
  return pts.map((p) => `${p.x},${p.y}`).join(' ')
}

function handleClick(e: MouseEvent) {
  if (!activeField.value) return
  const x = Math.round(e.offsetX)
  const y = Math.round(e.offsetY)
  emit('update', {
    path: activeField.value,
    value: [...getPoints(activeField.value), { x, y }],
  })
}

function undo() {
  if (!activeField.value) return
  const pts = getPoints(activeField.value)
  emit('update', { path: activeField.value, value: pts.slice(0, -1) })
}

function clearActive() {
  if (!activeField.value) return
  emit('update', { path: activeField.value, value: [] })
}
</script>

<style scoped>
.cp-wrap {
  display: flex;
  flex-direction: column;
  background: #0f1117;
  border-bottom: 1px solid #2a3040;
  flex-shrink: 0;
  width: 100%;
}

.cp-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #1e2130;
  border-bottom: 1px solid #2a3040;
  min-height: 44px;
}

.cp-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid var(--c, #4a5568);
  background: transparent;
  color: var(--c, #94a3b8);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.cp-btn:hover {
  background: color-mix(in srgb, var(--c, #4a5568) 15%, transparent);
}

.cp-btn--active {
  background: color-mix(in srgb, var(--c, #4a5568) 20%, transparent);
  color: var(--c);
  font-weight: 600;
}

.cp-btn--action {
  --c: #94a3b8;
  border-color: #374151;
}

.cp-btn--dim {
  --c: #6b7280;
  border-color: #374151;
}

.cp-btn-icon {
  font-size: 10px;
}

.cp-count {
  font-size: 10px;
  opacity: 0.7;
}

.cp-svg {
  width: 100%;
  height: 240px;
  display: block;
  cursor: crosshair;
}

.cp-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  color: #94a3b8;
  background: #1e2130;
  border-top: 1px solid #2a3040;
  min-height: 32px;
}

.cp-hint-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cp-hint-sep {
  opacity: 0.4;
}

.cp-hint-dim {
  opacity: 0.5;
}
</style>
