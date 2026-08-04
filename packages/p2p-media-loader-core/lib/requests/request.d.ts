import { BandwidthCalculators, Playback, SegmentWithStream } from "../internal-types.js";
import { CoreEventMap, RequestError, RequestAbortErrorType, RequestErrorType, Segment } from "../types.js";
import * as StreamUtils from "../utils/stream.js";
import { EventTarget } from "../utils/event-target.js";
export type LoadProgress = {
    startTimestamp: number;
    lastLoadedChunkTimestamp?: number;
    startFromByte?: number;
    loadedBytes: number;
};
type HttpRequestAttempt = {
    downloadSource: "http";
    error?: RequestError;
};
type P2PRequestAttempt = {
    downloadSource: "p2p";
    peerId: string;
    error?: RequestError;
};
export type RequestAttempt = HttpRequestAttempt | P2PRequestAttempt;
export type RequestControls = Readonly<{
    firstBytesReceived: Request["firstBytesReceived"];
    addLoadedChunk: Request["addLoadedChunk"];
    completeOnSuccess: Request["completeOnSuccess"];
    failWithError: Request["failWithError"];
}>;
type OmitEncapsulated<T extends RequestAttempt> = Omit<T, "error" | "errorTimestamp">;
type StartRequestParameters = OmitEncapsulated<HttpRequestAttempt> | OmitEncapsulated<P2PRequestAttempt>;
export type RequestStatus = "not-started" | "loading" | "succeed" | "failed" | "aborted";
export declare class Request {
    readonly segment: SegmentWithStream;
    private readonly requestProcessQueueCallback;
    private readonly bandwidthCalculators;
    private readonly playback;
    private readonly playbackConfig;
    readonly infoHash: string;
    private currentAttempt?;
    private _failedAttempts;
    private finalData?;
    private bytes;
    private _loadedBytes;
    private _totalBytes?;
    private _status;
    private progress?;
    private notReceivingBytesTimeout;
    private _onAbortCallback?;
    private notReceivingBytesTimeoutMs?;
    private readonly _logger;
    private _isHandledByProcessQueue;
    private readonly onSegmentError;
    private readonly onSegmentAbort;
    private readonly onSegmentStart;
    private readonly onSegmentLoaded;
    constructor(segment: SegmentWithStream, requestProcessQueueCallback: () => void, bandwidthCalculators: BandwidthCalculators, playback: Playback, playbackConfig: StreamUtils.PlaybackTimeWindowsConfig, eventTarget: EventTarget<CoreEventMap>, infoHash: string);
    clearLoadedBytes(): void;
    get status(): RequestStatus;
    private setStatus;
    get downloadSource(): "http" | "p2p" | undefined;
    get loadedBytes(): number;
    get totalBytes(): number | undefined;
    get data(): ArrayBuffer;
    get failedAttempts(): FailedRequestAttempts;
    get isHandledByProcessQueue(): boolean;
    markHandledByProcessQueue(): void;
    setTotalBytes(value: number): void;
    /**
     * Checks if all bytes are already loaded and, if so, starts, validates,
     * and completes the request without making a network request.
     *
     * Handles three cases:
     * - loadedBytes === totalBytes: start → validate → complete (returns true)
     * - loadedBytes > totalBytes: corrupted state → clearLoadedBytes (returns false)
     * - otherwise: no-op (returns false)
     *
     * The request is started synchronously so that processQueue sees
     * it as "loading" immediately. Validation runs as fire-and-forget.
     *
     * @returns true if the request was started and is being handled,
     * false if caller should proceed with a normal download.
     */
    tryCompleteByLoadedBytes(requestData: StartRequestParameters, controls: {
        notReceivingBytesTimeoutMs?: number;
        onAbort: (errorType: RequestError<RequestAbortErrorType>) => void;
    }, validate: ((url: string, byteRange: Segment["byteRange"], data: ArrayBuffer) => Promise<boolean>) | undefined, validationErrorType: RequestErrorType): boolean;
    validateData(validate?: (url: string, byteRange: Segment["byteRange"], data: ArrayBuffer) => Promise<boolean>): Promise<boolean>;
    private validateAndComplete;
    start(requestData: StartRequestParameters, controls: {
        notReceivingBytesTimeoutMs?: number;
        onAbort: (errorType: RequestError<RequestAbortErrorType>) => void;
    }): RequestControls;
    cancel(): void;
    private abortOnTimeout;
    private failWithError;
    private handleFailure;
    private completeOnSuccess;
    private addLoadedChunk;
    private firstBytesReceived;
    private throwErrorIfNotLoadingStatus;
    private logger;
    private manageBandwidthCalculatorsState;
}
declare class FailedRequestAttempts {
    private attempts;
    add(attempt: Required<RequestAttempt>): void;
    get httpAttemptsCount(): number;
    get p2pAttemptsCount(): number;
    get lastAttempt(): Readonly<Required<RequestAttempt>> | undefined;
    clear(): void;
}
export declare class Timeout {
    private readonly action;
    private timeoutId?;
    private ms?;
    constructor(action: () => void);
    start(ms: number): void;
    restart(ms?: number): void;
    clear(): void;
}
export {};
