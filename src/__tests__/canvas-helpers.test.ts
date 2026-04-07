import { describe, it, expect } from 'vitest'
import { extractCanvasFields, getCanvasFieldsByType } from '../utils/canvas-helpers'
import type { FormFieldDescriptor } from '../types/form'

const makeField = (
  key: string,
  overrides: Partial<FormFieldDescriptor> = {},
): FormFieldDescriptor => ({
  key,
  path: key,
  label: key,
  controlType: 'array',
  required: false,
  ...overrides,
})

describe('extractCanvasFields', () => {
  it('returns empty array when no canvas fields exist', () => {
    const fields: FormFieldDescriptor[] = [
      makeField('threshold', { controlType: 'number' }),
      makeField('enabled', { controlType: 'checkbox' }),
    ]
    expect(extractCanvasFields(fields)).toEqual([])
  })

  it('extracts top-level canvas fields', () => {
    const roi = makeField('roi', { canvas: { type: 'roi', group: 'g1' } })
    const path = makeField('calibPath', { canvas: { type: 'pathpoint', group: 'c1' } })
    const normal = makeField('threshold', { controlType: 'number' })
    const fields = [roi, path, normal]
    const result = extractCanvasFields(fields)
    expect(result).toHaveLength(2)
    expect(result[0].key).toBe('roi')
    expect(result[1].key).toBe('calibPath')
  })

  it('recursively extracts canvas fields from group children', () => {
    const childCanvas = makeField('roi', { canvas: { type: 'roi', group: 'nested' } })
    const group = makeField('detection', {
      controlType: 'group',
      children: [
        makeField('threshold', { controlType: 'number' }),
        childCanvas,
      ],
    })
    const result = extractCanvasFields([group])
    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('roi')
  })

  it('does not mutate the original fields array', () => {
    const fields = [makeField('roi', { canvas: { type: 'roi' } })]
    const original = [...fields]
    extractCanvasFields(fields)
    expect(fields).toEqual(original)
  })
})

describe('getCanvasFieldsByType', () => {
  const roi1 = makeField('roi1', { canvas: { type: 'roi', group: 'a' } })
  const roi2 = makeField('roi2', { canvas: { type: 'roi', group: 'b' } })
  const path1 = makeField('path1', { canvas: { type: 'pathpoint', group: 'p1' } })
  const normal = makeField('threshold', { controlType: 'number' })
  const fields = [roi1, roi2, path1, normal]

  it('filters by roi type', () => {
    const result = getCanvasFieldsByType(fields, 'roi')
    expect(result).toHaveLength(2)
    expect(result.map((f) => f.key)).toEqual(['roi1', 'roi2'])
  })

  it('filters by pathpoint type', () => {
    const result = getCanvasFieldsByType(fields, 'pathpoint')
    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('path1')
  })

  it('returns empty array when no matching type', () => {
    const result = getCanvasFieldsByType([normal], 'roi')
    expect(result).toEqual([])
  })
})
