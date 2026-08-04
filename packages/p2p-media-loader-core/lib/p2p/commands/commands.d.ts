import { PeerCommand } from "./types.js";
export declare function serializePeerCommand(command: PeerCommand, maxChunkSize: number): Uint8Array<ArrayBuffer>[];
