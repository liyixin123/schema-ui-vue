import type { CanvasDescriptor } from './canvas'

export type JsonSchemaType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null'

export interface JsonSchema {
  $schema?: string
  title?: string
  description?: string
  type?: JsonSchemaType | JsonSchemaType[]
  properties?: Record<string, JsonSchema>
  required?: string[]
  enum?: unknown[]
  format?: string
  default?: unknown
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  items?: JsonSchema
  additionalProperties?: boolean | JsonSchema
  'x-readonly'?: boolean
  'x-column'?: string
  'x-canvas'?: CanvasDescriptor | boolean
}
