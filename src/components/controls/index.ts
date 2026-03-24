import type { Component } from 'vue'
import type { ControlType } from '../../types/form'
import TextInput from './TextInput.vue'
import NumberInput from './NumberInput.vue'
import CheckboxInput from './CheckboxInput.vue'
import SelectInput from './SelectInput.vue'
import TextareaInput from './TextareaInput.vue'
import ArrayInput from './ArrayInput.vue'

export const controlRegistry: Record<Exclude<ControlType, 'group'>, Component> = {
  text: TextInput,
  number: NumberInput,
  checkbox: CheckboxInput,
  select: SelectInput,
  textarea: TextareaInput,
  array: ArrayInput,
}

export { TextInput, NumberInput, CheckboxInput, SelectInput, TextareaInput, ArrayInput }
