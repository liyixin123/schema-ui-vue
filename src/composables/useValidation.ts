import { ref } from 'vue'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import type { JsonSchema } from '../types/schema'
import type { ValidationResult, ValidationError } from '../types/validation'

const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)

function normalizeErrorPath(instancePath: string): string {
  // Convert "/db/host" → "db.host", "" → ""
  return instancePath.replace(/^\//, '').replace(/\//g, '.')
}

export function useValidation() {
  const result = ref<ValidationResult>({ valid: true, errors: [] })

  function validate(schema: JsonSchema, data: Record<string, unknown>): ValidationResult {
    const validate = ajv.compile(schema)
    const valid = validate(data) as boolean

    if (valid) {
      result.value = { valid: true, errors: [] }
      return result.value
    }

    const errors: ValidationError[] = (validate.errors ?? []).map((err) => {
      // required errors: instancePath is "" and missingProperty is in params
      const path =
        err.keyword === 'required' && err.params?.missingProperty
          ? err.params.missingProperty as string
          : normalizeErrorPath(err.instancePath)
      return { path, message: err.message ?? 'Invalid value' }
    })

    result.value = { valid: false, errors }
    return result.value
  }

  function getFieldErrors(path: string): ValidationError[] {
    return result.value.errors.filter((e) => e.path === path)
  }

  function hasFieldError(path: string): boolean {
    return result.value.errors.some((e) => e.path === path)
  }

  function clearErrors(): void {
    result.value = { valid: true, errors: [] }
  }

  return { result, validate, getFieldErrors, hasFieldError, clearErrors }
}
