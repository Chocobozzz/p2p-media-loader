import { EngineCallbacks } from "../types.js";
import { SegmentWithStream } from "../internal-types.js";
export declare class EngineRequest {
    readonly segment: SegmentWithStream;
    readonly engineCallbacks: EngineCallbacks;
    private _status;
    private _shouldBeStartedImmediately;
    constructor(segment: SegmentWithStream, engineCallbacks: EngineCallbacks);
    get status(): "failed" | "aborted" | "succeed" | "pending";
    get shouldBeStartedImmediately(): boolean;
    resolve(data: ArrayBuffer, bandwidth: number): void;
    reject(): void;
    abort(): void;
    markAsShouldBeStartedImmediately(): void;
}
