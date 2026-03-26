import { describe, it, expect } from 'vitest'
import { extractDefaults, buildDefaultFromDescriptors } from '../utils/default-values'
import type { JsonSchema } from '../types/schema'
import type { FormFieldDescriptor } from '../types/form'

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

describe('buildDefaultFromDescriptors', () => {
  it('creates defaults from simple descriptors', () => {
    const fields: FormFieldDescriptor[] = [
      { key: 'name', path: 'name', label: 'Name', controlType: 'text', required: false },
      { key: 'count', path: 'count', label: 'Count', controlType: 'number', required: false },
      { key: 'active', path: 'active', label: 'Active', controlType: 'checkbox', required: false },
    ]
    expect(buildDefaultFromDescriptors(fields)).toEqual({ name: '', count: 0, active: false })
  })

  it('uses explicit defaultValue when present', () => {
    const fields: FormFieldDescriptor[] = [
      { key: 'host', path: 'host', label: 'Host', controlType: 'text', required: false, defaultValue: 'localhost' },
    ]
    expect(buildDefaultFromDescriptors(fields)).toEqual({ host: 'localhost' })
  })

  it('uses first option value for select control', () => {
    const fields: FormFieldDescriptor[] = [
      {
        key: 'env', path: 'env', label: 'Env', controlType: 'select', required: false,
        options: [{ label: 'Dev', value: 'dev' }, { label: 'Prod', value: 'prod' }],
      },
    ]
    expect(buildDefaultFromDescriptors(fields)).toEqual({ env: 'dev' })
  })

  it('creates empty array for array control', () => {
    const fields: FormFieldDescriptor[] = [
      { key: 'tags', path: 'tags', label: 'Tags', controlType: 'array', required: false },
    ]
    expect(buildDefaultFromDescriptors(fields)).toEqual({ tags: [] })
  })

  it('creates empty array for object-array control', () => {
    const fields: FormFieldDescriptor[] = [
      { key: 'items', path: 'items', label: 'Items', controlType: 'object-array', required: false },
    ]
    expect(buildDefaultFromDescriptors(fields)).toEqual({ items: [] })
  })

  it('recursively creates defaults for group controls', () => {
    const fields: FormFieldDescriptor[] = [
      {
        key: 'db', path: 'db', label: 'DB', controlType: 'group', required: false,
        children: [
          { key: 'host', path: 'db.host', label: 'Host', controlType: 'text', required: false, defaultValue: 'localhost' },
          { key: 'port', path: 'db.port', label: 'Port', controlType: 'number', required: false, defaultValue: 5432 },
        ],
      },
    ]
    expect(buildDefaultFromDescriptors(fields)).toEqual({ db: { host: 'localhost', port: 5432 } })
  })
})
