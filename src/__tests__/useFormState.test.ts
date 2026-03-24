import { describe, it, expect } from 'vitest'
import { useFormState } from '../composables/useFormState'
import type { JsonSchema } from '../types/schema'

const sampleSchema: JsonSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', default: 'Alice' },
    port: { type: 'integer', default: 8080 },
    db: {
      type: 'object',
      properties: {
        host: { type: 'string', default: 'localhost' },
      },
    },
  },
}

describe('useFormState', () => {
  it('initializes config from schema defaults', () => {
    const { config, initFromSchema } = useFormState()
    initFromSchema(sampleSchema)
    expect(config.value).toEqual({
      name: 'Alice',
      port: 8080,
      db: { host: 'localhost' },
    })
  })

  it('sets a top-level value immutably', () => {
    const { config, initFromSchema, setValue } = useFormState()
    initFromSchema(sampleSchema)
    const before = config.value
    setValue('name', 'Bob')
    expect(config.value.name).toBe('Bob')
    expect(before.name).toBe('Alice') // original snapshot unchanged
  })

  it('sets a nested value immutably', () => {
    const { config, initFromSchema, setValue } = useFormState()
    initFromSchema(sampleSchema)
    setValue('db.host', '10.0.0.1')
    expect((config.value.db as { host: string }).host).toBe('10.0.0.1')
  })

  it('gets a nested value', () => {
    const { initFromSchema, getValue } = useFormState()
    initFromSchema(sampleSchema)
    expect(getValue('db.host')).toBe('localhost')
  })

  it('resets config back to schema defaults', () => {
    const { config, initFromSchema, setValue, reset } = useFormState()
    initFromSchema(sampleSchema)
    setValue('name', 'Bob')
    reset(sampleSchema)
    expect(config.value.name).toBe('Alice')
  })
})
