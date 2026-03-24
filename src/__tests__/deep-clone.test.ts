import { describe, it, expect } from 'vitest'
import { deepClone, setNestedValue, getNestedValue } from '../utils/deep-clone'

describe('deepClone', () => {
  it('clones primitives', () => {
    expect(deepClone(42)).toBe(42)
    expect(deepClone('hello')).toBe('hello')
    expect(deepClone(null)).toBeNull()
    expect(deepClone(true)).toBe(true)
  })

  it('deep clones an object without sharing references', () => {
    const original = { a: 1, b: { c: 2 } }
    const cloned = deepClone(original)
    expect(cloned).toEqual(original)
    expect(cloned).not.toBe(original)
    expect(cloned.b).not.toBe(original.b)
  })

  it('deep clones arrays', () => {
    const original = [1, { x: 2 }, [3]]
    const cloned = deepClone(original)
    expect(cloned).toEqual(original)
    expect(cloned[1]).not.toBe(original[1])
  })
})

describe('setNestedValue', () => {
  it('sets a top-level key', () => {
    const obj = { a: 1, b: 2 }
    const result = setNestedValue(obj, 'a', 99)
    expect(result).toEqual({ a: 99, b: 2 })
    expect(obj.a).toBe(1) // original not mutated
  })

  it('sets a nested key', () => {
    const obj = { db: { host: 'localhost', port: 5432 } }
    const result = setNestedValue(obj, 'db.host', '10.0.0.1')
    expect(result).toEqual({ db: { host: '10.0.0.1', port: 5432 } })
    expect((obj.db as { host: string }).host).toBe('localhost') // original not mutated
  })

  it('creates intermediate objects when path does not exist', () => {
    const obj = {}
    const result = setNestedValue(obj, 'a.b.c', 'value')
    expect(result).toEqual({ a: { b: { c: 'value' } } })
  })

  it('does not mutate the original object', () => {
    const obj = { x: { y: 1 } }
    const result = setNestedValue(obj, 'x.y', 2)
    expect(obj.x.y).toBe(1)
    expect((result.x as { y: number }).y).toBe(2)
  })
})

describe('getNestedValue', () => {
  it('gets top-level value', () => {
    expect(getNestedValue({ a: 1 }, 'a')).toBe(1)
  })

  it('gets nested value', () => {
    expect(getNestedValue({ a: { b: { c: 42 } } }, 'a.b.c')).toBe(42)
  })

  it('returns undefined for missing path', () => {
    expect(getNestedValue({ a: 1 }, 'b.c')).toBeUndefined()
  })

  it('returns the object itself for empty path', () => {
    const obj = { a: 1 }
    expect(getNestedValue(obj, '')).toBe(obj)
  })
})
