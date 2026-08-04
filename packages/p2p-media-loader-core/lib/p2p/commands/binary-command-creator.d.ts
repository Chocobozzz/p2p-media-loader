import { PeerCommandType, PeerCommand } from "./types.js";
export declare function isCommandChunk(buffer: Uint8Array): boolean;
export declare class BinaryCommandJoiningError extends Error {
    readonly type: "incomplete-joining" | "no-first-chunk";
    constructor(type: "incomplete-joining" | "no-first-chunk");
}
export declare class BinaryCommandChunksJoiner {
    #private;
    constructor(onComplete: (commandBuffer: Uint8Array) => void);
    addCommandChunk(chunk: Uint8Array): void;
}
export declare class BinaryCommandCreator {
    #private;
    constructor(commandType: PeerCommandType, maxChunkLength: number);
    addInteger(name: string, value: number): void;
    addUniqueSimilarIntArr(name: string, arr: number[]): void;
    addString(name: string, string: string): void;
    complete(): void;
    getResultBuffers(): Uint8Array<ArrayBuffer>[];
}
export declare function deserializeCommand(bytes: Uint8Array): PeerCommand;
