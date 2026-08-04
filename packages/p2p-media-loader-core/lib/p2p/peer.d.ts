import { Request } from "../requests/request.js";
import { CoreEventMap, PeerError, PeerWarning } from "../types.js";
import { SegmentWithStream } from "../internal-types.js";
import { PeerConfig } from "./peer-protocol.js";
import { EventTarget } from "../utils/event-target.js";
type PeerEventHandlers = {
    onSegmentRequested: (peer: Peer, segmentId: number, requestId: number, byteFrom?: number) => void;
    onSegmentsAnnouncement: () => void;
    onWarning: (warning: PeerWarning) => void;
};
export declare class Peer {
    #private;
    readonly id: string;
    readonly channel: RTCDataChannel;
    readonly eventTarget: EventTarget<CoreEventMap>;
    readonly connectedAt: number;
    get isDestroyed(): boolean;
    constructor(id: string, channel: RTCDataChannel, closeConnection: (error?: PeerError) => void, eventHandlers: PeerEventHandlers, peerConfig: PeerConfig, eventTarget: EventTarget<CoreEventMap>);
    get downloadingSegment(): SegmentWithStream | undefined;
    get isUploadingSegment(): boolean;
    getDownloadBandwidth(): number;
    getSegmentStatus(segment: SegmentWithStream): "loaded" | "http-loading" | undefined;
    downloadSegment(segmentRequest: Request): void;
    uploadSegmentData(segment: SegmentWithStream, requestId: number, data: ArrayBuffer | ArrayBufferView<ArrayBuffer>): Promise<void>;
    sendSegmentsAnnouncementCommand(loadedSegmentsIds: number[], httpLoadingSegmentsIds: number[]): void;
    sendSegmentAbsentCommand(segmentExternalId: number, requestId: number): void;
    destroy(isConnectionClosed?: boolean, error?: PeerError): void;
}
export {};
