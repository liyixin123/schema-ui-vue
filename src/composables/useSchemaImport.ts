import { ref } from 'vue'
import type { JsonSchema } from '../types/schema'
import type { FormFieldDescriptor } from '../types/form'
import { parseSchema } from '../utils/schema-parser'
import { readJsonFile } from '../utils/file-io'

export function useSchemaImport() {
  const schema = ref<JsonSchema | null>(null)
  const fields = ref<FormFieldDescriptor[]>([])
  const schemaTitle = ref<string>('')
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  async function importFile(file: File): Promise<void> {
    error.value = null
    isLoading.value = true
    try {
      const parsed = await readJsonFile(file)
      schema.value = parsed
      fields.value = parseSchema(parsed)
      schemaTitle.value = parsed.title ?? file.name.replace('.json', '')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to import schema'
      schema.value = null
      fields.value = []
      schemaTitle.value = ''
    } finally {
      isLoading.value = false
    }
  }

  function reset(): void {
    schema.value = null
    fields.value = []
    schemaTitle.value = ''
    error.value = null
  }

  return { schema, fields, schemaTitle, error, isLoading, importFile, reset }
}
