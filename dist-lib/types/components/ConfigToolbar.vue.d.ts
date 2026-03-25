import type { ValidationResult } from '../types/validation';
type __VLS_Props = {
    schemaTitle: string;
    validationResult?: ValidationResult | null;
    columns?: number;
};
declare const __VLS_export: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    reset: () => any;
    validate: () => any;
    export: () => any;
    "update:columns": (value: number) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onReset?: (() => any) | undefined;
    onValidate?: (() => any) | undefined;
    onExport?: (() => any) | undefined;
    "onUpdate:columns"?: ((value: number) => any) | undefined;
}>, {
    columns: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
