import { ref } from 'vue'
import type { JsonSchema } from '../types/schema'
import { extractDefaults } from '../utils/default-values'
import { setNestedValue, getNestedValue } from '../utils/deep-clone'

export function useFormState() {
  const config = ref<Record<string, unknown>>({})

  function initFromSchema(schema: JsonSchema): void {
    config.value = extractDefaults(schema)
  }

  function setValue(path: string, value: unknown): void {
    config.value = setNestedValue(config.value, path, value)
  }

  function getValue(path: string): unknown {
    return getNestedValue(config.value, path)
  }

  function reset(schema: JsonSchema): void {
    config.value = extractDefaults(schema)
  }

  return { config, initFromSchema, setValue, getValue, reset }
}
