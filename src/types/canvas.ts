/** 画布交互字段的类型 */
export type CanvasType = 'pathpoint' | 'roi'

/**
 * x-canvas 扩展属性描述符
 *
 * - pathpoint: 路点，同一 group 内相邻点依次连接形成折线段
 * - roi: ROI 多边形，同一 group 内顶点构成封闭区域
 */
export interface CanvasDescriptor {
  type: CanvasType
  /** 分组名，相同 group 的点属于同一组折线/多边形 */
  group?: string
}

/**
 * 结果中可携带的可视化点（预留扩展）
 * 算法输出时可包含此类型，直接渲染到图像上
 */
export interface DisplayPoint {
  x: number
  y: number
  color?: string
  label?: string
  [key: string]: unknown
}
