import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ArrayInput from '../components/controls/ArrayInput.vue'
import SelectInput from '../components/controls/SelectInput.vue'
import TextareaInput from '../components/controls/TextareaInput.vue'
import CheckboxInput from '../components/controls/CheckboxInput.vue'
import NumberInput from '../components/controls/NumberInput.vue'

// ── ArrayInput ────────────────────────────────────────────────

describe('ArrayInput', () => {
  it('renders empty state message when no items', () => {
    const wrapper = mount(ArrayInput, { props: { modelValue: [] } })
    expect(wrapper.find('.array-empty').exists()).toBe(true)
  })

  it('renders one row per item', () => {
    const wrapper = mount(ArrayInput, { props: { modelValue: ['a', 'b'] } })
    expect(wrapper.findAll('.array-row').length).toBe(2)
  })

  it('adds a string item on "Add item" click', async () => {
    const wrapper = mount(ArrayInput, { props: { modelValue: [] } })
    await wrapper.find('.array-add-btn').trigger('click')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([['']])
  })

  it('adds a number item when itemType is number', async () => {
    const wrapper = mount(ArrayInput, { props: { modelValue: [], itemType: 'number' } })
    await wrapper.find('.array-add-btn').trigger('click')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([[0]])
  })

  it('removes item on remove button click', async () => {
    const wrapper = mount(ArrayInput, { props: { modelValue: ['x', 'y'] } })
    await wrapper.findAll('.array-remove-btn')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([['y']])
  })

  it('updates a string item on input', async () => {
    const wrapper = mount(ArrayInput, { props: { modelValue: ['old'] } })
    const input = wrapper.find('input[type="text"]')
    await input.setValue('new')
    const emitted = wrapper.emitted('update:modelValue')![0][0] as string[]
    expect(emitted[0]).toBe('new')
  })

  it('updates a number item on input', async () => {
    const wrapper = mount(ArrayInput, { props: { modelValue: [1], itemType: 'number' } })
    const input = wrapper.find('input[type="number"]')
    await input.setValue('42')
    const emitted = wrapper.emitted('update:modelValue')![0][0] as number[]
    expect(emitted[0]).toBe(42)
  })

  it('applies has-error class', () => {
    const wrapper = mount(ArrayInput, { props: { modelValue: [], hasError: true } })
    expect(wrapper.find('.array-input').classes()).toContain('has-error')
  })
})

// ── SelectInput ───────────────────────────────────────────────

describe('SelectInput', () => {
  const options = [
    { label: 'Debug', value: 'debug' },
    { label: 'Info', value: 'info' },
  ]

  it('renders all options', () => {
    const wrapper = mount(SelectInput, { props: { modelValue: 'debug', options } })
    expect(wrapper.findAll('option').length).toBe(2)
  })

  it('emits update:modelValue on selection change', async () => {
    const wrapper = mount(SelectInput, { props: { modelValue: 'debug', options } })
    await wrapper.find('select').setValue('info')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['info'])
  })

  it('applies has-error class', () => {
    const wrapper = mount(SelectInput, { props: { modelValue: 'debug', options, hasError: true } })
    expect(wrapper.find('select').classes()).toContain('has-error')
  })
})

// ── TextareaInput ─────────────────────────────────────────────

describe('TextareaInput', () => {
  it('renders textarea with value', () => {
    const wrapper = mount(TextareaInput, { props: { modelValue: 'hello' } })
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('hello')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(TextareaInput, { props: { modelValue: '' } })
    await wrapper.find('textarea').setValue('new text')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['new text'])
  })

  it('applies has-error class', () => {
    const wrapper = mount(TextareaInput, { props: { modelValue: '', hasError: true } })
    expect(wrapper.find('textarea').classes()).toContain('has-error')
  })
})

// ── CheckboxInput ─────────────────────────────────────────────

describe('CheckboxInput', () => {
  it('renders with checked state', () => {
    const wrapper = mount(CheckboxInput, { props: { modelValue: true, label: 'Enable', inputId: 'cb1' } })
    expect((wrapper.find('input').element as HTMLInputElement).checked).toBe(true)
  })

  it('emits update:modelValue on change', async () => {
    const wrapper = mount(CheckboxInput, { props: { modelValue: false, label: 'Enable', inputId: 'cb1' } })
    await wrapper.find('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([true])
  })

  it('generates a random inputId when none provided', () => {
    const wrapper = mount(CheckboxInput, { props: { modelValue: false } })
    const id = wrapper.find('input').attributes('id')
    expect(id).toMatch(/^checkbox-/)
  })
})

// ── NumberInput ───────────────────────────────────────────────

describe('NumberInput', () => {
  it('renders with value', () => {
    const wrapper = mount(NumberInput, { props: { modelValue: 42 } })
    expect((wrapper.find('input').element as HTMLInputElement).valueAsNumber).toBe(42)
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(NumberInput, { props: { modelValue: 0 } })
    await wrapper.find('input').setValue('99')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([99])
  })

  it('applies minimum and maximum attributes', () => {
    const wrapper = mount(NumberInput, { props: { modelValue: 5, minimum: 1, maximum: 10 } })
    const input = wrapper.find('input')
    expect(input.attributes('min')).toBe('1')
    expect(input.attributes('max')).toBe('10')
  })

  it('applies has-error class', () => {
    const wrapper = mount(NumberInput, { props: { modelValue: 0, hasError: true } })
    expect(wrapper.find('input').classes()).toContain('has-error')
  })
})
