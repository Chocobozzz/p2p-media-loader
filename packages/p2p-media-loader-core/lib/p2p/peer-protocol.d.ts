import { CoreEventMap, StreamConfig, StreamType } from "../types.js";
import * as Command from "./commands/index.js";
import { EventTarget } from "../utils/event-target.js";
export type PeerConfig = Pick<StreamConfig, "p2pNotReceivingBytesTimeoutMs" | "webRtcMaxMessageSize" | "p2pErrorRetries" | "validateP2PSegment"> & {
    streamType: StreamType;
    infoHash: string;
};
export type PeerProtocolEventHandlers = {
    onCommandReceived: (command: Command.PeerCommand) => void;
    onSegmentChunkReceived: (data: Uint8Array) => void;
    onProtocolError: (error: unknown) => void;
};
export declare class PeerProtocol {
    #private;
    constructor(channel: RTCDataChannel, peerConfig: PeerConfig, eventHandlers: PeerProtocolEventHandlers, eventTarget: EventTarget<CoreEventMap>, peerId: string);
    sendCommand(command: Command.PeerCommand): void;
    stopUploadingSegmentData(): void;
    getUploadingRequestId(): number | undefined;
    splitSegmentDataToChunksAndUploadAsync(data: ArrayBuffer | ArrayBufferView<ArrayBuffer>, requestId: number): Promise<void>;
    destroy(): void;
}
