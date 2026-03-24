export function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(deepClone) as unknown as T
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, deepClone(v)])
  ) as T
}

/**
 * Returns a new object with the value at the given dot-separated path updated.
 * Never mutates the original object.
 */
export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const parts = path.split('.')
  return setAtPath(obj, parts, value) as Record<string, unknown>
}

function setAtPath(
  obj: unknown,
  parts: string[],
  value: unknown,
): unknown {
  if (parts.length === 0) return value

  const [head, ...tail] = parts
  const current = (obj as Record<string, unknown> | null) ?? {}
  const nested = setAtPath((current as Record<string, unknown>)[head], tail, value)

  return { ...(current as Record<string, unknown>), [head]: nested }
}

/**
 * Gets a nested value by dot-separated path.
 */
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  if (!path) return obj
  return path.split('.').reduce<unknown>((curr, key) => {
    if (curr === null || curr === undefined) return undefined
    return (curr as Record<string, unknown>)[key]
  }, obj)
}
