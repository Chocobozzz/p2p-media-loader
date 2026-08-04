var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import debug from "debug";
import { RequestError, } from "../types.js";
import * as Utils from "../utils/utils.js";
function mapSegmentWithStreamToSegment(segment) {
    return {
        runtimeId: segment.runtimeId,
        externalId: segment.externalId,
        url: segment.url,
        byteRange: segment.byteRange && Object.assign({}, segment.byteRange),
        startTime: segment.startTime,
        endTime: segment.endTime,
    };
}
export class Request {
    constructor(segment, requestProcessQueueCallback, bandwidthCalculators, playback, playbackConfig, eventTarget, infoHash) {
        Object.defineProperty(this, "segment", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: segment
        });
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
        Object.defineProperty(this, "playbackConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: playbackConfig
        });
        Object.defineProperty(this, "infoHash", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: infoHash
        });
        Object.defineProperty(this, "currentAttempt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_failedAttempts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new FailedRequestAttempts()
        });
        Object.defineProperty(this, "finalData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "bytes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "_loadedBytes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_totalBytes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "not-started"
        });
        Object.defineProperty(this, "progress", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "notReceivingBytesTimeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_onAbortCallback", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "notReceivingBytesTimeoutMs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_logger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_isHandledByProcessQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "onSegmentError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onSegmentAbort", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onSegmentStart", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onSegmentLoaded", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "abortOnTimeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                var _a, _b;
                this.throwErrorIfNotLoadingStatus();
                if (!this.currentAttempt ||
                    !this.progress ||
                    this.notReceivingBytesTimeoutMs === undefined) {
                    return;
                }
                const now = performance.now();
                const lastActive = (_a = this.progress.lastLoadedChunkTimestamp) !== null && _a !== void 0 ? _a : this.progress.startTimestamp;
                const msSinceLastActive = now - lastActive;
                if (msSinceLastActive < this.notReceivingBytesTimeoutMs) {
                    // False alarm! The stream is still downloading. Reschedule the timer.
                    this.notReceivingBytesTimeout.restart(this.notReceivingBytesTimeoutMs - msSinceLastActive);
                    return;
                }
                const error = new RequestError("bytes-receiving-timeout");
                (_b = this._onAbortCallback) === null || _b === void 0 ? void 0 : _b.call(this, error);
                this.handleFailure(error);
            }
        });
        Object.defineProperty(this, "failWithError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (error) => {
                this.throwErrorIfNotLoadingStatus();
                if (!this.currentAttempt)
                    return;
                this.handleFailure(error);
            }
        });
        Object.defineProperty(this, "handleFailure", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (error) => {
                if (!this.currentAttempt)
                    return;
                this.setStatus("failed");
                this.logger(`${this.downloadSource} ${this.segment.externalId} failed ${error.type}`);
                this._failedAttempts.add(Object.assign(Object.assign({}, this.currentAttempt), { error }));
                this.onSegmentError({
                    segment: mapSegmentWithStreamToSegment(this.segment),
                    error,
                    downloadSource: this.currentAttempt.downloadSource,
                    peerId: this.currentAttempt.downloadSource === "p2p"
                        ? this.currentAttempt.peerId
                        : undefined,
                    infoHash: this.infoHash,
                    streamType: this.segment.stream.type,
                });
                this.notReceivingBytesTimeout.clear();
                this.manageBandwidthCalculatorsState("stop");
                this.requestProcessQueueCallback();
            }
        });
        Object.defineProperty(this, "completeOnSuccess", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.throwErrorIfNotLoadingStatus();
                if (!this.currentAttempt)
                    return;
                this.manageBandwidthCalculatorsState("stop");
                this.notReceivingBytesTimeout.clear();
                this.setStatus("succeed");
                this._totalBytes = this._loadedBytes;
                this.onSegmentLoaded({
                    segment: mapSegmentWithStreamToSegment(this.segment),
                    bytesLength: this.data.byteLength,
                    downloadSource: this.currentAttempt.downloadSource,
                    peerId: this.currentAttempt.downloadSource === "p2p"
                        ? this.currentAttempt.peerId
                        : undefined,
                    infoHash: this.infoHash,
                    streamType: this.segment.stream.type,
                });
                this.logger(`${this.currentAttempt.downloadSource} ${this.segment.externalId} succeed`);
                this.requestProcessQueueCallback();
            }
        });
        Object.defineProperty(this, "addLoadedChunk", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (chunk) => {
                this.throwErrorIfNotLoadingStatus();
                if (!this.currentAttempt || !this.progress)
                    return;
                const { byteLength } = chunk;
                const { all: allBC, http: httpBC } = this.bandwidthCalculators;
                allBC.addBytes(byteLength);
                if (this.currentAttempt.downloadSource === "http") {
                    httpBC.addBytes(byteLength);
                }
                this.bytes.push(chunk);
                this.progress.lastLoadedChunkTimestamp = performance.now();
                this.progress.loadedBytes += byteLength;
                this._loadedBytes += byteLength;
            }
        });
        Object.defineProperty(this, "firstBytesReceived", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.throwErrorIfNotLoadingStatus();
            }
        });
        this.onSegmentError = eventTarget.getEventDispatcher("onSegmentError");
        this.onSegmentAbort = eventTarget.getEventDispatcher("onSegmentAbort");
        this.onSegmentStart = eventTarget.getEventDispatcher("onSegmentStart");
        this.onSegmentLoaded = eventTarget.getEventDispatcher("onSegmentLoaded");
        const { byteRange } = this.segment;
        if (byteRange) {
            const { end, start } = byteRange;
            this._totalBytes = end - start + 1;
        }
        this.notReceivingBytesTimeout = new Timeout(this.abortOnTimeout);
        const { type } = this.segment.stream;
        this._logger = debug(`p2pml-core:request-${type}`);
    }
    clearLoadedBytes() {
        this._loadedBytes = 0;
        this.bytes = [];
        this._totalBytes = undefined;
        this.finalData = undefined;
    }
    get status() {
        return this._status;
    }
    setStatus(status) {
        this._status = status;
        this._isHandledByProcessQueue = false;
    }
    get downloadSource() {
        var _a;
        return (_a = this.currentAttempt) === null || _a === void 0 ? void 0 : _a.downloadSource;
    }
    get loadedBytes() {
        return this._loadedBytes;
    }
    get totalBytes() {
        return this._totalBytes;
    }
    get data() {
        var _a;
        (_a = this.finalData) !== null && _a !== void 0 ? _a : (this.finalData = Utils.joinChunks(this.bytes).buffer);
        return this.finalData;
    }
    get failedAttempts() {
        return this._failedAttempts;
    }
    get isHandledByProcessQueue() {
        return this._isHandledByProcessQueue;
    }
    markHandledByProcessQueue() {
        this._isHandledByProcessQueue = true;
    }
    setTotalBytes(value) {
        if (this._totalBytes !== undefined) {
            throw new Error("Request total bytes value is already set");
        }
        this._totalBytes = value;
    }
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
    tryCompleteByLoadedBytes(requestData, controls, validate, validationErrorType) {
        if (!this._totalBytes)
            return false;
        if (this._loadedBytes > this._totalBytes) {
            this.logger(`${requestData.downloadSource} ${this.segment.externalId} loaded bytes overflow: ${this._loadedBytes} > ${this._totalBytes}, clearing`);
            this.clearLoadedBytes();
            return false;
        }
        if (this._loadedBytes !== this._totalBytes)
            return false;
        // Start synchronously so the request is immediately in "loading" status.
        const requestControls = this.start(requestData, controls);
        // No network bytes will arrive in this path, so disable the timeout
        // to prevent it from aborting the request during async validation.
        this.notReceivingBytesTimeout.clear();
        if (validate) {
            void this.validateAndComplete(requestData.downloadSource, requestControls, validate, validationErrorType);
        }
        else {
            requestControls.completeOnSuccess();
        }
        return true;
    }
    validateData(validate) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validate)
                return true;
            try {
                return yield validate(this.segment.url, this.segment.byteRange, this.data);
            }
            catch (err) {
                this.logger(`validation threw an error: ${String(err)}`);
                return false;
            }
        });
    }
    validateAndComplete(downloadSource, requestControls, validate, validationErrorType) {
        return __awaiter(this, void 0, void 0, function* () {
            const isValid = yield this.validateData(validate);
            // Request may have been aborted by processQueue while validation ran.
            if (this._status !== "loading")
                return;
            if (!isValid) {
                this.logger(`${downloadSource} ${this.segment.externalId} validation failed for already-loaded bytes, clearing`);
                this.clearLoadedBytes();
                requestControls.failWithError(new RequestError(validationErrorType));
                return;
            }
            this.logger(`${downloadSource} ${this.segment.externalId} validation passed for already-loaded bytes`);
            requestControls.completeOnSuccess();
        });
    }
    start(requestData, controls) {
        if (this._status === "succeed") {
            throw new Error(`Request ${this.segment.externalId} has been already succeed.`);
        }
        if (this._status === "loading") {
            throw new Error(`Request ${this.segment.externalId} has been already started.`);
        }
        this.setStatus("loading");
        this.currentAttempt = Object.assign({}, requestData);
        this.progress = {
            startFromByte: this._loadedBytes,
            loadedBytes: 0,
            startTimestamp: performance.now(),
        };
        this.manageBandwidthCalculatorsState("start");
        const { notReceivingBytesTimeoutMs } = controls;
        this._onAbortCallback = controls.onAbort;
        this.notReceivingBytesTimeoutMs = notReceivingBytesTimeoutMs;
        if (notReceivingBytesTimeoutMs !== undefined) {
            this.notReceivingBytesTimeout.start(notReceivingBytesTimeoutMs);
        }
        this.logger(`${requestData.downloadSource} ${this.segment.externalId} started`);
        this.onSegmentStart({
            segment: mapSegmentWithStreamToSegment(this.segment),
            downloadSource: requestData.downloadSource,
            peerId: requestData.downloadSource === "p2p" ? requestData.peerId : undefined,
            infoHash: this.infoHash,
            streamType: this.segment.stream.type,
        });
        return {
            firstBytesReceived: this.firstBytesReceived,
            addLoadedChunk: this.addLoadedChunk,
            completeOnSuccess: this.completeOnSuccess,
            failWithError: this.failWithError,
        };
    }
    cancel() {
        var _a, _b, _c, _d;
        this.throwErrorIfNotLoadingStatus();
        this.setStatus("aborted");
        this.logger(`${(_a = this.currentAttempt) === null || _a === void 0 ? void 0 : _a.downloadSource} ${this.segment.externalId} aborted`);
        (_b = this._onAbortCallback) === null || _b === void 0 ? void 0 : _b.call(this, new RequestError("abort"));
        this.onSegmentAbort({
            segment: mapSegmentWithStreamToSegment(this.segment),
            downloadSource: (_c = this.currentAttempt) === null || _c === void 0 ? void 0 : _c.downloadSource,
            peerId: ((_d = this.currentAttempt) === null || _d === void 0 ? void 0 : _d.downloadSource) === "p2p"
                ? this.currentAttempt.peerId
                : undefined,
            infoHash: this.infoHash,
            streamType: this.segment.stream.type,
        });
        this._onAbortCallback = undefined;
        this.manageBandwidthCalculatorsState("stop");
        this.notReceivingBytesTimeout.clear();
    }
    throwErrorIfNotLoadingStatus() {
        if (this._status !== "loading") {
            throw new Error(`Request has been already ${this.status}.`);
        }
    }
    logger(message) {
        var _a;
        this._logger.color =
            ((_a = this.currentAttempt) === null || _a === void 0 ? void 0 : _a.downloadSource) === "http" ? "green" : "red";
        this._logger(message);
        this._logger.color = "";
    }
    manageBandwidthCalculatorsState(state) {
        var _a;
        const { all, http } = this.bandwidthCalculators;
        const method = state === "start" ? "startLoading" : "stopLoading";
        if (((_a = this.currentAttempt) === null || _a === void 0 ? void 0 : _a.downloadSource) === "http")
            http[method]();
        all[method]();
    }
}
class FailedRequestAttempts {
    constructor() {
        Object.defineProperty(this, "attempts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    add(attempt) {
        this.attempts.push(attempt);
    }
    get httpAttemptsCount() {
        return this.attempts.reduce((sum, attempt) => (attempt.downloadSource === "http" ? sum + 1 : sum), 0);
    }
    get p2pAttemptsCount() {
        return this.attempts.reduce((sum, attempt) => (attempt.downloadSource === "p2p" ? sum + 1 : sum), 0);
    }
    get lastAttempt() {
        return this.attempts[this.attempts.length - 1];
    }
    clear() {
        this.attempts = [];
    }
}
export class Timeout {
    constructor(action) {
        Object.defineProperty(this, "action", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: action
        });
        Object.defineProperty(this, "timeoutId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ms", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    start(ms) {
        if (this.timeoutId) {
            throw new Error("Timeout is already started.");
        }
        this.ms = ms;
        this.timeoutId = window.setTimeout(this.action, this.ms);
    }
    restart(ms) {
        this.clear();
        if (ms !== undefined)
            this.ms = ms;
        if (this.ms === undefined)
            return;
        this.timeoutId = window.setTimeout(this.action, this.ms);
    }
    clear() {
        clearTimeout(this.timeoutId);
        this.timeoutId = undefined;
    }
}
//# sourceMappingURL=request.js.map