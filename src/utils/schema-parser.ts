import type { JsonSchema } from '../types/schema'
import type { ArrayItemType, ControlType, FormFieldDescriptor } from '../types/form'

function resolveControlType(schema: JsonSchema): ControlType {
  if (schema.type === 'boolean') return 'checkbox'
  if (schema.type === 'number' || schema.type === 'integer') return 'number'
  if (schema.type === 'object') return 'group'
  if (schema.type === 'array') {
    if (schema.items?.type === 'object') return 'object-array'
    return 'array'
  }
  if (schema.type === 'string') {
    if (Array.isArray(schema.enum) && schema.enum.length > 0) return 'select'
    if (schema.format === 'textarea') return 'textarea'
    return 'text'
  }
  return 'text'
}

function resolveItemType(schema: JsonSchema): ArrayItemType | undefined {
  if (schema.type !== 'array' || !schema.items) return undefined
  const itemsType = schema.items.type
  if (itemsType === 'object') return 'object'
  if (itemsType === 'number' || itemsType === 'integer') return 'number'
  return 'string'
}

function resolveOptions(schema: JsonSchema): FormFieldDescriptor['options'] {
  if (!Array.isArray(schema.enum)) return undefined
  return schema.enum.map((value) => ({
    label: String(value),
    value: String(value),
  }))
}

function parseField(
  key: string,
  schema: JsonSchema,
  parentPath: string,
  required: boolean,
  depth: number,
  inheritedReadonly = false,
): FormFieldDescriptor {
  const path = parentPath ? `${parentPath}.${key}` : key
  const controlType = resolveControlType(schema)
  const isReadonly = inheritedReadonly || schema['x-readonly'] === true

  const descriptor: FormFieldDescriptor = {
    key,
    path,
    label: schema.title ?? key,
    description: schema.description,
    controlType,
    required,
    defaultValue: schema.default,
    options: resolveOptions(schema),
    minimum: schema.minimum,
    maximum: schema.maximum,
    minLength: schema.minLength,
    maxLength: schema.maxLength,
    itemType: resolveItemType(schema),
    depth,
    readonly: isReadonly || undefined,
    column: schema['x-column'],
  }

  if (controlType === 'group' && schema.properties) {
    descriptor.children = parseProperties(
      schema.properties,
      schema.required ?? [],
      path,
      depth + 1,
      isReadonly,
    )
  }

  if (controlType === 'object-array' && schema.items?.properties) {
    descriptor.itemSchema = parseProperties(
      schema.items.properties,
      schema.items.required ?? [],
      '',
      0,
      isReadonly,
    )
  }

  return descriptor
}

function parseProperties(
  properties: Record<string, JsonSchema>,
  required: string[],
  parentPath: string,
  depth: number,
  inheritedReadonly = false,
): FormFieldDescriptor[] {
  return Object.entries(properties).map(([key, fieldSchema]) =>
    parseField(key, fieldSchema, parentPath, required.includes(key), depth, inheritedReadonly),
  )
}

export function parseSchema(schema: JsonSchema): FormFieldDescriptor[] {
  if (schema.type !== 'object' || !schema.properties) {
    return []
  }
  return parseProperties(schema.properties, schema.required ?? [], '', 0)
}
