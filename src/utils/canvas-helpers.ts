import type { FormFieldDescriptor } from '../types/form'
import type { CanvasType } from '../types/canvas'

/**
 * 从字段描述符树中递归提取所有画布字段（x-canvas 标记的字段）
 */
export function extractCanvasFields(fields: FormFieldDescriptor[]): FormFieldDescriptor[] {
  return fields.flatMap((field) => {
    const result: FormFieldDescriptor[] = []
    if (field.canvas) result.push(field)
    if (field.children) result.push(...extractCanvasFields(field.children))
    return result
  })
}

/**
 * 按画布类型过滤字段描述符
 */
export function getCanvasFieldsByType(
  fields: FormFieldDescriptor[],
  type: CanvasType,
): FormFieldDescriptor[] {
  return extractCanvasFields(fields).filter((f) => f.canvas?.type === type)
}
