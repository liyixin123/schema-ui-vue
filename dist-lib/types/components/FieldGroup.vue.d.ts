import type { FormFieldDescriptor } from '../types/form';
type __VLS_Props = {
    label: string;
    description?: string;
    children: FormFieldDescriptor[];
    config: Record<string, unknown>;
    columns?: number;
};
declare const __VLS_export: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    update: (payload: {
        path: string;
        value: unknown;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onUpdate?: ((payload: {
        path: string;
        value: unknown;
    }) => any) | undefined;
}>, {
    columns: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
