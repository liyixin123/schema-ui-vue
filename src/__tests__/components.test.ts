import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ConfigPreview from '../components/ConfigPreview.vue'
import ConfigToolbar from '../components/ConfigToolbar.vue'
import FieldGroup from '../components/FieldGroup.vue'
import FieldWrapper from '../components/FieldWrapper.vue'
import FormRenderer from '../components/FormRenderer.vue'
import type { FormFieldDescriptor } from '../types/form'
import type { ValidationResult } from '../types/validation'

// ── ConfigPreview ─────────────────────────────────────────────

describe('ConfigPreview', () => {
  it('renders formatted JSON', () => {
    const wrapper = mount(ConfigPreview, { props: { config: { a: 1 } } })
    expect(wrapper.find('code').text()).toContain('"a": 1')
  })

  it('copies JSON to clipboard on button click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    const wrapper = mount(ConfigPreview, { props: { config: { x: 42 } } })
    await wrapper.find('.copy-btn').trigger('click')
    await flushPromises()

    expect(writeText).toHaveBeenCalledWith(JSON.stringify({ x: 42 }, null, 2))
    expect(wrapper.find('.copy-btn').classes()).toContain('copied')
  })

  it('shows "Copy" label by default and "Copied!" after click', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })

    const wrapper = mount(ConfigPreview, { props: { config: {} } })
    expect(wrapper.find('.copy-btn').text()).toBe('Copy')
    await wrapper.find('.copy-btn').trigger('click')
    await flushPromises()
    expect(wrapper.find('.copy-btn').text()).toBe('Copied!')
  })
})

// ── ConfigToolbar ─────────────────────────────────────────────

describe('ConfigToolbar', () => {
  it('renders schema title', () => {
    const wrapper = mount(ConfigToolbar, { props: { schemaTitle: 'My Config' } })
    expect(wrapper.find('.toolbar-title').text()).toBe('My Config')
  })

  it('does not show badge when validationResult is absent', () => {
    const wrapper = mount(ConfigToolbar, { props: { schemaTitle: '' } })
    expect(wrapper.find('.validation-badge').exists()).toBe(false)
  })

  it('shows valid badge when validation passes', () => {
    const result: ValidationResult = { valid: true, errors: [] }
    const wrapper = mount(ConfigToolbar, { props: { schemaTitle: '', validationResult: result } })
    expect(wrapper.find('.badge-valid').exists()).toBe(true)
    expect(wrapper.find('.badge-valid').text()).toBe('Valid')
  })

  it('shows error count badge when validation fails', () => {
    const result: ValidationResult = { valid: false, errors: [{ path: 'a', message: 'err' }] }
    const wrapper = mount(ConfigToolbar, { props: { schemaTitle: '', validationResult: result } })
    expect(wrapper.find('.badge-invalid').text()).toBe('1 error(s)')
  })

  it('emits validate, reset, export events', async () => {
    const wrapper = mount(ConfigToolbar, { props: { schemaTitle: '' } })
    await wrapper.find('.btn-secondary').trigger('click')       // Validate
    await wrapper.findAll('.btn-secondary')[1].trigger('click') // Reset
    await wrapper.find('.btn-primary').trigger('click')         // Export
    expect(wrapper.emitted('validate')).toBeTruthy()
    expect(wrapper.emitted('reset')).toBeTruthy()
    expect(wrapper.emitted('export')).toBeTruthy()
  })

  it('emits update:columns when column toggle clicked', async () => {
    const wrapper = mount(ConfigToolbar, { props: { schemaTitle: '', columns: 2 } })
    const btns = wrapper.findAll('.toggle-btn')
    await btns[0].trigger('click') // columns = 1
    expect(wrapper.emitted('update:columns')![0]).toEqual([1])
  })

  it('marks active column button', () => {
    const wrapper = mount(ConfigToolbar, { props: { schemaTitle: '', columns: 2 } })
    const btns = wrapper.findAll('.toggle-btn')
    expect(btns[1].classes()).toContain('active') // index 1 = "2"
  })
})

// ── FieldGroup ────────────────────────────────────────────────

describe('FieldGroup', () => {
  const children: FormFieldDescriptor[] = [
    { key: 'host', path: 'host', label: 'Host', controlType: 'text', required: false },
  ]

  it('renders fieldset with legend', () => {
    const wrapper = mount(FieldGroup, {
      props: { label: 'Server', children, config: {} },
    })
    expect(wrapper.find('fieldset').exists()).toBe(true)
    expect(wrapper.find('legend').text()).toBe('Server')
  })

  it('renders description when provided', () => {
    const wrapper = mount(FieldGroup, {
      props: { label: 'S', description: 'desc text', children, config: {} },
    })
    expect(wrapper.find('.field-group-description').text()).toBe('desc text')
  })

  it('does not render description when absent', () => {
    const wrapper = mount(FieldGroup, {
      props: { label: 'S', children, config: {} },
    })
    expect(wrapper.find('.field-group-description').exists()).toBe(false)
  })

  it('emits update event from nested field change', async () => {
    const wrapper = mount(FieldGroup, {
      props: { label: 'S', children, config: { host: '' } },
    })
    await wrapper.find('input').setValue('localhost')
    expect(wrapper.emitted('update')).toBeTruthy()
  })
})

// ── FieldWrapper ──────────────────────────────────────────────

describe('FieldWrapper', () => {
  it('renders label text', () => {
    const wrapper = mount(FieldWrapper, {
      props: { label: 'Host', required: false },
    })
    expect(wrapper.find('.field-label').text()).toContain('Host')
  })

  it('shows required mark when required=true', () => {
    const wrapper = mount(FieldWrapper, {
      props: { label: 'Port', required: true },
    })
    expect(wrapper.find('.required-mark').exists()).toBe(true)
  })

  it('renders description when provided', () => {
    const wrapper = mount(FieldWrapper, {
      props: { label: 'L', required: false, description: 'some info' },
    })
    expect(wrapper.find('.field-description').text()).toBe('some info')
  })

  it('shows error messages', () => {
    const wrapper = mount(FieldWrapper, {
      props: { label: 'L', required: false, errors: ['Field is required'], hasError: true },
    })
    expect(wrapper.find('.field-error').text()).toContain('Field is required')
    expect(wrapper.find('.field-wrapper').classes()).toContain('has-error')
  })

  it('renders slot content', () => {
    const wrapper = mount(FieldWrapper, {
      props: { label: 'L', required: false },
      slots: { default: '<input type="text" class="my-input" />' },
    })
    expect(wrapper.find('.my-input').exists()).toBe(true)
  })
})

// ── FormRenderer ──────────────────────────────────────────────

describe('FormRenderer', () => {
  const textField: FormFieldDescriptor = {
    key: 'name', path: 'name', label: 'Name', controlType: 'text', required: false,
  }
  const groupField: FormFieldDescriptor = {
    key: 'server', path: 'server', label: 'Server', controlType: 'group', required: false,
    children: [
      { key: 'host', path: 'host', label: 'Host', controlType: 'text', required: false },
    ],
  }

  it('renders a text field', () => {
    const wrapper = mount(FormRenderer, {
      props: { fields: [textField], config: { name: 'Alice' } },
    })
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('renders a group field as fieldset', () => {
    const wrapper = mount(FormRenderer, {
      props: { fields: [groupField], config: { server: { host: '' } } },
    })
    expect(wrapper.find('fieldset').exists()).toBe(true)
  })

  it('gives group cell full-width class', () => {
    const wrapper = mount(FormRenderer, {
      props: { fields: [groupField], config: { server: {} } },
    })
    expect(wrapper.find('.field-cell--full').exists()).toBe(true)
  })

  it('emits update when a field value changes', async () => {
    const wrapper = mount(FormRenderer, {
      props: { fields: [textField], config: { name: '' } },
    })
    await wrapper.find('input').setValue('Bob')
    const emits = wrapper.emitted('update') as Array<[{ path: string; value: unknown }]>
    expect(emits[0][0].path).toBe('name')
    expect(emits[0][0].value).toBe('Bob')
  })

  it('applies --grid-cols style from columns prop', () => {
    const wrapper = mount(FormRenderer, {
      props: { fields: [textField], config: {}, columns: 3 },
    })
    expect((wrapper.find('.form-renderer').element as HTMLElement).style.getPropertyValue('--grid-cols')).toBe('3')
  })
})
