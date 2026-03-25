import type { JsonSchema } from '../types/schema';
export declare function useFormState(): {
    config: import("vue").Ref<Record<string, unknown>, Record<string, unknown>>;
    initFromSchema: (schema: JsonSchema) => void;
    setValue: (path: string, value: unknown) => void;
    getValue: (path: string) => unknown;
    reset: (schema: JsonSchema) => void;
};
