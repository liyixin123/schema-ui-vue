import type { JsonSchema } from '../types/schema';
export declare function readJsonFile(file: File): Promise<JsonSchema>;
export declare function downloadJson(data: unknown, filename: string): void;
