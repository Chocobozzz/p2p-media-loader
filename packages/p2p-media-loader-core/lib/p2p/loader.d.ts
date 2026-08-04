import { Peer } from "./peer.js";
import { CoreEventMap, StreamConfig } from "../types.js";
import { SegmentWithStream, StreamWithSegments } from "../internal-types.js";
import { RequestsContainer } from "../requests/request-container.js";
import { WebTorrentSocketPool } from "../webtorrent/webtorrent-socket-pool/index.js";
import { EventTarget } from "../utils/event-target.js";
import { SegmentStorage } from "../segment-storage/index.js";
export type EventTargetMap = Record<`onStorageUpdated-${string}`, () => void> & CoreEventMap;
export declare class P2PLoader {
    #private;
    constructor(stream: StreamWithSegments, requests: RequestsContainer, segmentStorage: SegmentStorage, config: StreamConfig, webTorrentSocketPool: WebTorrentSocketPool, eventTarget: EventTarget<EventTargetMap>, peerId: string, onSegmentAnnouncement: () => void);
    downloadSegment(segment: SegmentWithStream): void;
    isSegmentLoadingOrLoadedBySomeone(segment: SegmentWithStream): boolean;
    isSegmentLoadedBySomeone(segment: SegmentWithStream): boolean;
    get connectedPeerCount(): number;
    peers(): Generator<Peer, void, unknown>;
    broadcastAnnouncement: (sendEmptyAnnouncement?: boolean) => void;
    destroy(): void;
}
export declare function selectPeerForDownload(peersWithSegment: Peer[]): Peer;
