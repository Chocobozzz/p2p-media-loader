import { Playback, BandwidthCalculators, SegmentWithStream } from "../internal-types.js";
import { CoreEventMap, StreamConfig } from "../types.js";
import { EventTarget } from "../utils/event-target.js";
import { Request } from "./request.js";
export declare class RequestsContainer {
    private readonly requestProcessQueueCallback;
    private readonly bandwidthCalculators;
    private readonly playback;
    private readonly config;
    private readonly eventTarget;
    private readonly requests;
    constructor(requestProcessQueueCallback: () => void, bandwidthCalculators: BandwidthCalculators, playback: Playback, config: StreamConfig, eventTarget: EventTarget<CoreEventMap>);
    get executingHttpCount(): number;
    get executingP2PCount(): number;
    get(segment: SegmentWithStream): Request | undefined;
    getOrCreateRequest(segment: SegmentWithStream): Request;
    remove(request: Request): void;
    items(): MapIterator<Request>;
    httpRequests(): Generator<Request, void>;
    p2pRequests(): Generator<Request, void>;
    destroy(): void;
}
