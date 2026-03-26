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

/**
 * Deep-merges source into a clone of target.
 * Source values take priority; nested objects are merged recursively.
 * Arrays are replaced (not merged).
 */
export function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!source) return deepClone(target)
  const result = deepClone(target)
  for (const key of Object.keys(source)) {
    const sv = source[key]
    const tv = result[key]
    if (
      sv !== null &&
      typeof sv === 'object' &&
      !Array.isArray(sv) &&
      tv !== null &&
      typeof tv === 'object' &&
      !Array.isArray(tv)
    ) {
      result[key] = deepMerge(
        tv as Record<string, unknown>,
        sv as Record<string, unknown>,
      )
    } else {
      result[key] = deepClone(sv as Record<string, unknown>)
    }
  }
  return result
}
