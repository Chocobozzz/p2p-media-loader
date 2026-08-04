export declare const enum SerializedItem {
    Min = -1,
    Int = 0,
    SimilarIntArray = 1,
    String = 2,
    Max = 3
}
export declare function getRequiredBytesForInt(num: number): number;
export declare function serializeInt(num: number): Uint8Array;
export declare function deserializeInt(bytes: Uint8Array): {
    number: number;
    byteLength: number;
};
export declare function serializeUniqueSimilarIntArray(numbers: number[]): Uint8Array<ArrayBuffer>;
export declare function deserializeUniqueSimilarIntArray(bytes: Uint8Array): {
    numbers: number[];
    byteLength: number;
};
export declare function serializeString(string: string): Uint8Array<ArrayBuffer>;
export declare function deserializeString(bytes: Uint8Array): {
    string: string;
    byteLength: number;
};
export declare class ResizableUint8Array {
    #private;
    push(bytes: Uint8Array | number | number[]): void;
    unshift(bytes: Uint8Array | number | number[]): void;
    getBytesChunks(): readonly Uint8Array[];
    getBuffer(): Uint8Array;
    get length(): number;
}
