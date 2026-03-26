import type { JsonSchema } from '../types/schema'
import type { FormFieldDescriptor } from '../types/form'

type ConfigValue = string | number | boolean | null | Record<string, unknown>

export function extractDefaults(schema: JsonSchema): Record<string, unknown> {
  if (schema.type !== 'object' || !schema.properties) return {}

  return Object.entries(schema.properties).reduce<Record<string, unknown>>((acc, [key, fieldSchema]) => {
    if (fieldSchema.type === 'object') {
      return { ...acc, [key]: extractDefaults(fieldSchema) }
    }
    if (fieldSchema.default !== undefined) {
      return { ...acc, [key]: fieldSchema.default }
    }
    return { ...acc, [key]: getTypeDefault(fieldSchema) }
  }, {})
}

function getTypeDefault(schema: JsonSchema): ConfigValue | unknown[] {
  if (schema.type === 'boolean') return false
  if (schema.type === 'number' || schema.type === 'integer') return 0
  if (schema.type === 'array') return []
  if (schema.type === 'string') {
    if (Array.isArray(schema.enum) && schema.enum.length > 0) return String(schema.enum[0])
    return ''
  }
  return null
}

export function buildDefaultFromDescriptors(fields: FormFieldDescriptor[]): Record<string, unknown> {
  return fields.reduce<Record<string, unknown>>((acc, field) => {
    if (field.controlType === 'group' && field.children) {
      return { ...acc, [field.key]: buildDefaultFromDescriptors(field.children) }
    }
    if (field.controlType === 'object-array') {
      return { ...acc, [field.key]: [] }
    }
    if (field.defaultValue !== undefined) {
      return { ...acc, [field.key]: field.defaultValue }
    }
    const fallback = getDescriptorDefault(field)
    return { ...acc, [field.key]: fallback }
  }, {})
}

function getDescriptorDefault(field: FormFieldDescriptor): ConfigValue | unknown[] {
  switch (field.controlType) {
    case 'checkbox': return false
    case 'number': return 0
    case 'array': return []
    case 'select': return field.options?.[0]?.value ?? ''
    default: return ''
  }
}

/**
 * Returns a new config object with all readonly field paths removed.
 * Used to ensure v-model and exports never include readonly data.
 */
export function stripReadonlyPaths(
  config: Record<string, unknown>,
  fields: FormFieldDescriptor[],
): Record<string, unknown> {
  return fields.reduce<Record<string, unknown>>((acc, field) => {
    if (field.readonly) return acc  // drop entire readonly subtree
    if (field.controlType === 'group' && field.children) {
      const nested = config[field.key]
      const stripped = stripReadonlyPaths(
        (nested as Record<string, unknown>) ?? {},
        field.children,
      )
      return { ...acc, [field.key]: stripped }
    }
    if (field.key in config) {
      return { ...acc, [field.key]: config[field.key] }
    }
    return acc
  }, {})
}
