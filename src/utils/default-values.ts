import type { JsonSchema } from '../types/schema'

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
