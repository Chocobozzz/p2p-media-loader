import { CoreConfig, CoreEventMap } from "./types.js";
import { Request as SegmentRequest } from "./requests/request.js";
import { EventTarget } from "./utils/event-target.js";
type HttpConfig = Pick<CoreConfig, "httpNotReceivingBytesTimeoutMs" | "httpRequestSetup" | "validateHTTPSegment">;
export declare class HttpRequestExecutor {
    private readonly request;
    private readonly httpConfig;
    private readonly abortController;
    private expectedBytesLength?;
    private requestByteRange?;
    private readonly onChunkDownloaded;
    private isAborted;
    constructor(request: SegmentRequest, httpConfig: HttpConfig, eventTarget: EventTarget<CoreEventMap>);
    execute(): void;
    private fetch;
    private handleResponseHeaders;
    private handleError;
}
export {};
