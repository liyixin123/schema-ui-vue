import type { JsonSchema } from '../types/schema'

export function readJsonFile(file: File): Promise<JsonSchema> {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.json')) {
      reject(new Error('Only .json files are supported'))
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result
        if (typeof text !== 'string') {
          reject(new Error('Failed to read file content'))
          return
        }
        const parsed = JSON.parse(text) as JsonSchema
        resolve(parsed)
      } catch {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

export async function downloadJson(data: unknown, filename: string): Promise<void> {
  const json = JSON.stringify(data, null, 2)
  const safeFilename = filename.endsWith('.json') ? filename : `${filename}.json`

  if (isTauri()) {
    const { save } = await import(/* @vite-ignore */ '@tauri-apps/plugin-dialog')
    const { writeTextFile } = await import(/* @vite-ignore */ '@tauri-apps/plugin-fs')
    const path = await save({
      defaultPath: safeFilename,
      filters: [{ name: 'JSON', extensions: ['json'] }],
    })
    if (path) {
      await writeTextFile(path, json)
    }
  } else {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = safeFilename
    anchor.click()
    URL.revokeObjectURL(url)
  }
}
