import { CommonCoreConfig, CoreConfig, StreamConfig } from "../types.js";
export declare function getPromiseWithResolvers<T = void>(): {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (reason?: unknown) => void;
};
export declare function queueMicrotask(fn: () => void): void;
export declare function joinChunks(chunks: Uint8Array[], totalBytes?: number): Uint8Array<ArrayBuffer>;
export declare function getPercent(numerator: number, denominator: number): number;
export declare function getRandomItem<T>(items: T[]): T;
export declare function getWeightedRandomItem<T>(items: T[], weightAccessor: (item: T) => number): T;
export declare function utf8ToUintArray(utf8String: string): Uint8Array;
export declare function hexToUtf8(hexString: string): string;
export declare function arrayBackwards<T>(arr: T[]): Generator<T, void, unknown>;
export declare function filterUndefinedProps<T extends object>(obj: T): Partial<T>;
export declare function deepCopy<T>(item: T): T;
export declare function shuffleArray<T>(array: T[]): T[];
type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends object ? RecursivePartial<T[P]> : T[P];
};
export declare function overrideConfig<T>(target: T, updates: RecursivePartial<T> | null, defaults?: RecursivePartial<T>): T;
type MergeConfigsToTypeOptions = {
    defaultConfig: StreamConfig | CommonCoreConfig | CoreConfig;
    baseConfig?: Partial<CoreConfig>;
    specificStreamConfig?: Partial<StreamConfig>;
};
export declare function mergeAndFilterConfig<T>(options: MergeConfigsToTypeOptions): T;
export {};
