import { describe, it, expect } from 'vitest'
import { useValidation } from '../composables/useValidation'
import type { JsonSchema } from '../types/schema'

const schema: JsonSchema = {
  type: 'object',
  required: ['name', 'port'],
  properties: {
    name: { type: 'string' },
    port: { type: 'integer', minimum: 1, maximum: 65535 },
  },
}

describe('useValidation', () => {
  it('returns valid for correct data', () => {
    const { result, validate } = useValidation()
    validate(schema, { name: 'server', port: 8080 })
    expect(result.value.valid).toBe(true)
    expect(result.value.errors).toHaveLength(0)
  })

  it('returns errors for missing required fields', () => {
    const { result, validate } = useValidation()
    validate(schema, {})
    expect(result.value.valid).toBe(false)
    expect(result.value.errors.length).toBeGreaterThan(0)
  })

  it('returns errors for constraint violations', () => {
    const { result, validate } = useValidation()
    validate(schema, { name: 'x', port: 99999 })
    expect(result.value.valid).toBe(false)
    const portErrors = result.value.errors.filter((e) => e.path === 'port')
    expect(portErrors.length).toBeGreaterThan(0)
  })

  it('getFieldErrors returns errors for a path', () => {
    const { validate, getFieldErrors } = useValidation()
    validate(schema, { name: 'x', port: 0 })
    const errors = getFieldErrors('port')
    expect(errors.length).toBeGreaterThan(0)
  })

  it('hasFieldError returns true when field has errors', () => {
    const { validate, hasFieldError } = useValidation()
    validate(schema, { port: 8080 })
    expect(hasFieldError('name')).toBe(true)
    expect(hasFieldError('port')).toBe(false)
  })

  it('clearErrors resets result', () => {
    const { result, validate, clearErrors } = useValidation()
    validate(schema, {})
    clearErrors()
    expect(result.value.valid).toBe(true)
    expect(result.value.errors).toHaveLength(0)
  })
})
