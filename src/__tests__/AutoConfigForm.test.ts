import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AutoConfigForm from '../components/AutoConfigForm.vue'
import type { JsonSchema } from '../types/schema'

const simpleSchema: JsonSchema = {
  type: 'object',
  title: 'Test Config',
  required: ['name'],
  properties: {
    name: { type: 'string', title: 'Name', default: 'Alice' },
    port: { type: 'integer', title: 'Port', default: 8080 },
    enabled: { type: 'boolean', title: 'Enabled', default: false },
  },
}

describe('AutoConfigForm', () => {
  it('renders form fields when schema prop is provided', async () => {
    const wrapper = mount(AutoConfigForm, {
      props: { schema: simpleSchema },
    })
    await flushPromises()
    // Should render an input for each leaf field
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThanOrEqual(3)
  })

  it('emits update:modelValue with defaults on schema mount', async () => {
    const wrapper = mount(AutoConfigForm, {
      props: { schema: simpleSchema },
    })
    await flushPromises()
    const emits = wrapper.emitted('update:modelValue')
    expect(emits).toBeTruthy()
    const lastEmit = emits![emits!.length - 1][0] as Record<string, unknown>
    expect(lastEmit.name).toBe('Alice')
    expect(lastEmit.port).toBe(8080)
  })

  it('emits update:modelValue when a field value changes', async () => {
    const wrapper = mount(AutoConfigForm, {
      props: { schema: simpleSchema },
    })
    await flushPromises()
    const nameInput = wrapper.find('input[type="text"]')
    await nameInput.setValue('Bob')
    const emits = wrapper.emitted('update:modelValue')!
    const last = emits[emits.length - 1][0] as Record<string, unknown>
    expect(last.name).toBe('Bob')
  })

  it('accepts modelValue prop and uses it as initial config', async () => {
    const wrapper = mount(AutoConfigForm, {
      props: {
        schema: simpleSchema,
        modelValue: { name: 'External', port: 3000, enabled: true },
      },
    })
    await flushPromises()
    const emits = wrapper.emitted('update:modelValue')!
    const last = emits[emits.length - 1][0] as Record<string, unknown>
    expect(last.name).toBe('External')
    expect(last.port).toBe(3000)
  })

  it('re-initializes when schema prop changes', async () => {
    const wrapper = mount(AutoConfigForm, {
      props: { schema: simpleSchema },
    })
    await flushPromises()
    const newSchema: JsonSchema = {
      type: 'object',
      properties: {
        host: { type: 'string', default: 'localhost' },
      },
    }
    await wrapper.setProps({ schema: newSchema })
    await flushPromises()
    const emits = wrapper.emitted('update:modelValue')!
    const last = emits[emits.length - 1][0] as Record<string, unknown>
    expect(last).toHaveProperty('host', 'localhost')
    expect(last).not.toHaveProperty('name')
  })

  it('exposes validate() method', async () => {
    const wrapper = mount(AutoConfigForm, {
      props: { schema: simpleSchema },
    })
    await flushPromises()
    const vm = wrapper.vm as unknown as { validate: () => { valid: boolean; errors: unknown[] } }
    const result = vm.validate()
    expect(result).toHaveProperty('valid')
    expect(result).toHaveProperty('errors')
  })

  it('exposes reset() method and emits defaults', async () => {
    const wrapper = mount(AutoConfigForm, {
      props: { schema: simpleSchema },
    })
    await flushPromises()
    // Change a field
    const nameInput = wrapper.find('input[type="text"]')
    await nameInput.setValue('Changed')
    // Reset
    const vm = wrapper.vm as unknown as { reset: () => void }
    vm.reset()
    await flushPromises()
    const emits = wrapper.emitted('update:modelValue')!
    const last = emits[emits.length - 1][0] as Record<string, unknown>
    expect(last.name).toBe('Alice')
  })

  it('does not render toolbar by default', async () => {
    const wrapper = mount(AutoConfigForm, {
      props: { schema: simpleSchema },
    })
    await flushPromises()
    expect(wrapper.find('.toolbar').exists()).toBe(false)
  })

  it('renders toolbar when showToolbar is true', async () => {
    const wrapper = mount(AutoConfigForm, {
      props: { schema: simpleSchema, showToolbar: true },
    })
    await flushPromises()
    expect(wrapper.find('.toolbar').exists()).toBe(true)
  })

  it('does not render preview by default', async () => {
    const wrapper = mount(AutoConfigForm, {
      props: { schema: simpleSchema },
    })
    await flushPromises()
    expect(wrapper.find('.acf-preview').exists()).toBe(false)
  })

  it('renders preview when showPreview is true', async () => {
    const wrapper = mount(AutoConfigForm, {
      props: { schema: simpleSchema, showPreview: true },
    })
    await flushPromises()
    expect(wrapper.find('.acf-preview').exists()).toBe(true)
  })

  it('fetches schema from schemaUrl', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => simpleSchema,
    } as Response))

    const wrapper = mount(AutoConfigForm, {
      props: { schemaUrl: '/fake/schema.json' },
    })
    await flushPromises()

    const emits = wrapper.emitted('update:modelValue')
    expect(emits).toBeTruthy()
    expect(fetch).toHaveBeenCalledWith('/fake/schema.json')
  })

  it('shows error message when schemaUrl fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    } as Response))

    const wrapper = mount(AutoConfigForm, {
      props: { schemaUrl: '/missing.json' },
    })
    await flushPromises()
    expect(wrapper.find('.acf-error').exists()).toBe(true)
  })
})
