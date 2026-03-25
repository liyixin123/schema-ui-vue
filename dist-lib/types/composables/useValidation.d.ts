import type { JsonSchema } from '../types/schema';
import type { ValidationResult, ValidationError } from '../types/validation';
export declare function useValidation(): {
    result: import("vue").Ref<{
        valid: boolean;
        errors: {
            path: string;
            message: string;
        }[];
    }, ValidationResult | {
        valid: boolean;
        errors: {
            path: string;
            message: string;
        }[];
    }>;
    validate: (schema: JsonSchema, data: Record<string, unknown>) => ValidationResult;
    getFieldErrors: (path: string) => ValidationError[];
    hasFieldError: (path: string) => boolean;
    clearErrors: () => void;
};
