import type { JsonSchema } from '../types/schema';
import type { ValidationResult } from '../types/validation';
import '../assets/styles/library.css';
type __VLS_Props = {
    schema?: JsonSchema;
    schemaUrl?: string;
    modelValue?: Record<string, unknown>;
    columns?: number;
    showToolbar?: boolean;
    showPreview?: boolean;
};
declare function validate_(): ValidationResult;
declare function reset_(): void;
declare const __VLS_export: import("vue").DefineComponent<__VLS_Props, {
    validate: typeof validate_;
    reset: typeof reset_;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:modelValue": (value: Record<string, unknown>) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onUpdate:modelValue"?: ((value: Record<string, unknown>) => any) | undefined;
}>, {
    columns: number;
    showToolbar: boolean;
    showPreview: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
