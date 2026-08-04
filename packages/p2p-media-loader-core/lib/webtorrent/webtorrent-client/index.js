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
var _WebTorrentClient_instances, _a, _WebTorrentClient_DEFAULT_ANNOUNCE_INTERVAL_SECONDS, _WebTorrentClient_MIN_ANNOUNCE_INTERVAL_SECONDS, _WebTorrentClient_config, _WebTorrentClient_wsClient, _WebTorrentClient_eventTarget, _WebTorrentClient_pendingOffers, _WebTorrentClient_negotiatingConnections, _WebTorrentClient_destroyAbortController, _WebTorrentClient_announceTimeoutId, _WebTorrentClient_announceIntervalSeconds, _WebTorrentClient_scheduleAnnounceRunId, _WebTorrentClient_activeAnnouncePromise, _WebTorrentClient_nextAnnounceEvent, _WebTorrentClient_trackerId, _WebTorrentClient_started, _WebTorrentClient_isDestroyed, _WebTorrentClient_throwIfDestroyed, _WebTorrentClient_onWsConnected, _WebTorrentClient_onWsDisconnected, _WebTorrentClient_onWsMessage, _WebTorrentClient_scheduleAnnounce, _WebTorrentClient_clearAnnounceTimeout, _WebTorrentClient_announce, _WebTorrentClient_createOffer, _WebTorrentClient_sendStopped, _WebTorrentClient_buildAnnouncePayload, _WebTorrentClient_handleIncomingOffer, _WebTorrentClient_handleIncomingAnswer, _WebTorrentClient_waitForIceGathering, _WebTorrentClient_waitForConnection, _WebTorrentClient_cleanupPendingOffer, _WebTorrentClient_cleanupPendingOffers, _WebTorrentClient_cleanupNegotiatingConnections;
import { EventTarget } from "../../utils/event-target.js";
import { getPromiseWithResolvers } from "../../utils/utils.js";
import { isTerminalConnectionState } from "../utils.js";
import { TrackerError, TrackerWarning, PeerConnectError } from "../../types.js";
import { SafeAbortController } from "../../utils/abort-controller.js";
import { PeerConnection, SessionDescription, safeCreateOffer, safeCreateAnswer, safeSetLocalDescription, safeSetRemoteDescription, } from "./webrtc-utils.js";
const WEBTORRENT_DEFAULT_OFFER_TIMEOUT = 50000;
const WEBTORRENT_DEFAULT_CONNECTION_TIMEOUT = 15000;
const WEBTORRENT_DEFAULT_OFFERS_COUNT = 5;
const WEBTORRENT_DEFAULT_ICE_GATHERING_TIMEOUT = 5000;
function generateOfferId() {
    // Generate a safe 20-character alphanumeric string
    let id = "";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 20; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}
const VALID_SDP_TYPES = new Set(["offer", "answer", "pranswer", "rollback"]);
function isSessionDescriptionInit(value) {
    if (typeof value !== "object" || value === null)
        return false;
    const obj = value;
    return (typeof obj.type === "string" &&
        VALID_SDP_TYPES.has(obj.type) &&
        typeof obj.sdp === "string");
}
export class WebTorrentClient {
    constructor(config) {
        var _b, _c, _d, _e, _f, _g;
        _WebTorrentClient_instances.add(this);
        _WebTorrentClient_config.set(this, void 0);
        _WebTorrentClient_wsClient.set(this, void 0);
        _WebTorrentClient_eventTarget.set(this, new EventTarget());
        _WebTorrentClient_pendingOffers.set(this, new Map());
        _WebTorrentClient_negotiatingConnections.set(this, new Set());
        _WebTorrentClient_destroyAbortController.set(this, new SafeAbortController());
        _WebTorrentClient_announceTimeoutId.set(this, null);
        _WebTorrentClient_announceIntervalSeconds.set(this, null);
        _WebTorrentClient_scheduleAnnounceRunId.set(this, 0);
        _WebTorrentClient_activeAnnouncePromise.set(this, null);
        _WebTorrentClient_nextAnnounceEvent.set(this, undefined);
        _WebTorrentClient_trackerId.set(this, null);
        _WebTorrentClient_started.set(this, false);
        _WebTorrentClient_onWsConnected.set(this, () => {
            // Setup a fallback interval in case the tracker doesn't provide one
            __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_scheduleAnnounce).call(this, __classPrivateFieldGet(_a, _a, "f", _WebTorrentClient_DEFAULT_ANNOUNCE_INTERVAL_SECONDS));
            // Send the initial announce event
            __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_announce).call(this, "started").catch((err) => {
                if (__classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this))
                    return;
                __classPrivateFieldGet(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("error", new TrackerError("announce-failed", `Initial announce failed: ${err instanceof Error ? err.message : String(err)}`, err));
            });
        });
        _WebTorrentClient_onWsDisconnected.set(this, () => {
            __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_clearAnnounceTimeout).call(this);
            __classPrivateFieldSet(this, _WebTorrentClient_announceIntervalSeconds, null, "f");
        });
        _WebTorrentClient_onWsMessage.set(this, (data) => {
            if (__classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this))
                return;
            let msg;
            try {
                const text = typeof data === "string" ? data : new TextDecoder().decode(data);
                msg = JSON.parse(text);
            }
            catch (err) {
                __classPrivateFieldGet(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("error", new TrackerError("parse-error", `Failed to parse tracker message: ${err instanceof Error ? err.message : String(err)}`, err));
                return;
            }
            if (typeof msg !== "object" || msg === null || Array.isArray(msg))
                return;
            const dataObject = msg;
            // Ignore messages for a different torrent (possible on shared WebSocket connections)
            const infoHash = dataObject.info_hash;
            if (typeof infoHash === "string" && infoHash !== __classPrivateFieldGet(this, _WebTorrentClient_config, "f").infoHash) {
                return;
            }
            const warningMessage = dataObject["warning message"];
            if (typeof warningMessage === "string") {
                __classPrivateFieldGet(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("warning", new TrackerWarning("tracker-response", warningMessage));
            }
            const failureReason = dataObject["failure reason"];
            if (typeof failureReason === "string") {
                __classPrivateFieldGet(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("error", new TrackerError("tracker-response", failureReason));
                return;
            }
            const { interval } = dataObject;
            if (typeof interval === "number" && interval > 0) {
                // Defend against trackers asking for extremely frequent announces
                const safeInterval = Math.max(__classPrivateFieldGet(_a, _a, "f", _WebTorrentClient_MIN_ANNOUNCE_INTERVAL_SECONDS), interval);
                if (__classPrivateFieldGet(this, _WebTorrentClient_announceIntervalSeconds, "f") !== safeInterval) {
                    __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_scheduleAnnounce).call(this, safeInterval);
                }
            }
            // The WebTorrent tracker protocol specifies "tracker id" (with a space) in the
            // response, but expects it to be echoed back as "trackerid" (no space) in
            // subsequent announce requests. We store it here and send it back later.
            const trackerId = dataObject["tracker id"];
            if (typeof trackerId === "string") {
                __classPrivateFieldSet(this, _WebTorrentClient_trackerId, trackerId, "f");
            }
            // Ignore offers/answers from ourselves
            const peerId = dataObject.peer_id;
            if (typeof peerId === "string" && peerId === __classPrivateFieldGet(this, _WebTorrentClient_config, "f").peerId) {
                return;
            }
            // Both offer and answer messages require peer_id and offer_id
            const offerId = dataObject.offer_id;
            if (typeof peerId !== "string" || typeof offerId !== "string")
                return;
            if (isSessionDescriptionInit(dataObject.offer)) {
                __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_handleIncomingOffer).call(this, {
                    sdp: dataObject.offer,
                    peerId,
                    offerId,
                }).catch((err) => {
                    if (__classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this))
                        return;
                    __classPrivateFieldGet(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("error", new TrackerError("signaling-failed", `Failed to handle offer: ${err instanceof Error ? err.message : String(err)}`, err));
                });
            }
            else if (isSessionDescriptionInit(dataObject.answer)) {
                __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_handleIncomingAnswer).call(this, {
                    sdp: dataObject.answer,
                    peerId,
                    offerId,
                }).catch((err) => {
                    if (__classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this))
                        return;
                    __classPrivateFieldGet(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("error", new TrackerError("signaling-failed", `Failed to handle answer: ${err instanceof Error ? err.message : String(err)}`, err));
                });
            }
        });
        __classPrivateFieldSet(this, _WebTorrentClient_config, {
            infoHash: config.infoHash,
            peerId: config.peerId,
            rtcConfig: config.rtcConfig,
            channelConfig: config.channelConfig,
            offerTimeout: (_b = config.offerTimeout) !== null && _b !== void 0 ? _b : (() => WEBTORRENT_DEFAULT_OFFER_TIMEOUT),
            offersCount: (_c = config.offersCount) !== null && _c !== void 0 ? _c : (() => WEBTORRENT_DEFAULT_OFFERS_COUNT),
            iceGatheringTimeout: (_d = config.iceGatheringTimeout) !== null && _d !== void 0 ? _d : (() => WEBTORRENT_DEFAULT_ICE_GATHERING_TIMEOUT),
            connectionTimeout: (_e = config.connectionTimeout) !== null && _e !== void 0 ? _e : (() => WEBTORRENT_DEFAULT_CONNECTION_TIMEOUT),
            claimPeer: (_f = config.claimPeer) !== null && _f !== void 0 ? _f : (() => true),
            shouldGenerateOffers: (_g = config.shouldGenerateOffers) !== null && _g !== void 0 ? _g : (() => true),
        }, "f");
        __classPrivateFieldSet(this, _WebTorrentClient_wsClient, config.wsClient, "f");
    }
    addEventListener(eventName, listener) {
        __classPrivateFieldGet(this, _WebTorrentClient_eventTarget, "f").addEventListener(eventName, listener);
    }
    removeEventListener(eventName, listener) {
        __classPrivateFieldGet(this, _WebTorrentClient_eventTarget, "f").removeEventListener(eventName, listener);
    }
    start() {
        if (__classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this) || __classPrivateFieldGet(this, _WebTorrentClient_started, "f"))
            return;
        __classPrivateFieldSet(this, _WebTorrentClient_started, true, "f");
        __classPrivateFieldGet(this, _WebTorrentClient_wsClient, "f").addEventListener("connected", __classPrivateFieldGet(this, _WebTorrentClient_onWsConnected, "f"));
        __classPrivateFieldGet(this, _WebTorrentClient_wsClient, "f").addEventListener("disconnected", __classPrivateFieldGet(this, _WebTorrentClient_onWsDisconnected, "f"));
        __classPrivateFieldGet(this, _WebTorrentClient_wsClient, "f").addEventListener("message", __classPrivateFieldGet(this, _WebTorrentClient_onWsMessage, "f"));
        if (__classPrivateFieldGet(this, _WebTorrentClient_wsClient, "f").state === "connected") {
            __classPrivateFieldGet(this, _WebTorrentClient_onWsConnected, "f").call(this);
        }
    }
    destroy() {
        if (__classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this))
            return;
        __classPrivateFieldGet(this, _WebTorrentClient_destroyAbortController, "f").abort();
        __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_clearAnnounceTimeout).call(this);
        __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_sendStopped).call(this);
        __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_cleanupPendingOffers).call(this);
        __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_cleanupNegotiatingConnections).call(this);
        if (__classPrivateFieldGet(this, _WebTorrentClient_started, "f")) {
            __classPrivateFieldGet(this, _WebTorrentClient_wsClient, "f").removeEventListener("connected", __classPrivateFieldGet(this, _WebTorrentClient_onWsConnected, "f"));
            __classPrivateFieldGet(this, _WebTorrentClient_wsClient, "f").removeEventListener("disconnected", __classPrivateFieldGet(this, _WebTorrentClient_onWsDisconnected, "f"));
            __classPrivateFieldGet(this, _WebTorrentClient_wsClient, "f").removeEventListener("message", __classPrivateFieldGet(this, _WebTorrentClient_onWsMessage, "f"));
        }
        __classPrivateFieldGet(this, _WebTorrentClient_eventTarget, "f").clear();
    }
}
_a = WebTorrentClient, _WebTorrentClient_config = new WeakMap(), _WebTorrentClient_wsClient = new WeakMap(), _WebTorrentClient_eventTarget = new WeakMap(), _WebTorrentClient_pendingOffers = new WeakMap(), _WebTorrentClient_negotiatingConnections = new WeakMap(), _WebTorrentClient_destroyAbortController = new WeakMap(), _WebTorrentClient_announceTimeoutId = new WeakMap(), _WebTorrentClient_announceIntervalSeconds = new WeakMap(), _WebTorrentClient_scheduleAnnounceRunId = new WeakMap(), _WebTorrentClient_activeAnnouncePromise = new WeakMap(), _WebTorrentClient_nextAnnounceEvent = new WeakMap(), _WebTorrentClient_trackerId = new WeakMap(), _WebTorrentClient_started = new WeakMap(), _WebTorrentClient_onWsConnected = new WeakMap(), _WebTorrentClient_onWsDisconnected = new WeakMap(), _WebTorrentClient_onWsMessage = new WeakMap(), _WebTorrentClient_instances = new WeakSet(), _WebTorrentClient_isDestroyed = function _WebTorrentClient_isDestroyed() {
    return __classPrivateFieldGet(this, _WebTorrentClient_destroyAbortController, "f").signal.aborted;
}, _WebTorrentClient_throwIfDestroyed = function _WebTorrentClient_throwIfDestroyed() {
    if (__classPrivateFieldGet(this, _WebTorrentClient_destroyAbortController, "f").signal.aborted) {
        throw new Error("Client destroyed");
    }
}, _WebTorrentClient_scheduleAnnounce = function _WebTorrentClient_scheduleAnnounce(intervalSeconds) {
    var _b;
    __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_clearAnnounceTimeout).call(this);
    __classPrivateFieldSet(this, _WebTorrentClient_announceIntervalSeconds, intervalSeconds, "f");
    const runId = __classPrivateFieldSet(this, _WebTorrentClient_scheduleAnnounceRunId, (_b = __classPrivateFieldGet(this, _WebTorrentClient_scheduleAnnounceRunId, "f"), ++_b), "f");
    const run = () => __awaiter(this, void 0, void 0, function* () {
        try {
            yield __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_announce).call(this);
        }
        catch (err) {
            if (__classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this))
                return;
            __classPrivateFieldGet(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("error", new TrackerError("announce-failed", `Announce failed: ${err instanceof Error ? err.message : String(err)}`, err));
        }
        if (!__classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this) &&
            __classPrivateFieldGet(this, _WebTorrentClient_announceIntervalSeconds, "f") !== null &&
            __classPrivateFieldGet(this, _WebTorrentClient_scheduleAnnounceRunId, "f") === runId) {
            __classPrivateFieldSet(this, _WebTorrentClient_announceTimeoutId, setTimeout(run, __classPrivateFieldGet(this, _WebTorrentClient_announceIntervalSeconds, "f") * 1000), "f");
        }
    });
    __classPrivateFieldSet(this, _WebTorrentClient_announceTimeoutId, setTimeout(run, intervalSeconds * 1000), "f");
}, _WebTorrentClient_clearAnnounceTimeout = function _WebTorrentClient_clearAnnounceTimeout() {
    if (__classPrivateFieldGet(this, _WebTorrentClient_announceTimeoutId, "f") !== null) {
        clearTimeout(__classPrivateFieldGet(this, _WebTorrentClient_announceTimeoutId, "f"));
        __classPrivateFieldSet(this, _WebTorrentClient_announceTimeoutId, null, "f");
    }
}, _WebTorrentClient_announce = function _WebTorrentClient_announce(event) {
    return __awaiter(this, void 0, void 0, function* () {
        if (__classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this) || __classPrivateFieldGet(this, _WebTorrentClient_wsClient, "f").state !== "connected")
            return;
        if (event) {
            __classPrivateFieldSet(this, _WebTorrentClient_nextAnnounceEvent, event, "f");
        }
        if (__classPrivateFieldGet(this, _WebTorrentClient_activeAnnouncePromise, "f")) {
            return __classPrivateFieldGet(this, _WebTorrentClient_activeAnnouncePromise, "f");
        }
        const promise = (() => __awaiter(this, void 0, void 0, function* () {
            const shouldGenerateOffers = __classPrivateFieldGet(this, _WebTorrentClient_config, "f").shouldGenerateOffers();
            const offersCount = shouldGenerateOffers ? __classPrivateFieldGet(this, _WebTorrentClient_config, "f").offersCount() : 0;
            // Generate offers in parallel to avoid sequential ICE gathering latency.
            // Each #createOffer() internally catches its own errors and returns
            // undefined on failure, so Promise.all() will never reject here.
            // We avoid Promise.allSettled() for older browser compatibility.
            const results = yield Promise.all(Array.from({ length: offersCount }, () => __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_createOffer).call(this)));
            if (__classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this)) {
                for (const result of results) {
                    if (result) {
                        __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_cleanupPendingOffer).call(this, result.offer_id);
                    }
                }
                return;
            }
            const offers = [];
            for (const result of results) {
                if (result) {
                    offers.push(result);
                }
            }
            const currentEvent = __classPrivateFieldGet(this, _WebTorrentClient_nextAnnounceEvent, "f");
            __classPrivateFieldSet(this, _WebTorrentClient_nextAnnounceEvent, undefined, "f");
            const payload = __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_buildAnnouncePayload).call(this, {
                numwant: offers.length,
                offers,
                event: currentEvent,
            });
            if (__classPrivateFieldGet(this, _WebTorrentClient_wsClient, "f").state !== "connected") {
                for (const offer of offers) {
                    __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_cleanupPendingOffer).call(this, offer.offer_id);
                }
                return;
            }
            try {
                __classPrivateFieldGet(this, _WebTorrentClient_wsClient, "f").send(JSON.stringify(payload));
            }
            catch (err) {
                for (const offer of offers) {
                    __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_cleanupPendingOffer).call(this, offer.offer_id);
                }
                throw err;
            }
        }))();
        __classPrivateFieldSet(this, _WebTorrentClient_activeAnnouncePromise, promise, "f");
        try {
            yield promise;
        }
        finally {
            if (__classPrivateFieldGet(this, _WebTorrentClient_activeAnnouncePromise, "f") === promise) {
                __classPrivateFieldSet(this, _WebTorrentClient_activeAnnouncePromise, null, "f");
            }
        }
    });
}, _WebTorrentClient_createOffer = function _WebTorrentClient_createOffer() {
    return __awaiter(this, void 0, void 0, function* () {
        var _b, _c;
        if (__classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this))
            return undefined;
        let pc;
        try {
            pc = new PeerConnection((_c = (_b = __classPrivateFieldGet(this, _WebTorrentClient_config, "f")).rtcConfig) === null || _c === void 0 ? void 0 : _c.call(_b));
            __classPrivateFieldGet(this, _WebTorrentClient_negotiatingConnections, "f").add(pc);
            const channel = pc.createDataChannel("webtorrent", __classPrivateFieldGet(this, _WebTorrentClient_config, "f").channelConfig);
            const offer = yield safeCreateOffer(pc);
            __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_throwIfDestroyed).call(this);
            yield safeSetLocalDescription(pc, offer);
            __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_throwIfDestroyed).call(this);
            yield __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_waitForIceGathering).call(this, pc);
            __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_throwIfDestroyed).call(this);
            const sdp = pc.localDescription;
            if (!(sdp === null || sdp === void 0 ? void 0 : sdp.sdp)) {
                pc.close();
                return undefined;
            }
            const offerId = generateOfferId();
            __classPrivateFieldGet(this, _WebTorrentClient_pendingOffers, "f").set(offerId, {
                connection: pc,
                channel,
                timeoutId: setTimeout(() => {
                    __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_cleanupPendingOffer).call(this, offerId);
                }, __classPrivateFieldGet(this, _WebTorrentClient_config, "f").offerTimeout()),
            });
            return {
                offer: { type: sdp.type, sdp: sdp.sdp },
                offer_id: offerId,
            };
        }
        catch (err) {
            pc === null || pc === void 0 ? void 0 : pc.close();
            if (!__classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this)) {
                __classPrivateFieldGet(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("warning", new TrackerWarning("offer-failed", `Failed to create offer: ${err instanceof Error ? err.message : String(err)}`, err));
            }
        }
        finally {
            if (pc) {
                __classPrivateFieldGet(this, _WebTorrentClient_negotiatingConnections, "f").delete(pc);
            }
        }
        return undefined;
    });
}, _WebTorrentClient_sendStopped = function _WebTorrentClient_sendStopped() {
    if (__classPrivateFieldGet(this, _WebTorrentClient_wsClient, "f").state !== "connected")
        return;
    const payload = __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_buildAnnouncePayload).call(this, {
        numwant: 0,
        offers: [],
        event: "stopped",
    });
    try {
        __classPrivateFieldGet(this, _WebTorrentClient_wsClient, "f").send(JSON.stringify(payload));
    }
    catch (_b) {
        // Best-effort "stopped" notification
    }
}, _WebTorrentClient_buildAnnouncePayload = function _WebTorrentClient_buildAnnouncePayload({ numwant, offers, event, }) {
    const payload = {
        action: "announce",
        info_hash: __classPrivateFieldGet(this, _WebTorrentClient_config, "f").infoHash,
        peer_id: __classPrivateFieldGet(this, _WebTorrentClient_config, "f").peerId,
        numwant,
        uploaded: 0,
        downloaded: 0,
        offers,
    };
    if (event) {
        payload.event = event;
    }
    if (__classPrivateFieldGet(this, _WebTorrentClient_trackerId, "f")) {
        payload.trackerid = __classPrivateFieldGet(this, _WebTorrentClient_trackerId, "f");
    }
    return payload;
}, _WebTorrentClient_handleIncomingOffer = function _WebTorrentClient_handleIncomingOffer(_b) {
    return __awaiter(this, arguments, void 0, function* ({ sdp: offerSdp, peerId: remotePeerId, offerId: remoteOfferId, }) {
        var _c, _d;
        if (__classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this))
            return;
        if (!__classPrivateFieldGet(this, _WebTorrentClient_config, "f").claimPeer(remotePeerId)) {
            return; // Reject offer silently
        }
        let pc;
        try {
            pc = new PeerConnection((_d = (_c = __classPrivateFieldGet(this, _WebTorrentClient_config, "f")).rtcConfig) === null || _d === void 0 ? void 0 : _d.call(_c));
            __classPrivateFieldGet(this, _WebTorrentClient_negotiatingConnections, "f").add(pc);
            yield safeSetRemoteDescription(pc, new SessionDescription(offerSdp));
            __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_throwIfDestroyed).call(this);
            const answer = yield safeCreateAnswer(pc);
            __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_throwIfDestroyed).call(this);
            yield safeSetLocalDescription(pc, answer);
            __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_throwIfDestroyed).call(this);
            yield __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_waitForIceGathering).call(this, pc);
            __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_throwIfDestroyed).call(this);
            const sdp = pc.localDescription;
            if (!sdp) {
                throw new Error("Failed to get local description after ICE gathering");
            }
            const payload = {
                action: "announce",
                info_hash: __classPrivateFieldGet(this, _WebTorrentClient_config, "f").infoHash,
                peer_id: __classPrivateFieldGet(this, _WebTorrentClient_config, "f").peerId,
                to_peer_id: remotePeerId,
                offer_id: remoteOfferId,
                answer: { type: sdp.type, sdp: sdp.sdp },
            };
            __classPrivateFieldGet(this, _WebTorrentClient_wsClient, "f").send(JSON.stringify(payload));
            const channel = yield __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_waitForConnection).call(this, pc);
            __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_throwIfDestroyed).call(this);
            __classPrivateFieldGet(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("peerConnected", {
                peerId: remotePeerId,
                connection: pc,
                channel,
            });
        }
        catch (err) {
            pc === null || pc === void 0 ? void 0 : pc.close();
            // Always dispatch peerConnectFailed so the Manager can release the peer
            // from #connectingPeers. Safe to call after destroy: event target is
            // already cleared, making the dispatch a no-op.
            __classPrivateFieldGet(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("peerConnectFailed", {
                peerId: remotePeerId,
                error: new PeerConnectError("connection-failed", err instanceof Error ? err.message : String(err), err),
            });
        }
        finally {
            if (pc)
                __classPrivateFieldGet(this, _WebTorrentClient_negotiatingConnections, "f").delete(pc);
        }
    });
}, _WebTorrentClient_handleIncomingAnswer = function _WebTorrentClient_handleIncomingAnswer(_b) {
    return __awaiter(this, arguments, void 0, function* ({ sdp: answerSdp, peerId: remotePeerId, offerId: ourOfferId, }) {
        if (__classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_isDestroyed).call(this))
            return;
        const pending = __classPrivateFieldGet(this, _WebTorrentClient_pendingOffers, "f").get(ourOfferId);
        if (!pending)
            return; // Offer expired or invalid
        // Stop tracking it as pending
        __classPrivateFieldGet(this, _WebTorrentClient_pendingOffers, "f").delete(ourOfferId);
        clearTimeout(pending.timeoutId);
        if (!__classPrivateFieldGet(this, _WebTorrentClient_config, "f").claimPeer(remotePeerId)) {
            pending.connection.close();
            return; // Reject answer silently
        }
        __classPrivateFieldGet(this, _WebTorrentClient_negotiatingConnections, "f").add(pending.connection);
        try {
            yield safeSetRemoteDescription(pending.connection, new SessionDescription(answerSdp));
            __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_throwIfDestroyed).call(this);
            const channel = yield __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_waitForConnection).call(this, pending.connection, pending.channel);
            __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_throwIfDestroyed).call(this);
            __classPrivateFieldGet(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("peerConnected", {
                peerId: remotePeerId,
                connection: pending.connection,
                channel,
            });
        }
        catch (err) {
            pending.connection.close();
            // Always dispatch peerConnectFailed so the Manager can release the peer
            // from #connectingPeers. Safe to call after destroy: event target is
            // already cleared, making the dispatch a no-op.
            __classPrivateFieldGet(this, _WebTorrentClient_eventTarget, "f").dispatchEvent("peerConnectFailed", {
                peerId: remotePeerId,
                error: new PeerConnectError("connection-failed", err instanceof Error ? err.message : String(err), err),
            });
        }
        finally {
            __classPrivateFieldGet(this, _WebTorrentClient_negotiatingConnections, "f").delete(pending.connection);
        }
    });
}, _WebTorrentClient_waitForIceGathering = function _WebTorrentClient_waitForIceGathering(pc) {
    return new Promise((resolve, reject) => {
        if (pc.iceGatheringState === "complete") {
            resolve();
            return;
        }
        if (pc.signalingState === "closed") {
            reject(new Error("RTCPeerConnection closed"));
            return;
        }
        let timeoutId = undefined;
        const cleanup = () => {
            clearTimeout(timeoutId);
            pc.removeEventListener("icegatheringstatechange", onGatheringChange);
            pc.removeEventListener("icecandidate", onIceCandidate);
            pc.removeEventListener("signalingstatechange", onSignalingChange);
            __classPrivateFieldGet(this, _WebTorrentClient_destroyAbortController, "f").signal.removeEventListener("abort", onAbort);
        };
        const onGatheringChange = () => {
            if (pc.iceGatheringState === "complete") {
                cleanup();
                resolve();
            }
        };
        // A null candidate also signals gathering completion in some browsers
        // more reliably than icegatheringstatechange.
        const onIceCandidate = (event) => {
            if (event.candidate === null) {
                cleanup();
                resolve();
            }
        };
        const onSignalingChange = () => {
            if (pc.signalingState === "closed") {
                cleanup();
                reject(new Error("RTCPeerConnection closed"));
            }
        };
        const onAbort = () => {
            cleanup();
            reject(new Error("ICE gathering aborted due to teardown"));
        };
        if (__classPrivateFieldGet(this, _WebTorrentClient_destroyAbortController, "f").signal.aborted) {
            onAbort();
            return;
        }
        timeoutId = setTimeout(() => {
            cleanup();
            resolve(); // Use whatever candidates we have gathered so far
        }, __classPrivateFieldGet(this, _WebTorrentClient_config, "f").iceGatheringTimeout());
        pc.addEventListener("icegatheringstatechange", onGatheringChange);
        pc.addEventListener("icecandidate", onIceCandidate);
        pc.addEventListener("signalingstatechange", onSignalingChange);
        __classPrivateFieldGet(this, _WebTorrentClient_destroyAbortController, "f").signal.addEventListener("abort", onAbort);
    });
}, _WebTorrentClient_waitForConnection = function _WebTorrentClient_waitForConnection(pc, channel) {
    const { promise, resolve, reject } = getPromiseWithResolvers();
    let timeoutId = undefined;
    let boundChannel = channel;
    const rejectIfTerminalState = () => {
        if (isTerminalConnectionState(pc.iceConnectionState)) {
            cleanup();
            reject(new Error(`ICE connection ${pc.iceConnectionState}`));
            return true;
        }
        return false;
    };
    const onChannelOpen = () => {
        cleanup();
        if (boundChannel) {
            resolve(boundChannel);
        }
        else {
            reject(new Error("Data channel missing on open"));
        }
    };
    const onChannelError = () => {
        cleanup();
        reject(new Error("Data channel error"));
    };
    const onChannelClose = () => {
        cleanup();
        reject(new Error("Data channel closed prematurely"));
    };
    const bindDataChannel = (dc) => {
        boundChannel = dc;
        if (dc.readyState === "open") {
            onChannelOpen();
        }
        else if (dc.readyState === "closed" || dc.readyState === "closing") {
            onChannelClose();
        }
        else {
            dc.addEventListener("open", onChannelOpen);
            dc.addEventListener("error", onChannelError);
            dc.addEventListener("close", onChannelClose);
            dc.addEventListener("closing", onChannelClose);
        }
    };
    const onDataChannel = (event) => {
        if (!boundChannel) {
            bindDataChannel(event.channel);
        }
    };
    const onAbort = () => {
        cleanup();
        reject(new Error("Connection aborted due to teardown"));
    };
    const cleanup = () => {
        clearTimeout(timeoutId);
        pc.removeEventListener("iceconnectionstatechange", rejectIfTerminalState);
        pc.removeEventListener("datachannel", onDataChannel);
        if (boundChannel) {
            boundChannel.removeEventListener("open", onChannelOpen);
            boundChannel.removeEventListener("error", onChannelError);
            boundChannel.removeEventListener("close", onChannelClose);
            boundChannel.removeEventListener("closing", onChannelClose);
        }
        __classPrivateFieldGet(this, _WebTorrentClient_destroyAbortController, "f").signal.removeEventListener("abort", onAbort);
    };
    if (__classPrivateFieldGet(this, _WebTorrentClient_destroyAbortController, "f").signal.aborted) {
        onAbort();
        return promise;
    }
    if (rejectIfTerminalState())
        return promise;
    timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error("Data channel open timeout"));
    }, __classPrivateFieldGet(this, _WebTorrentClient_config, "f").connectionTimeout());
    pc.addEventListener("iceconnectionstatechange", rejectIfTerminalState);
    __classPrivateFieldGet(this, _WebTorrentClient_destroyAbortController, "f").signal.addEventListener("abort", onAbort);
    if (boundChannel) {
        bindDataChannel(boundChannel);
    }
    else {
        pc.addEventListener("datachannel", onDataChannel);
    }
    return promise;
}, _WebTorrentClient_cleanupPendingOffer = function _WebTorrentClient_cleanupPendingOffer(offerId, pending) {
    const entry = pending !== null && pending !== void 0 ? pending : __classPrivateFieldGet(this, _WebTorrentClient_pendingOffers, "f").get(offerId);
    if (entry) {
        clearTimeout(entry.timeoutId);
        entry.connection.close();
        __classPrivateFieldGet(this, _WebTorrentClient_pendingOffers, "f").delete(offerId);
    }
}, _WebTorrentClient_cleanupPendingOffers = function _WebTorrentClient_cleanupPendingOffers() {
    for (const [offerId, pending] of __classPrivateFieldGet(this, _WebTorrentClient_pendingOffers, "f")) {
        __classPrivateFieldGet(this, _WebTorrentClient_instances, "m", _WebTorrentClient_cleanupPendingOffer).call(this, offerId, pending);
    }
}, _WebTorrentClient_cleanupNegotiatingConnections = function _WebTorrentClient_cleanupNegotiatingConnections() {
    for (const pc of __classPrivateFieldGet(this, _WebTorrentClient_negotiatingConnections, "f")) {
        pc.close();
    }
    __classPrivateFieldGet(this, _WebTorrentClient_negotiatingConnections, "f").clear();
};
_WebTorrentClient_DEFAULT_ANNOUNCE_INTERVAL_SECONDS = { value: 120 };
_WebTorrentClient_MIN_ANNOUNCE_INTERVAL_SECONDS = { value: 20 };
//# sourceMappingURL=index.js.map