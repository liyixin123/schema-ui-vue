export { default as AutoConfigForm } from './components/AutoConfigForm.vue'

export type { JsonSchema, JsonSchemaType } from './types/schema'
export type { ControlType, ArrayItemType, FormFieldDescriptor } from './types/form'
export type { ValidationResult, ValidationError } from './types/validation'

// Utility exports for advanced use cases
export { parseSchema } from './utils/schema-parser'
export { extractDefaults } from './utils/default-values'
