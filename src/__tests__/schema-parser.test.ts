import { describe, it, expect } from 'vitest'
import { parseSchema } from '../utils/schema-parser'
import type { JsonSchema } from '../types/schema'

describe('parseSchema', () => {
  it('returns empty array for non-object schema', () => {
    expect(parseSchema({ type: 'string' })).toEqual([])
    expect(parseSchema({ type: 'object' })).toEqual([])
    expect(parseSchema({})).toEqual([])
  })

  it('maps string type to text control', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { name: { type: 'string', title: 'Name' } },
    }
    const fields = parseSchema(schema)
    expect(fields).toHaveLength(1)
    expect(fields[0].controlType).toBe('text')
    expect(fields[0].label).toBe('Name')
    expect(fields[0].key).toBe('name')
    expect(fields[0].path).toBe('name')
  })

  it('maps boolean type to checkbox control', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { enabled: { type: 'boolean' } },
    }
    const fields = parseSchema(schema)
    expect(fields[0].controlType).toBe('checkbox')
  })

  it('maps number type to number control', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        count: { type: 'number' },
        age: { type: 'integer' },
      },
    }
    const fields = parseSchema(schema)
    expect(fields[0].controlType).toBe('number')
    expect(fields[1].controlType).toBe('number')
  })

  it('maps string+enum to select control', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        env: { type: 'string', enum: ['dev', 'prod'] },
      },
    }
    const fields = parseSchema(schema)
    expect(fields[0].controlType).toBe('select')
    expect(fields[0].options).toEqual([
      { label: 'dev', value: 'dev' },
      { label: 'prod', value: 'prod' },
    ])
  })

  it('maps string+format:textarea to textarea control', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { notes: { type: 'string', format: 'textarea' } },
    }
    const fields = parseSchema(schema)
    expect(fields[0].controlType).toBe('textarea')
  })

  it('marks required fields', () => {
    const schema: JsonSchema = {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
      },
    }
    const fields = parseSchema(schema)
    const nameField = fields.find((f) => f.key === 'name')
    const emailField = fields.find((f) => f.key === 'email')
    expect(nameField?.required).toBe(true)
    expect(emailField?.required).toBe(false)
  })

  it('recursively parses nested object', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        db: {
          type: 'object',
          title: 'Database',
          properties: {
            host: { type: 'string' },
            port: { type: 'integer' },
          },
        },
      },
    }
    const fields = parseSchema(schema)
    expect(fields[0].controlType).toBe('group')
    expect(fields[0].children).toHaveLength(2)
    expect(fields[0].children![0].path).toBe('db.host')
    expect(fields[0].children![1].path).toBe('db.port')
  })

  it('uses key as label when title is absent', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { myField: { type: 'string' } },
    }
    const fields = parseSchema(schema)
    expect(fields[0].label).toBe('myField')
  })

  it('maps array type to array control', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        tags: { type: 'array', items: { type: 'string' } },
      },
    }
    const fields = parseSchema(schema)
    expect(fields[0].controlType).toBe('array')
    expect(fields[0].itemType).toBe('string')
  })

  it('maps array of integers to array control with number itemType', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        ports: { type: 'array', items: { type: 'integer' } },
      },
    }
    const fields = parseSchema(schema)
    expect(fields[0].controlType).toBe('array')
    expect(fields[0].itemType).toBe('number')
  })

  it('defaults itemType to string when items schema is absent', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        list: { type: 'array' },
      },
    }
    const fields = parseSchema(schema)
    expect(fields[0].controlType).toBe('array')
    expect(fields[0].itemType).toBeUndefined()
  })

  it('copies constraints (minimum, maximum)', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        port: { type: 'integer', minimum: 1, maximum: 65535 },
      },
    }
    const fields = parseSchema(schema)
    expect(fields[0].minimum).toBe(1)
    expect(fields[0].maximum).toBe(65535)
  })

  it('sets depth=0 on root-level fields', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { name: { type: 'string' } },
    }
    const fields = parseSchema(schema)
    expect(fields[0].depth).toBe(0)
  })

  it('increments depth for nested object children', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        server: {
          type: 'object',
          properties: {
            config: {
              type: 'object',
              properties: {
                timeout: { type: 'integer' },
              },
            },
          },
        },
      },
    }
    const fields = parseSchema(schema)
    expect(fields[0].depth).toBe(0)
    expect(fields[0].children![0].depth).toBe(1)
    expect(fields[0].children![0].children![0].depth).toBe(2)
  })

  it('maps array of objects to object-array control', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              value: { type: 'integer' },
            },
          },
        },
      },
    }
    const fields = parseSchema(schema)
    expect(fields[0].controlType).toBe('object-array')
    expect(fields[0].itemType).toBe('object')
    expect(fields[0].itemSchema).toHaveLength(2)
    expect(fields[0].itemSchema![0].key).toBe('name')
    expect(fields[0].itemSchema![1].key).toBe('value')
  })

  it('itemSchema fields start at depth=0', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: { label: { type: 'string' } },
          },
        },
      },
    }
    const fields = parseSchema(schema)
    expect(fields[0].itemSchema![0].depth).toBe(0)
  })

  it('primitive arrays remain array control even with items schema', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        tags: { type: 'array', items: { type: 'string' } },
      },
    }
    const fields = parseSchema(schema)
    expect(fields[0].controlType).toBe('array')
  })

  it('parses x-readonly on a field', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        result: { type: 'object', 'x-readonly': true, properties: { val: { type: 'number' } } },
      },
    }
    const fields = parseSchema(schema)
    expect(fields[0].readonly).toBe(true)
  })

  it('propagates x-readonly to children', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        result: {
          type: 'object',
          'x-readonly': true,
          properties: {
            val: { type: 'number' },
            nested: { type: 'object', properties: { x: { type: 'string' } } },
          },
        },
      },
    }
    const fields = parseSchema(schema)
    const result = fields[0]
    expect(result.readonly).toBe(true)
    expect(result.children![0].readonly).toBe(true)   // val
    expect(result.children![1].readonly).toBe(true)   // nested
    expect(result.children![1].children![0].readonly).toBe(true) // x
  })

  it('parses x-column on a field', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        detection: { type: 'object', 'x-column': 'detection', properties: {} },
      },
    }
    const fields = parseSchema(schema)
    expect(fields[0].column).toBe('detection')
  })

  it('non-readonly fields have readonly undefined', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { name: { type: 'string' } },
    }
    const fields = parseSchema(schema)
    expect(fields[0].readonly).toBeUndefined()
  })
})
