declare class AbortSignalPolyfill {
    #private;
    aborted: boolean;
    addEventListener(_type: "abort", listener: (event?: unknown) => void): void;
    removeEventListener(_type: "abort", listener: (event?: unknown) => void): void;
    dispatchEvent(_type: "abort"): void;
}
declare class AbortControllerPolyfill {
    readonly signal: AbortSignalPolyfill;
    abort(): void;
}
export declare const isAbortControllerSupported: boolean;
export declare const SafeAbortController: typeof AbortControllerPolyfill | {
    new (): AbortController;
    prototype: AbortController;
};
export type SafeAbortSignal = AbortSignal | AbortSignalPolyfill;
export {};
