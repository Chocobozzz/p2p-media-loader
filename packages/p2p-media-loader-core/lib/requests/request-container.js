import { Request } from "./request.js";
export class RequestsContainer {
    constructor(requestProcessQueueCallback, bandwidthCalculators, playback, config, eventTarget) {
        Object.defineProperty(this, "requestProcessQueueCallback", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: requestProcessQueueCallback
        });
        Object.defineProperty(this, "bandwidthCalculators", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: bandwidthCalculators
        });
        Object.defineProperty(this, "playback", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: playback
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
        Object.defineProperty(this, "eventTarget", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: eventTarget
        });
        Object.defineProperty(this, "requests", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    get executingHttpCount() {
        let count = 0;
        for (const request of this.httpRequests()) {
            if (request.status === "loading")
                count++;
        }
        return count;
    }
    get executingP2PCount() {
        let count = 0;
        for (const request of this.p2pRequests()) {
            if (request.status === "loading")
                count++;
        }
        return count;
    }
    get(segment) {
        return this.requests.get(segment);
    }
    getOrCreateRequest(segment) {
        let request = this.requests.get(segment);
        if (!request) {
            request = new Request(segment, this.requestProcessQueueCallback, this.bandwidthCalculators, this.playback, this.config, this.eventTarget, segment.stream.infoHash);
            this.requests.set(segment, request);
        }
        return request;
    }
    remove(request) {
        this.requests.delete(request.segment);
    }
    items() {
        return this.requests.values();
    }
    *httpRequests() {
        for (const request of this.requests.values()) {
            if (request.downloadSource === "http")
                yield request;
        }
    }
    *p2pRequests() {
        for (const request of this.requests.values()) {
            if (request.downloadSource === "p2p")
                yield request;
        }
    }
    destroy() {
        for (const request of this.requests.values()) {
            if (request.status !== "loading")
                continue;
            request.cancel();
        }
        this.requests.clear();
    }
}
//# sourceMappingURL=request-container.js.map