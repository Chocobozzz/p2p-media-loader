var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _P2PLoader_instances, _P2PLoader_webtorrentManager, _P2PLoader_peersMap, _P2PLoader_isAnnounceMicrotaskCreated, _P2PLoader_webtorrentManagerLogger, _P2PLoader_churnLogger, _P2PLoader_stream, _P2PLoader_requests, _P2PLoader_segmentStorage, _P2PLoader_config, _P2PLoader_webTorrentSocketPool, _P2PLoader_eventTarget, _P2PLoader_onSegmentAnnouncement, _P2PLoader_churnCleanupTimeoutId, _P2PLoader_onPeerConnect, _P2PLoader_onPeerConnectError, _P2PLoader_onPeerClose, _P2PLoader_onPeerError, _P2PLoader_onPeerWarning, _P2PLoader_onTrackerWarning, _P2PLoader_onTrackerError, _P2PLoader_churnCleanup, _P2PLoader_getSegmentsAnnouncement, _P2PLoader_onPeerConnectedWebTorrent, _P2PLoader_onPeerDisconnectedWebTorrent, _P2PLoader_sendSegmentsAnnouncement, _P2PLoader_onSegmentRequested;
import { Peer } from "./peer.js";
import { WebTorrentManager } from "../webtorrent/webtorrent-manager/index.js";
import * as StreamUtils from "../utils/stream.js";
import * as Utils from "../utils/utils.js";
import debug from "debug";
const MIN_CHURN_CLEANUP_INTERVAL_MS = 1000;
export class P2PLoader {
    constructor(stream, requests, segmentStorage, config, webTorrentSocketPool, eventTarget, peerId, onSegmentAnnouncement) {
        _P2PLoader_instances.add(this);
        _P2PLoader_webtorrentManager.set(this, void 0);
        _P2PLoader_peersMap.set(this, new Map());
        _P2PLoader_isAnnounceMicrotaskCreated.set(this, false);
        _P2PLoader_webtorrentManagerLogger.set(this, debug("p2pml-core:webtorrent-manager"));
        _P2PLoader_churnLogger.set(this, debug("p2pml-core:churn-cleanup"));
        _P2PLoader_stream.set(this, void 0);
        _P2PLoader_requests.set(this, void 0);
        _P2PLoader_segmentStorage.set(this, void 0);
        _P2PLoader_config.set(this, void 0);
        _P2PLoader_webTorrentSocketPool.set(this, void 0);
        _P2PLoader_eventTarget.set(this, void 0);
        _P2PLoader_onSegmentAnnouncement.set(this, void 0);
        _P2PLoader_churnCleanupTimeoutId.set(this, void 0);
        _P2PLoader_onPeerConnect.set(this, void 0);
        _P2PLoader_onPeerConnectError.set(this, void 0);
        _P2PLoader_onPeerClose.set(this, void 0);
        _P2PLoader_onPeerError.set(this, void 0);
        _P2PLoader_onPeerWarning.set(this, void 0);
        _P2PLoader_onTrackerWarning.set(this, void 0);
        _P2PLoader_onTrackerError.set(this, void 0);
        _P2PLoader_churnCleanup.set(this, () => {
            // Schedule the next run dynamically based on the current config value, enforcing a minimum safe interval
            __classPrivateFieldSet(this, _P2PLoader_churnCleanupTimeoutId, setTimeout(__classPrivateFieldGet(this, _P2PLoader_churnCleanup, "f"), Math.max(MIN_CHURN_CLEANUP_INTERVAL_MS, __classPrivateFieldGet(this, _P2PLoader_config, "f").p2pChurnCleanupIntervalMs)), "f");
            const excessPeersCount = __classPrivateFieldGet(this, _P2PLoader_peersMap, "f").size - __classPrivateFieldGet(this, _P2PLoader_config, "f").p2pMaxPeers;
            if (excessPeersCount <= 0)
                return;
            const eligiblePeers = [];
            const now = performance.now();
            for (const peer of __classPrivateFieldGet(this, _P2PLoader_peersMap, "f").values()) {
                // Don't drop peers that are actively downloading or uploading to avoid interrupting streams
                if (peer.downloadingSegment || peer.isUploadingSegment)
                    continue;
                // Give new peers a grace period to establish connections and prove their bandwidth
                if (now - peer.connectedAt < __classPrivateFieldGet(this, _P2PLoader_config, "f").p2pChurnGracePeriodMs) {
                    continue;
                }
                eligiblePeers.push(peer);
            }
            if (eligiblePeers.length === 0)
                return;
            eligiblePeers.sort((a, b) => {
                return (a.getDownloadBandwidth() - b.getDownloadBandwidth() ||
                    a.connectedAt - b.connectedAt);
            });
            const peersToDrop = eligiblePeers.slice(0, excessPeersCount);
            __classPrivateFieldGet(this, _P2PLoader_churnLogger, "f").call(this, `Background churn cleanup: dropping ${peersToDrop.length} excess peers ` +
                `(total: ${__classPrivateFieldGet(this, _P2PLoader_peersMap, "f").size}, target: ${__classPrivateFieldGet(this, _P2PLoader_config, "f").p2pMaxPeers}, eligible: ${eligiblePeers.length})`);
            for (const peer of peersToDrop) {
                __classPrivateFieldGet(this, _P2PLoader_churnLogger, "f").call(this, `dropping excess peer ${peer.id} with bandwidth ${peer.getDownloadBandwidth()}`);
                peer.destroy();
            }
        });
        _P2PLoader_onPeerConnectedWebTorrent.set(this, (event) => {
            __classPrivateFieldGet(this, _P2PLoader_webtorrentManagerLogger, "f").call(this, `peerConnected: peerId=${event.peerId}`);
            if (__classPrivateFieldGet(this, _P2PLoader_peersMap, "f").has(event.peerId)) {
                event.close();
                return;
            }
            const peer = new Peer(event.peerId, event.channel, event.close, {
                onSegmentRequested: (peer, segmentExternalId, requestId, byteFrom) => {
                    __classPrivateFieldGet(this, _P2PLoader_onSegmentRequested, "f").call(this, peer, segmentExternalId, requestId, byteFrom).catch((error) => {
                        __classPrivateFieldGet(this, _P2PLoader_webtorrentManagerLogger, "f").call(this, `Error in onSegmentRequested ${segmentExternalId} for peer ${peer.id}:`, error);
                    });
                },
                onSegmentsAnnouncement: __classPrivateFieldGet(this, _P2PLoader_onSegmentAnnouncement, "f"),
                onWarning: (warning) => {
                    __classPrivateFieldGet(this, _P2PLoader_onPeerWarning, "f").call(this, {
                        peerId: peer.id,
                        infoHash: __classPrivateFieldGet(this, _P2PLoader_stream, "f").infoHash,
                        streamType: __classPrivateFieldGet(this, _P2PLoader_stream, "f").type,
                        trackerUrl: event.trackerUrl,
                        warning,
                    });
                },
            }, {
                p2pNotReceivingBytesTimeoutMs: __classPrivateFieldGet(this, _P2PLoader_config, "f").p2pNotReceivingBytesTimeoutMs,
                webRtcMaxMessageSize: __classPrivateFieldGet(this, _P2PLoader_config, "f").webRtcMaxMessageSize,
                p2pErrorRetries: __classPrivateFieldGet(this, _P2PLoader_config, "f").p2pErrorRetries,
                validateP2PSegment: __classPrivateFieldGet(this, _P2PLoader_config, "f").validateP2PSegment,
                streamType: __classPrivateFieldGet(this, _P2PLoader_stream, "f").type,
                infoHash: __classPrivateFieldGet(this, _P2PLoader_stream, "f").infoHash,
            }, __classPrivateFieldGet(this, _P2PLoader_eventTarget, "f"));
            __classPrivateFieldGet(this, _P2PLoader_peersMap, "f").set(event.peerId, peer);
            __classPrivateFieldGet(this, _P2PLoader_onPeerConnect, "f").call(this, {
                peerId: event.peerId,
                infoHash: __classPrivateFieldGet(this, _P2PLoader_stream, "f").infoHash,
                streamType: __classPrivateFieldGet(this, _P2PLoader_stream, "f").type,
                trackerUrl: event.trackerUrl,
            });
            if (__classPrivateFieldGet(this, _P2PLoader_config, "f").isP2PUploadDisabled)
                return;
            const { httpLoading, loaded } = __classPrivateFieldGet(this, _P2PLoader_instances, "m", _P2PLoader_getSegmentsAnnouncement).call(this);
            peer.sendSegmentsAnnouncementCommand(loaded, httpLoading);
        });
        _P2PLoader_onPeerDisconnectedWebTorrent.set(this, (event) => {
            var _a;
            __classPrivateFieldGet(this, _P2PLoader_webtorrentManagerLogger, "f").call(this, "peerDisconnected: peerId=%s error=%s reason=%s", event.peerId, (_a = event.error) === null || _a === void 0 ? void 0 : _a.message, event.disconnectReason);
            const peer = __classPrivateFieldGet(this, _P2PLoader_peersMap, "f").get(event.peerId);
            if (!peer)
                return;
            __classPrivateFieldGet(this, _P2PLoader_peersMap, "f").delete(event.peerId);
            peer.destroy(true);
            if (event.error) {
                __classPrivateFieldGet(this, _P2PLoader_onPeerError, "f").call(this, {
                    peerId: event.peerId,
                    infoHash: __classPrivateFieldGet(this, _P2PLoader_stream, "f").infoHash,
                    streamType: __classPrivateFieldGet(this, _P2PLoader_stream, "f").type,
                    trackerUrl: event.trackerUrl,
                    error: event.error,
                });
            }
            __classPrivateFieldGet(this, _P2PLoader_onPeerClose, "f").call(this, {
                peerId: peer.id,
                infoHash: __classPrivateFieldGet(this, _P2PLoader_stream, "f").infoHash,
                streamType: __classPrivateFieldGet(this, _P2PLoader_stream, "f").type,
                trackerUrl: event.trackerUrl,
            });
        });
        Object.defineProperty(this, "broadcastAnnouncement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (sendEmptyAnnouncement = false) => {
                if (sendEmptyAnnouncement) {
                    __classPrivateFieldGet(this, _P2PLoader_sendSegmentsAnnouncement, "f").call(this, sendEmptyAnnouncement);
                    return;
                }
                if (__classPrivateFieldGet(this, _P2PLoader_isAnnounceMicrotaskCreated, "f") || __classPrivateFieldGet(this, _P2PLoader_config, "f").isP2PUploadDisabled) {
                    return;
                }
                __classPrivateFieldGet(this, _P2PLoader_sendSegmentsAnnouncement, "f").call(this);
            }
        });
        _P2PLoader_sendSegmentsAnnouncement.set(this, (sendEmptyAnnouncement = false) => {
            __classPrivateFieldSet(this, _P2PLoader_isAnnounceMicrotaskCreated, true, "f");
            Utils.queueMicrotask(() => {
                const { loaded = [], httpLoading = [] } = sendEmptyAnnouncement
                    ? {}
                    : __classPrivateFieldGet(this, _P2PLoader_instances, "m", _P2PLoader_getSegmentsAnnouncement).call(this);
                for (const peer of __classPrivateFieldGet(this, _P2PLoader_peersMap, "f").values()) {
                    peer.sendSegmentsAnnouncementCommand(loaded, httpLoading);
                }
                __classPrivateFieldSet(this, _P2PLoader_isAnnounceMicrotaskCreated, false, "f");
            });
        });
        _P2PLoader_onSegmentRequested.set(this, (peer, segmentExternalId, requestId, byteFrom) => __awaiter(this, void 0, void 0, function* () {
            const segment = StreamUtils.getSegmentFromStreamByExternalId(__classPrivateFieldGet(this, _P2PLoader_stream, "f"), segmentExternalId);
            if (!segment)
                return;
            if (__classPrivateFieldGet(this, _P2PLoader_config, "f").isP2PUploadDisabled) {
                peer.sendSegmentAbsentCommand(segmentExternalId, requestId);
                return;
            }
            let segmentData;
            try {
                segmentData = yield __classPrivateFieldGet(this, _P2PLoader_segmentStorage, "f").getSegmentData(__classPrivateFieldGet(this, _P2PLoader_stream, "f").swarmId, __classPrivateFieldGet(this, _P2PLoader_stream, "f").streamSwarmId, segment.externalId);
            }
            catch (error) {
                __classPrivateFieldGet(this, _P2PLoader_webtorrentManagerLogger, "f").call(this, `Storage error for segment ${segmentExternalId} requested by peer ${peer.id}:`, error);
            }
            const peerClosedWhileAwait = !__classPrivateFieldGet(this, _P2PLoader_peersMap, "f").has(peer.id);
            if (peerClosedWhileAwait)
                return;
            if (!segmentData) {
                peer.sendSegmentAbsentCommand(segmentExternalId, requestId);
                return;
            }
            yield peer.uploadSegmentData(segment, requestId, byteFrom !== undefined
                ? new Uint8Array(segmentData).subarray(byteFrom)
                : segmentData);
        }));
        __classPrivateFieldSet(this, _P2PLoader_stream, stream, "f");
        __classPrivateFieldSet(this, _P2PLoader_requests, requests, "f");
        __classPrivateFieldSet(this, _P2PLoader_segmentStorage, segmentStorage, "f");
        __classPrivateFieldSet(this, _P2PLoader_config, config, "f");
        __classPrivateFieldSet(this, _P2PLoader_webTorrentSocketPool, webTorrentSocketPool, "f");
        __classPrivateFieldSet(this, _P2PLoader_eventTarget, eventTarget, "f");
        __classPrivateFieldSet(this, _P2PLoader_onSegmentAnnouncement, onSegmentAnnouncement, "f");
        __classPrivateFieldSet(this, _P2PLoader_onPeerConnect, eventTarget.getEventDispatcher("onPeerConnect"), "f");
        __classPrivateFieldSet(this, _P2PLoader_onPeerConnectError, eventTarget.getEventDispatcher("onPeerConnectError"), "f");
        __classPrivateFieldSet(this, _P2PLoader_onPeerClose, eventTarget.getEventDispatcher("onPeerClose"), "f");
        __classPrivateFieldSet(this, _P2PLoader_onPeerError, eventTarget.getEventDispatcher("onPeerError"), "f");
        __classPrivateFieldSet(this, _P2PLoader_onPeerWarning, eventTarget.getEventDispatcher("onPeerWarning"), "f");
        __classPrivateFieldSet(this, _P2PLoader_onTrackerWarning, eventTarget.getEventDispatcher("onTrackerWarning"), "f");
        __classPrivateFieldSet(this, _P2PLoader_onTrackerError, eventTarget.getEventDispatcher("onTrackerError"), "f");
        __classPrivateFieldSet(this, _P2PLoader_webtorrentManager, new WebTorrentManager({
            infoHash: __classPrivateFieldGet(this, _P2PLoader_stream, "f").infoHash,
            peerId,
            trackerUrls: __classPrivateFieldGet(this, _P2PLoader_config, "f").announceTrackers,
            rtcConfig: () => __classPrivateFieldGet(this, _P2PLoader_config, "f").rtcConfig,
            socketPool: __classPrivateFieldGet(this, _P2PLoader_webTorrentSocketPool, "f"),
            maxPeers: () => __classPrivateFieldGet(this, _P2PLoader_config, "f").p2pMaxPeers,
            maxPeersMultiplier: () => __classPrivateFieldGet(this, _P2PLoader_config, "f").p2pChurnMaxPeersMultiplier,
            offersCount: () => __classPrivateFieldGet(this, _P2PLoader_config, "f").webRtcOffersCount,
            offerTimeout: () => __classPrivateFieldGet(this, _P2PLoader_config, "f").webRtcOfferTimeoutMs,
            iceGatheringTimeout: () => __classPrivateFieldGet(this, _P2PLoader_config, "f").webRtcIceGatheringTimeoutMs,
            connectionTimeout: () => __classPrivateFieldGet(this, _P2PLoader_config, "f").webRtcConnectionTimeoutMs,
        }), "f");
        __classPrivateFieldGet(this, _P2PLoader_webtorrentManager, "f").addEventListener("peerConnected", __classPrivateFieldGet(this, _P2PLoader_onPeerConnectedWebTorrent, "f"));
        __classPrivateFieldGet(this, _P2PLoader_webtorrentManager, "f").addEventListener("peerDisconnected", __classPrivateFieldGet(this, _P2PLoader_onPeerDisconnectedWebTorrent, "f"));
        __classPrivateFieldGet(this, _P2PLoader_webtorrentManager, "f").addEventListener("peerConnectFailed", (event) => {
            __classPrivateFieldGet(this, _P2PLoader_webtorrentManagerLogger, "f").call(this, `Peer connection failed (${event.peerId}) from tracker ${event.trackerUrl}:`, event.error);
            __classPrivateFieldGet(this, _P2PLoader_onPeerConnectError, "f").call(this, {
                peerId: event.peerId,
                infoHash: __classPrivateFieldGet(this, _P2PLoader_stream, "f").infoHash,
                streamType: __classPrivateFieldGet(this, _P2PLoader_stream, "f").type,
                trackerUrl: event.trackerUrl,
                error: event.error,
            });
        });
        __classPrivateFieldGet(this, _P2PLoader_webtorrentManager, "f").addEventListener("warning", (event) => {
            __classPrivateFieldGet(this, _P2PLoader_webtorrentManagerLogger, "f").call(this, `Tracker warning (${event.trackerUrl}):`, event.warning);
            __classPrivateFieldGet(this, _P2PLoader_onTrackerWarning, "f").call(this, {
                trackerUrl: event.trackerUrl,
                infoHash: __classPrivateFieldGet(this, _P2PLoader_stream, "f").infoHash,
                streamType: __classPrivateFieldGet(this, _P2PLoader_stream, "f").type,
                warning: event.warning,
            });
        });
        __classPrivateFieldGet(this, _P2PLoader_webtorrentManager, "f").addEventListener("error", (event) => {
            __classPrivateFieldGet(this, _P2PLoader_webtorrentManagerLogger, "f").call(this, `Tracker error (${event.trackerUrl}):`, event.error);
            __classPrivateFieldGet(this, _P2PLoader_onTrackerError, "f").call(this, {
                trackerUrl: event.trackerUrl,
                infoHash: __classPrivateFieldGet(this, _P2PLoader_stream, "f").infoHash,
                streamType: __classPrivateFieldGet(this, _P2PLoader_stream, "f").type,
                error: event.error,
            });
        });
        __classPrivateFieldGet(this, _P2PLoader_eventTarget, "f").addEventListener(`onStorageUpdated-${__classPrivateFieldGet(this, _P2PLoader_stream, "f").streamSwarmId}`, this.broadcastAnnouncement);
        __classPrivateFieldGet(this, _P2PLoader_webtorrentManager, "f").start();
        __classPrivateFieldSet(this, _P2PLoader_churnCleanupTimeoutId, setTimeout(__classPrivateFieldGet(this, _P2PLoader_churnCleanup, "f"), Math.max(MIN_CHURN_CLEANUP_INTERVAL_MS, __classPrivateFieldGet(this, _P2PLoader_config, "f").p2pChurnCleanupIntervalMs)), "f");
    }
    downloadSegment(segment) {
        const peersWithSegment = [];
        for (const peer of __classPrivateFieldGet(this, _P2PLoader_peersMap, "f").values()) {
            if (!peer.downloadingSegment &&
                peer.getSegmentStatus(segment) === "loaded") {
                peersWithSegment.push(peer);
            }
        }
        if (peersWithSegment.length === 0)
            return;
        const selectedPeer = selectPeerForDownload(peersWithSegment);
        const request = __classPrivateFieldGet(this, _P2PLoader_requests, "f").getOrCreateRequest(segment);
        selectedPeer.downloadSegment(request);
    }
    isSegmentLoadingOrLoadedBySomeone(segment) {
        for (const peer of __classPrivateFieldGet(this, _P2PLoader_peersMap, "f").values()) {
            if (peer.getSegmentStatus(segment))
                return true;
        }
        return false;
    }
    isSegmentLoadedBySomeone(segment) {
        for (const peer of __classPrivateFieldGet(this, _P2PLoader_peersMap, "f").values()) {
            if (peer.getSegmentStatus(segment) === "loaded")
                return true;
        }
        return false;
    }
    get connectedPeerCount() {
        return __classPrivateFieldGet(this, _P2PLoader_peersMap, "f").size;
    }
    *peers() {
        for (const peer of __classPrivateFieldGet(this, _P2PLoader_peersMap, "f").values()) {
            yield peer;
        }
    }
    destroy() {
        clearTimeout(__classPrivateFieldGet(this, _P2PLoader_churnCleanupTimeoutId, "f"));
        __classPrivateFieldSet(this, _P2PLoader_churnCleanupTimeoutId, undefined, "f");
        __classPrivateFieldGet(this, _P2PLoader_eventTarget, "f").removeEventListener(`onStorageUpdated-${__classPrivateFieldGet(this, _P2PLoader_stream, "f").streamSwarmId}`, this.broadcastAnnouncement);
        // webtorrentManager.destroy() internally clears its event target and dispatches
        // synchronous "peerDisconnected" events for active peers. These events trigger
        // our #onPeerDisconnectedWebTorrent handler, which destroys peer wrappers and
        // removes them from #peersMap. We destroy webtorrentManager first to prevent
        // redundant WebRTC connection closing calls during the manual peer cleanup loop.
        __classPrivateFieldGet(this, _P2PLoader_webtorrentManager, "f").destroy();
        for (const peer of __classPrivateFieldGet(this, _P2PLoader_peersMap, "f").values()) {
            peer.destroy();
        }
        __classPrivateFieldGet(this, _P2PLoader_peersMap, "f").clear();
    }
}
_P2PLoader_webtorrentManager = new WeakMap(), _P2PLoader_peersMap = new WeakMap(), _P2PLoader_isAnnounceMicrotaskCreated = new WeakMap(), _P2PLoader_webtorrentManagerLogger = new WeakMap(), _P2PLoader_churnLogger = new WeakMap(), _P2PLoader_stream = new WeakMap(), _P2PLoader_requests = new WeakMap(), _P2PLoader_segmentStorage = new WeakMap(), _P2PLoader_config = new WeakMap(), _P2PLoader_webTorrentSocketPool = new WeakMap(), _P2PLoader_eventTarget = new WeakMap(), _P2PLoader_onSegmentAnnouncement = new WeakMap(), _P2PLoader_churnCleanupTimeoutId = new WeakMap(), _P2PLoader_onPeerConnect = new WeakMap(), _P2PLoader_onPeerConnectError = new WeakMap(), _P2PLoader_onPeerClose = new WeakMap(), _P2PLoader_onPeerError = new WeakMap(), _P2PLoader_onPeerWarning = new WeakMap(), _P2PLoader_onTrackerWarning = new WeakMap(), _P2PLoader_onTrackerError = new WeakMap(), _P2PLoader_churnCleanup = new WeakMap(), _P2PLoader_onPeerConnectedWebTorrent = new WeakMap(), _P2PLoader_onPeerDisconnectedWebTorrent = new WeakMap(), _P2PLoader_sendSegmentsAnnouncement = new WeakMap(), _P2PLoader_onSegmentRequested = new WeakMap(), _P2PLoader_instances = new WeakSet(), _P2PLoader_getSegmentsAnnouncement = function _P2PLoader_getSegmentsAnnouncement() {
    const loaded = __classPrivateFieldGet(this, _P2PLoader_segmentStorage, "f").getStoredSegmentIds(__classPrivateFieldGet(this, _P2PLoader_stream, "f").swarmId, __classPrivateFieldGet(this, _P2PLoader_stream, "f").streamSwarmId);
    const httpLoading = [];
    for (const request of __classPrivateFieldGet(this, _P2PLoader_requests, "f").httpRequests()) {
        const segment = __classPrivateFieldGet(this, _P2PLoader_stream, "f").segments.get(request.segment.runtimeId);
        if (!segment)
            continue;
        httpLoading.push(segment.externalId);
    }
    return { loaded, httpLoading };
};
export function selectPeerForDownload(peersWithSegment) {
    if (peersWithSegment.length === 1) {
        return peersWithSegment[0];
    }
    let maxSpeed = 0;
    for (const peer of peersWithSegment) {
        const speed = peer.getDownloadBandwidth();
        if (speed > maxSpeed)
            maxSpeed = speed;
    }
    if (maxSpeed > 0) {
        const baseSpeed = Math.max(1, maxSpeed * 0.1);
        let unprovenPeersCount = 0;
        let provenPeersWeight = 0;
        for (const peer of peersWithSegment) {
            if (peer.getDownloadBandwidth() <= baseSpeed) {
                unprovenPeersCount++;
            }
            else {
                provenPeersWeight += peer.getDownloadBandwidth();
            }
        }
        let adjustedBaseSpeed = baseSpeed;
        if (unprovenPeersCount > 0 &&
            provenPeersWeight > 0 &&
            unprovenPeersCount * baseSpeed > provenPeersWeight) {
            adjustedBaseSpeed = provenPeersWeight / unprovenPeersCount;
        }
        return Utils.getWeightedRandomItem(peersWithSegment, (peer) => Math.max(peer.getDownloadBandwidth(), adjustedBaseSpeed));
    }
    else {
        return Utils.getRandomItem(peersWithSegment);
    }
}
//# sourceMappingURL=loader.js.map