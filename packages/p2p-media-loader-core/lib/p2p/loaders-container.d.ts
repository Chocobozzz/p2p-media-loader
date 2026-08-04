import { P2PLoader } from "./loader.js";
import { CoreEventMap, StreamConfig, SegmentStorage } from "../index.js";
import { StreamWithSegments } from "../internal-types.js";
import { RequestsContainer } from "../requests/request-container.js";
import { EventTarget } from "../utils/event-target.js";
import { WebTorrentSocketPool } from "../webtorrent/webtorrent-socket-pool/index.js";
export declare class P2PLoadersContainer {
    #private;
    constructor(stream: StreamWithSegments, requests: RequestsContainer, segmentStorage: SegmentStorage, config: StreamConfig, webTorrentSocketPool: WebTorrentSocketPool, eventTarget: EventTarget<CoreEventMap>, peerId: string, onSegmentAnnouncement: () => void);
    changeCurrentLoader(stream: StreamWithSegments): void;
    get currentLoader(): P2PLoader;
    destroy(): void;
}
