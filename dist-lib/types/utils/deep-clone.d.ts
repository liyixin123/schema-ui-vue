export declare function deepClone<T>(value: T): T;
/**
 * Returns a new object with the value at the given dot-separated path updated.
 * Never mutates the original object.
 */
export declare function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown>;
/**
 * Gets a nested value by dot-separated path.
 */
export declare function getNestedValue(obj: Record<string, unknown>, path: string): unknown;
