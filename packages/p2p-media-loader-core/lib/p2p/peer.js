var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Peer_instances, _Peer_peerProtocol, _Peer_downloadingContext, _Peer_loadedSegments, _Peer_httpLoadingSegments, _Peer_consecutiveTimeouts, _Peer_bandwidthCalculator, _Peer_cachedDownloadBandwidth, _Peer_logger, _Peer_nextRequestId, _Peer_latestRequestedUploadRequestId, _Peer_isDestroyed, _Peer_closeConnection, _Peer_eventHandlers, _Peer_peerConfig, _Peer_onCommandReceived, _Peer_onSegmentChunkReceived, _Peer_destroyOnPeerError, _Peer_cancelSegmentDownloading, _Peer_sendCancelSegmentRequestCommand, _Peer_sendSegmentDataSendingCompletedCommand, _Peer_sendCommand;
import debug from "debug";
import { RequestError, PeerError, PeerWarning, } from "../types.js";
import * as Command from "./commands/index.js";
import { PeerProtocol } from "./peer-protocol.js";
import { BandwidthCalculator } from "../bandwidth-calculator.js";
const { PeerCommandType } = Command;
export class Peer {
    get isDestroyed() {
        return __classPrivateFieldGet(this, _Peer_isDestroyed, "f");
    }
    constructor(id, channel, closeConnection, eventHandlers, peerConfig, eventTarget) {
        _Peer_instances.add(this);
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: id
        });
        Object.defineProperty(this, "channel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: channel
        });
        Object.defineProperty(this, "eventTarget", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: eventTarget
        });
        _Peer_peerProtocol.set(this, void 0);
        _Peer_downloadingContext.set(this, void 0);
        _Peer_loadedSegments.set(this, new Set());
        _Peer_httpLoadingSegments.set(this, new Set());
        _Peer_consecutiveTimeouts.set(this, 0);
        _Peer_bandwidthCalculator.set(this, new BandwidthCalculator());
        _Peer_cachedDownloadBandwidth.set(this, { value: 0, timestamp: 0 });
        _Peer_logger.set(this, debug("p2pml-core:peer"));
        _Peer_nextRequestId.set(this, 0);
        _Peer_latestRequestedUploadRequestId.set(this, void 0);
        _Peer_isDestroyed.set(this, false);
        Object.defineProperty(this, "connectedAt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: performance.now()
        });
        _Peer_closeConnection.set(this, void 0);
        _Peer_eventHandlers.set(this, void 0);
        _Peer_peerConfig.set(this, void 0);
        _Peer_onCommandReceived.set(this, (command) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            switch (command.c) {
                case PeerCommandType.SegmentsAnnouncement:
                    __classPrivateFieldSet(this, _Peer_loadedSegments, new Set(command.l), "f");
                    __classPrivateFieldSet(this, _Peer_httpLoadingSegments, new Set(command.p), "f");
                    __classPrivateFieldGet(this, _Peer_eventHandlers, "f").onSegmentsAnnouncement();
                    break;
                case PeerCommandType.SegmentRequest:
                    __classPrivateFieldSet(this, _Peer_latestRequestedUploadRequestId, command.r, "f");
                    __classPrivateFieldGet(this, _Peer_peerProtocol, "f").stopUploadingSegmentData();
                    __classPrivateFieldGet(this, _Peer_eventHandlers, "f").onSegmentRequested(this, command.i, command.r, command.b);
                    break;
                case PeerCommandType.SegmentData:
                    {
                        if (!__classPrivateFieldGet(this, _Peer_downloadingContext, "f"))
                            break;
                        if (__classPrivateFieldGet(this, _Peer_downloadingContext, "f").isSegmentDataCommandReceived)
                            break;
                        const { request, controls, requestId } = __classPrivateFieldGet(this, _Peer_downloadingContext, "f");
                        if (request.segment.externalId !== command.i ||
                            requestId !== command.r) {
                            break;
                        }
                        __classPrivateFieldGet(this, _Peer_downloadingContext, "f").isSegmentDataCommandReceived = true;
                        controls.firstBytesReceived();
                        if (request.totalBytes === undefined) {
                            request.setTotalBytes(request.loadedBytes + command.s);
                        }
                        else if (request.totalBytes - request.loadedBytes !== command.s) {
                            __classPrivateFieldGet(this, _Peer_instances, "m", _Peer_destroyOnPeerError).call(this, "bytes-length-mismatch", "Peer response bytes length mismatch");
                        }
                    }
                    break;
                case PeerCommandType.SegmentDataSendingCompleted: {
                    const downloadingContext = __classPrivateFieldGet(this, _Peer_downloadingContext, "f");
                    if (!(downloadingContext === null || downloadingContext === void 0 ? void 0 : downloadingContext.isSegmentDataCommandReceived))
                        return;
                    const { request, controls, requestId } = downloadingContext;
                    const isWrongSegment = request.segment.externalId !== command.i || requestId !== command.r;
                    if (isWrongSegment) {
                        __classPrivateFieldGet(this, _Peer_instances, "m", _Peer_destroyOnPeerError).call(this, "protocol-violation", "Peer protocol violation");
                        return;
                    }
                    const isWrongBytes = request.loadedBytes !== request.totalBytes;
                    if (isWrongBytes) {
                        __classPrivateFieldGet(this, _Peer_instances, "m", _Peer_destroyOnPeerError).call(this, "bytes-length-mismatch", "Peer response bytes length mismatch");
                        return;
                    }
                    const isValid = yield request.validateData(__classPrivateFieldGet(this, _Peer_peerConfig, "f").validateP2PSegment);
                    if (__classPrivateFieldGet(this, _Peer_isDestroyed, "f"))
                        return;
                    if (__classPrivateFieldGet(this, _Peer_downloadingContext, "f") !== downloadingContext)
                        return;
                    if (!isValid) {
                        __classPrivateFieldGet(this, _Peer_instances, "m", _Peer_destroyOnPeerError).call(this, "validation-failed", "P2P segment validation failed");
                        return;
                    }
                    __classPrivateFieldSet(this, _Peer_consecutiveTimeouts, 0, "f");
                    controls.completeOnSuccess();
                    __classPrivateFieldGet(this, _Peer_bandwidthCalculator, "f").stopLoading();
                    __classPrivateFieldSet(this, _Peer_downloadingContext, undefined, "f");
                    break;
                }
                case PeerCommandType.SegmentAbsent:
                    __classPrivateFieldGet(this, _Peer_loadedSegments, "f").delete(command.i);
                    if (((_a = __classPrivateFieldGet(this, _Peer_downloadingContext, "f")) === null || _a === void 0 ? void 0 : _a.request.segment.externalId) === command.i &&
                        __classPrivateFieldGet(this, _Peer_downloadingContext, "f").requestId === command.r) {
                        __classPrivateFieldGet(this, _Peer_instances, "m", _Peer_cancelSegmentDownloading).call(this, "peer-segment-absent");
                    }
                    break;
                case PeerCommandType.CancelSegmentRequest: {
                    if (__classPrivateFieldGet(this, _Peer_latestRequestedUploadRequestId, "f") === command.r) {
                        __classPrivateFieldSet(this, _Peer_latestRequestedUploadRequestId, undefined, "f");
                    }
                    const uploadingRequestId = __classPrivateFieldGet(this, _Peer_peerProtocol, "f").getUploadingRequestId();
                    if (uploadingRequestId !== command.r)
                        break;
                    __classPrivateFieldGet(this, _Peer_peerProtocol, "f").stopUploadingSegmentData();
                    break;
                }
            }
        }));
        _Peer_onSegmentChunkReceived.set(this, (chunk) => {
            var _a;
            if (!((_a = __classPrivateFieldGet(this, _Peer_downloadingContext, "f")) === null || _a === void 0 ? void 0 : _a.isSegmentDataCommandReceived))
                return;
            const { request, controls } = __classPrivateFieldGet(this, _Peer_downloadingContext, "f");
            const isOverflow = request.totalBytes !== undefined &&
                request.loadedBytes + chunk.byteLength > request.totalBytes;
            if (isOverflow) {
                __classPrivateFieldGet(this, _Peer_instances, "m", _Peer_destroyOnPeerError).call(this, "bytes-length-mismatch", "Peer response bytes length mismatch");
                return;
            }
            __classPrivateFieldGet(this, _Peer_bandwidthCalculator, "f").addBytes(chunk.byteLength);
            __classPrivateFieldGet(this, _Peer_cachedDownloadBandwidth, "f").timestamp = 0; // invalidate cache
            controls.addLoadedChunk(chunk);
        });
        __classPrivateFieldSet(this, _Peer_closeConnection, closeConnection, "f");
        __classPrivateFieldSet(this, _Peer_eventHandlers, eventHandlers, "f");
        __classPrivateFieldSet(this, _Peer_peerConfig, peerConfig, "f");
        __classPrivateFieldSet(this, _Peer_peerProtocol, new PeerProtocol(channel, peerConfig, {
            onSegmentChunkReceived: __classPrivateFieldGet(this, _Peer_onSegmentChunkReceived, "f"),
            onCommandReceived: (command) => void __classPrivateFieldGet(this, _Peer_onCommandReceived, "f").call(this, command).catch((error) => {
                __classPrivateFieldGet(this, _Peer_logger, "f").call(this, "error processing command %O: %O", command, error);
                this.destroy(false, new PeerError("protocol-violation", error instanceof Error
                    ? error.message
                    : "Error processing command", error));
            }),
            onProtocolError: (error) => {
                this.destroy(false, new PeerError("protocol-violation", error instanceof Error ? error.message : "Protocol error", error));
            },
        }, eventTarget, id), "f");
    }
    get downloadingSegment() {
        var _a;
        return (_a = __classPrivateFieldGet(this, _Peer_downloadingContext, "f")) === null || _a === void 0 ? void 0 : _a.request.segment;
    }
    get isUploadingSegment() {
        return __classPrivateFieldGet(this, _Peer_peerProtocol, "f").getUploadingRequestId() !== undefined;
    }
    getDownloadBandwidth() {
        const now = performance.now();
        // Cache the array iteration math for 1000ms to preserve O(1) hot path efficiency during rapid queue segment evaluations
        if (now - __classPrivateFieldGet(this, _Peer_cachedDownloadBandwidth, "f").timestamp > 1000) {
            // Uses a 15-second tracking window to calculate a moving average of the peer's throughput speed
            __classPrivateFieldGet(this, _Peer_cachedDownloadBandwidth, "f").value =
                __classPrivateFieldGet(this, _Peer_bandwidthCalculator, "f").getBandwidthLoadingOnly(15);
            __classPrivateFieldGet(this, _Peer_cachedDownloadBandwidth, "f").timestamp = now;
        }
        return __classPrivateFieldGet(this, _Peer_cachedDownloadBandwidth, "f").value;
    }
    getSegmentStatus(segment) {
        const { externalId } = segment;
        if (__classPrivateFieldGet(this, _Peer_loadedSegments, "f").has(externalId))
            return "loaded";
        if (__classPrivateFieldGet(this, _Peer_httpLoadingSegments, "f").has(externalId))
            return "http-loading";
    }
    downloadSegment(segmentRequest) {
        if (__classPrivateFieldGet(this, _Peer_isDestroyed, "f"))
            return;
        if (__classPrivateFieldGet(this, _Peer_downloadingContext, "f")) {
            throw new Error("Some segment already is downloading");
        }
        const completed = segmentRequest.tryCompleteByLoadedBytes({ downloadSource: "p2p", peerId: this.id }, {
            notReceivingBytesTimeoutMs: __classPrivateFieldGet(this, _Peer_peerConfig, "f").p2pNotReceivingBytesTimeoutMs,
            onAbort: () => void 0,
        }, __classPrivateFieldGet(this, _Peer_peerConfig, "f").validateP2PSegment, "p2p-segment-validation-failed");
        if (completed)
            return;
        __classPrivateFieldGet(this, _Peer_bandwidthCalculator, "f").startLoading();
        __classPrivateFieldSet(this, _Peer_nextRequestId, (__classPrivateFieldGet(this, _Peer_nextRequestId, "f") + 1) % 1000000000, "f");
        __classPrivateFieldSet(this, _Peer_downloadingContext, {
            request: segmentRequest,
            requestId: __classPrivateFieldGet(this, _Peer_nextRequestId, "f"),
            isSegmentDataCommandReceived: false,
            controls: segmentRequest.start({ downloadSource: "p2p", peerId: this.id }, {
                notReceivingBytesTimeoutMs: __classPrivateFieldGet(this, _Peer_peerConfig, "f").p2pNotReceivingBytesTimeoutMs,
                onAbort: (error) => {
                    var _a;
                    // Note: This callback is exclusively triggered by Engine-initiated
                    // cancellations (e.g., user seeks) or timeouts. It is mutually exclusive
                    // from peer-initiated failures, which are handled by #cancelSegmentDownloading.
                    if (!__classPrivateFieldGet(this, _Peer_downloadingContext, "f") ||
                        __classPrivateFieldGet(this, _Peer_downloadingContext, "f").request !== segmentRequest) {
                        return;
                    }
                    const { request, requestId } = __classPrivateFieldGet(this, _Peer_downloadingContext, "f");
                    __classPrivateFieldGet(this, _Peer_instances, "m", _Peer_sendCancelSegmentRequestCommand).call(this, request.segment, requestId);
                    __classPrivateFieldGet(this, _Peer_bandwidthCalculator, "f").stopLoading();
                    if (error.type !== "abort") {
                        __classPrivateFieldGet(this, _Peer_bandwidthCalculator, "f").clear();
                        __classPrivateFieldGet(this, _Peer_cachedDownloadBandwidth, "f").timestamp = 0;
                        __classPrivateFieldGet(this, _Peer_logger, "f").call(this, `cleared bandwidth history due to ${error.type}`);
                    }
                    __classPrivateFieldSet(this, _Peer_downloadingContext, undefined, "f");
                    if (error.type === "bytes-receiving-timeout") {
                        __classPrivateFieldSet(this, _Peer_consecutiveTimeouts, (_a = __classPrivateFieldGet(this, _Peer_consecutiveTimeouts, "f"), _a++, _a), "f");
                    }
                    if (__classPrivateFieldGet(this, _Peer_consecutiveTimeouts, "f") >= __classPrivateFieldGet(this, _Peer_peerConfig, "f").p2pErrorRetries) {
                        this.destroy(false, new PeerError("timeout", "Too many timeout errors"));
                    }
                    else if (error.type === "bytes-receiving-timeout") {
                        __classPrivateFieldGet(this, _Peer_eventHandlers, "f").onWarning(new PeerWarning("timeout-strike", `Timeout strike ${__classPrivateFieldGet(this, _Peer_consecutiveTimeouts, "f")}/${__classPrivateFieldGet(this, _Peer_peerConfig, "f").p2pErrorRetries}`));
                    }
                },
            }),
        }, "f");
        const command = {
            c: PeerCommandType.SegmentRequest,
            r: __classPrivateFieldGet(this, _Peer_downloadingContext, "f").requestId,
            i: segmentRequest.segment.externalId,
        };
        if (segmentRequest.loadedBytes)
            command.b = segmentRequest.loadedBytes;
        if (!__classPrivateFieldGet(this, _Peer_instances, "m", _Peer_sendCommand).call(this, command)) {
            __classPrivateFieldGet(this, _Peer_instances, "m", _Peer_cancelSegmentDownloading).call(this, "peer-closed");
        }
    }
    uploadSegmentData(segment, requestId, 
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
    data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, _Peer_isDestroyed, "f"))
                return;
            if (requestId !== __classPrivateFieldGet(this, _Peer_latestRequestedUploadRequestId, "f")) {
                __classPrivateFieldGet(this, _Peer_logger, "f").call(this, `discarding obsolete upload request ${requestId} for segment ${segment.externalId}`);
                return;
            }
            const { externalId } = segment;
            __classPrivateFieldGet(this, _Peer_logger, "f").call(this, `send segment ${segment.externalId} to ${this.id} (byteLength: ${data.byteLength})`);
            const command = {
                c: PeerCommandType.SegmentData,
                i: externalId,
                r: requestId,
                s: data.byteLength,
            };
            if (!__classPrivateFieldGet(this, _Peer_instances, "m", _Peer_sendCommand).call(this, command))
                return;
            try {
                yield __classPrivateFieldGet(this, _Peer_peerProtocol, "f").splitSegmentDataToChunksAndUploadAsync(data, requestId);
                if (this.isDestroyed ||
                    requestId !== __classPrivateFieldGet(this, _Peer_latestRequestedUploadRequestId, "f")) {
                    return;
                }
                __classPrivateFieldGet(this, _Peer_instances, "m", _Peer_sendSegmentDataSendingCompletedCommand).call(this, segment, requestId);
                __classPrivateFieldGet(this, _Peer_logger, "f").call(this, `segment ${externalId} has been sent to ${this.id}`);
            }
            catch (error) {
                __classPrivateFieldGet(this, _Peer_logger, "f").call(this, `cancel segment uploading ${externalId}: %O`, error);
            }
        });
    }
    sendSegmentsAnnouncementCommand(loadedSegmentsIds, httpLoadingSegmentsIds) {
        const command = {
            c: PeerCommandType.SegmentsAnnouncement,
            p: httpLoadingSegmentsIds,
            l: loadedSegmentsIds,
        };
        void __classPrivateFieldGet(this, _Peer_instances, "m", _Peer_sendCommand).call(this, command);
    }
    sendSegmentAbsentCommand(segmentExternalId, requestId) {
        void __classPrivateFieldGet(this, _Peer_instances, "m", _Peer_sendCommand).call(this, {
            c: PeerCommandType.SegmentAbsent,
            i: segmentExternalId,
            r: requestId,
        });
    }
    destroy(isConnectionClosed = false, error) {
        if (__classPrivateFieldGet(this, _Peer_isDestroyed, "f"))
            return;
        __classPrivateFieldSet(this, _Peer_isDestroyed, true, "f");
        __classPrivateFieldGet(this, _Peer_instances, "m", _Peer_cancelSegmentDownloading).call(this, "peer-closed", error);
        __classPrivateFieldGet(this, _Peer_peerProtocol, "f").destroy();
        if (!isConnectionClosed) {
            __classPrivateFieldGet(this, _Peer_closeConnection, "f").call(this, error);
        }
        __classPrivateFieldGet(this, _Peer_logger, "f").call(this, `peer closed ${this.id}`);
    }
}
_Peer_peerProtocol = new WeakMap(), _Peer_downloadingContext = new WeakMap(), _Peer_loadedSegments = new WeakMap(), _Peer_httpLoadingSegments = new WeakMap(), _Peer_consecutiveTimeouts = new WeakMap(), _Peer_bandwidthCalculator = new WeakMap(), _Peer_cachedDownloadBandwidth = new WeakMap(), _Peer_logger = new WeakMap(), _Peer_nextRequestId = new WeakMap(), _Peer_latestRequestedUploadRequestId = new WeakMap(), _Peer_isDestroyed = new WeakMap(), _Peer_closeConnection = new WeakMap(), _Peer_eventHandlers = new WeakMap(), _Peer_peerConfig = new WeakMap(), _Peer_onCommandReceived = new WeakMap(), _Peer_onSegmentChunkReceived = new WeakMap(), _Peer_instances = new WeakSet(), _Peer_destroyOnPeerError = function _Peer_destroyOnPeerError(type, message) {
    var _a;
    (_a = __classPrivateFieldGet(this, _Peer_downloadingContext, "f")) === null || _a === void 0 ? void 0 : _a.request.clearLoadedBytes();
    const error = new PeerError(type, message);
    __classPrivateFieldGet(this, _Peer_instances, "m", _Peer_cancelSegmentDownloading).call(this, "peer-closed", error);
    this.destroy(false, error);
}, _Peer_cancelSegmentDownloading = function _Peer_cancelSegmentDownloading(type, cause) {
    if (!__classPrivateFieldGet(this, _Peer_downloadingContext, "f"))
        return;
    const { request, controls } = __classPrivateFieldGet(this, _Peer_downloadingContext, "f");
    const { segment } = request;
    __classPrivateFieldGet(this, _Peer_logger, "f").call(this, `cancel segment request ${segment.externalId} (${type})`);
    const error = new RequestError(type, undefined, cause);
    // Note: failWithError DOES NOT trigger the onAbort callback above.
    // We must manually clean up the peer's downloading context and bandwidth state.
    controls.failWithError(error);
    __classPrivateFieldGet(this, _Peer_bandwidthCalculator, "f").stopLoading();
    if (type !== "peer-segment-absent") {
        __classPrivateFieldGet(this, _Peer_bandwidthCalculator, "f").clear();
        __classPrivateFieldGet(this, _Peer_cachedDownloadBandwidth, "f").timestamp = 0;
        __classPrivateFieldGet(this, _Peer_logger, "f").call(this, `cleared bandwidth history due to ${error.type}`);
    }
    __classPrivateFieldSet(this, _Peer_downloadingContext, undefined, "f");
}, _Peer_sendCancelSegmentRequestCommand = function _Peer_sendCancelSegmentRequestCommand(segment, requestId) {
    void __classPrivateFieldGet(this, _Peer_instances, "m", _Peer_sendCommand).call(this, {
        c: PeerCommandType.CancelSegmentRequest,
        i: segment.externalId,
        r: requestId,
    });
}, _Peer_sendSegmentDataSendingCompletedCommand = function _Peer_sendSegmentDataSendingCompletedCommand(segment, requestId) {
    void __classPrivateFieldGet(this, _Peer_instances, "m", _Peer_sendCommand).call(this, {
        c: PeerCommandType.SegmentDataSendingCompleted,
        r: requestId,
        i: segment.externalId,
    });
}, _Peer_sendCommand = function _Peer_sendCommand(command) {
    if (__classPrivateFieldGet(this, _Peer_isDestroyed, "f"))
        return false;
    try {
        __classPrivateFieldGet(this, _Peer_peerProtocol, "f").sendCommand(command);
        return true;
    }
    catch (error) {
        __classPrivateFieldGet(this, _Peer_logger, "f").call(this, "error sending command %d: %O", command.c, error);
        return false;
    }
};
//# sourceMappingURL=peer.js.map