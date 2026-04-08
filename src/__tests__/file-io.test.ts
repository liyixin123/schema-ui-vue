import { describe, it, expect, vi } from 'vitest'
import { readJsonFile, downloadJson } from '../utils/file-io'

// ── readJsonFile ──────────────────────────────────────────────

describe('readJsonFile', () => {
  function makeFile(name: string, content: string): File {
    return new File([content], name, { type: 'application/json' })
  }

  it('resolves with parsed JSON for a valid .json file', async () => {
    const file = makeFile('schema.json', '{"type":"object"}')
    const result = await readJsonFile(file)
    expect(result).toEqual({ type: 'object' })
  })

  it('rejects if file extension is not .json', async () => {
    const file = makeFile('schema.yaml', '{}')
    await expect(readJsonFile(file)).rejects.toThrow('Only .json files are supported')
  })

  it('rejects if file content is invalid JSON', async () => {
    const file = makeFile('bad.json', 'not json')
    await expect(readJsonFile(file)).rejects.toThrow('Invalid JSON file')
  })

  it('rejects when FileReader encounters an error', async () => {
    const file = makeFile('schema.json', '{}')

    class MockFileReader {
      onerror: ((e: ProgressEvent<FileReader>) => void) | null = null
      onload: ((e: ProgressEvent<FileReader>) => void) | null = null
      readAsText() {
        setTimeout(() => this.onerror?.({} as ProgressEvent<FileReader>), 0)
      }
    }
    vi.stubGlobal('FileReader', MockFileReader)

    await expect(readJsonFile(file)).rejects.toThrow('Failed to read file')

    vi.unstubAllGlobals()
  })
})

// ── downloadJson ──────────────────────────────────────────────

describe('downloadJson', () => {
  it('creates an anchor element and triggers a click', async () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:fake')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })

    const clicks: string[] = []
    const origCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreate(tag)
      if (tag === 'a') {
        vi.spyOn(el, 'click').mockImplementation(() => { clicks.push('clicked') })
      }
      return el
    })

    await downloadJson({ key: 'value' }, 'output')
    expect(createObjectURL).toHaveBeenCalled()
    expect(clicks).toContain('clicked')
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:fake')

    vi.restoreAllMocks()
  })

  it('appends .json extension if missing', async () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:x')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })

    let downloadAttr = ''
    const origCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreate(tag)
      if (tag === 'a') {
        vi.spyOn(el, 'click').mockImplementation(() => {
          downloadAttr = (el as HTMLAnchorElement).download
        })
      }
      return el
    })

    await downloadJson({}, 'myfile')
    expect(downloadAttr).toBe('myfile.json')

    vi.restoreAllMocks()
  })

  it('does not double-append .json if already present', async () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:x')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })

    let downloadAttr = ''
    const origCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreate(tag)
      if (tag === 'a') {
        vi.spyOn(el, 'click').mockImplementation(() => {
          downloadAttr = (el as HTMLAnchorElement).download
        })
      }
      return el
    })

    await downloadJson({}, 'config.json')
    expect(downloadAttr).toBe('config.json')

    vi.restoreAllMocks()
  })
})
