import { describe, it, expect } from 'vitest'
import { extractDefaults } from '../utils/default-values'
import type { JsonSchema } from '../types/schema'

describe('extractDefaults', () => {
  it('returns empty object for non-object schema', () => {
    expect(extractDefaults({ type: 'string' })).toEqual({})
    expect(extractDefaults({})).toEqual({})
  })

  it('extracts explicit defaults', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', default: 'John' },
        port: { type: 'integer', default: 8080 },
        enabled: { type: 'boolean', default: true },
      },
    }
    expect(extractDefaults(schema)).toEqual({
      name: 'John',
      port: 8080,
      enabled: true,
    })
  })

  it('uses type defaults when no explicit default', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        count: { type: 'integer' },
        flag: { type: 'boolean' },
      },
    }
    expect(extractDefaults(schema)).toEqual({
      name: '',
      count: 0,
      flag: false,
    })
  })

  it('uses first enum value as default for string with enum', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        env: { type: 'string', enum: ['dev', 'prod'] },
      },
    }
    expect(extractDefaults(schema)).toEqual({ env: 'dev' })
  })

  it('returns empty array as default for array type', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        tags: { type: 'array', items: { type: 'string' } },
      },
    }
    expect(extractDefaults(schema)).toEqual({ tags: [] })
  })

  it('returns explicit array default when provided', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        hosts: { type: 'array', items: { type: 'string' }, default: ['localhost'] },
      },
    }
    expect(extractDefaults(schema)).toEqual({ hosts: ['localhost'] })
  })

  it('recursively extracts defaults for nested objects', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        db: {
          type: 'object',
          properties: {
            host: { type: 'string', default: 'localhost' },
            port: { type: 'integer', default: 5432 },
          },
        },
      },
    }
    expect(extractDefaults(schema)).toEqual({
      db: { host: 'localhost', port: 5432 },
    })
  })
})
