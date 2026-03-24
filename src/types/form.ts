export type ControlType = 'text' | 'number' | 'checkbox' | 'select' | 'textarea' | 'group' | 'array'

export type ArrayItemType = 'string' | 'number'

export interface FormFieldDescriptor {
  key: string
  path: string
  label: string
  description?: string
  controlType: ControlType
  required: boolean
  defaultValue?: unknown
  options?: Array<{ label: string; value: string }>
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  children?: FormFieldDescriptor[]
  itemType?: ArrayItemType
}
