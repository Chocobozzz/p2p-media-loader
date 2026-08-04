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
var _WebTorrentManager_instances, _WebTorrentManager_config, _WebTorrentManager_eventTarget, _WebTorrentManager_connectingPeers, _WebTorrentManager_connectedPeers, _WebTorrentManager_clients, _WebTorrentManager_destroyed, _WebTorrentManager_started, _WebTorrentManager_claimPeer, _WebTorrentManager_closePeer, _WebTorrentManager_addConnectedPeer;
import { PeerError, PeerConnectError, } from "../../types.js";
import { EventTarget } from "../../utils/event-target.js";
import { getRTCErrorMessage, isTerminalConnectionState } from "../utils.js";
import { WebTorrentClient } from "../webtorrent-client/index.js";
const WEBTORRENT_DEFAULT_MAX_PEERS = 50;
const WEBTORRENT_DEFAULT_MAX_PEERS_MULTIPLIER = 1.5;
export class WebTorrentManager {
    constructor(config) {
        var _a, _b;
        _WebTorrentManager_instances.add(this);
        _WebTorrentManager_config.set(this, void 0);
        _WebTorrentManager_eventTarget.set(this, new EventTarget());
        _WebTorrentManager_connectingPeers.set(this, new Set());
        _WebTorrentManager_connectedPeers.set(this, new Map());
        _WebTorrentManager_clients.set(this, new Set());
        _WebTorrentManager_destroyed.set(this, false);
        _WebTorrentManager_started.set(this, false);
        _WebTorrentManager_claimPeer.set(this, (remotePeerId) => {
            if (__classPrivateFieldGet(this, _WebTorrentManager_destroyed, "f"))
                return false;
            if (__classPrivateFieldGet(this, _WebTorrentManager_connectingPeers, "f").has(remotePeerId) ||
                __classPrivateFieldGet(this, _WebTorrentManager_connectedPeers, "f").has(remotePeerId)) {
                return false;
            }
            // claimPeer is used to passively ACCEPT incoming connections.
            // We accept peers up to the hard limit (maxPeers * multiplier) to allow new
            // peers to join the swarm and be evaluated by the background peer churning process.
            const hardLimit = Math.floor(__classPrivateFieldGet(this, _WebTorrentManager_config, "f").maxPeers() *
                Math.max(1.0, __classPrivateFieldGet(this, _WebTorrentManager_config, "f").maxPeersMultiplier()));
            if (__classPrivateFieldGet(this, _WebTorrentManager_connectingPeers, "f").size + __classPrivateFieldGet(this, _WebTorrentManager_connectedPeers, "f").size >= hardLimit) {
                return false;
            }
            __classPrivateFieldGet(this, _WebTorrentManager_connectingPeers, "f").add(remotePeerId);
            return true;
        });
        __classPrivateFieldSet(this, _WebTorrentManager_config, Object.assign(Object.assign({}, config), { maxPeers: (_a = config.maxPeers) !== null && _a !== void 0 ? _a : (() => WEBTORRENT_DEFAULT_MAX_PEERS), maxPeersMultiplier: (_b = config.maxPeersMultiplier) !== null && _b !== void 0 ? _b : (() => WEBTORRENT_DEFAULT_MAX_PEERS_MULTIPLIER) }), "f");
    }
    addEventListener(eventName, listener) {
        __classPrivateFieldGet(this, _WebTorrentManager_eventTarget, "f").addEventListener(eventName, listener);
    }
    removeEventListener(eventName, listener) {
        __classPrivateFieldGet(this, _WebTorrentManager_eventTarget, "f").removeEventListener(eventName, listener);
    }
    start() {
        if (__classPrivateFieldGet(this, _WebTorrentManager_destroyed, "f") || __classPrivateFieldGet(this, _WebTorrentManager_started, "f"))
            return;
        __classPrivateFieldSet(this, _WebTorrentManager_started, true, "f");
        try {
            for (const url of __classPrivateFieldGet(this, _WebTorrentManager_config, "f").trackerUrls) {
                const { client: wsClient, release } = __classPrivateFieldGet(this, _WebTorrentManager_config, "f").socketPool.acquire(url);
                let addedToClients = false;
                try {
                    const client = new WebTorrentClient({
                        infoHash: __classPrivateFieldGet(this, _WebTorrentManager_config, "f").infoHash,
                        peerId: __classPrivateFieldGet(this, _WebTorrentManager_config, "f").peerId,
                        wsClient,
                        rtcConfig: __classPrivateFieldGet(this, _WebTorrentManager_config, "f").rtcConfig,
                        channelConfig: __classPrivateFieldGet(this, _WebTorrentManager_config, "f").channelConfig,
                        claimPeer: __classPrivateFieldGet(this, _WebTorrentManager_claimPeer, "f"),
                        offersCount: __classPrivateFieldGet(this, _WebTorrentManager_config, "f").offersCount,
                        offerTimeout: __classPrivateFieldGet(this, _WebTorrentManager_config, "f").offerTimeout,
                        iceGatheringTimeout: __classPrivateFieldGet(this, _WebTorrentManager_config, "f").iceGatheringTimeout,
                        connectionTimeout: __classPrivateFieldGet(this, _WebTorrentManager_config, "f").connectionTimeout,
                        // shouldGenerateOffers is used to proactively INITIATE connections.
                        // We stop actively hunting for peers once we hit the soft limit (maxPeers).
                        // This prevents artificial hyper-churn where a stable swarm constantly
                        // cycles connections to reach the hard limit unnecessarily.
                        shouldGenerateOffers: () => __classPrivateFieldGet(this, _WebTorrentManager_connectingPeers, "f").size + __classPrivateFieldGet(this, _WebTorrentManager_connectedPeers, "f").size <
                            __classPrivateFieldGet(this, _WebTorrentManager_config, "f").maxPeers(),
                    });
                    const onPeerConnected = (event) => {
                        __classPrivateFieldGet(this, _WebTorrentManager_connectingPeers, "f").delete(event.peerId);
                        __classPrivateFieldGet(this, _WebTorrentManager_instances, "m", _WebTorrentManager_addConnectedPeer).call(this, event.peerId, event.connection, event.channel, url);
                    };
                    const onPeerConnectFailed = (event) => {
                        if (__classPrivateFieldGet(this, _WebTorrentManager_connectingPeers, "f").has(event.peerId)) {
                            __classPrivateFieldGet(this, _WebTorrentManager_connectingPeers, "f").delete(event.peerId);
                            __classPrivateFieldGet(this, _WebTorrentManager_eventTarget, "f").dispatchEvent("peerConnectFailed", {
                                peerId: event.peerId,
                                trackerUrl: url,
                                error: event.error,
                            });
                        }
                    };
                    const onWarning = (warning) => {
                        __classPrivateFieldGet(this, _WebTorrentManager_eventTarget, "f").dispatchEvent("warning", {
                            trackerUrl: url,
                            warning,
                        });
                    };
                    const onError = (error) => {
                        __classPrivateFieldGet(this, _WebTorrentManager_eventTarget, "f").dispatchEvent("error", {
                            trackerUrl: url,
                            error,
                        });
                    };
                    client.addEventListener("peerConnected", onPeerConnected);
                    client.addEventListener("peerConnectFailed", onPeerConnectFailed);
                    client.addEventListener("warning", onWarning);
                    client.addEventListener("error", onError);
                    const cleanupListeners = () => {
                        client.removeEventListener("peerConnected", onPeerConnected);
                        client.removeEventListener("peerConnectFailed", onPeerConnectFailed);
                        client.removeEventListener("warning", onWarning);
                        client.removeEventListener("error", onError);
                    };
                    __classPrivateFieldGet(this, _WebTorrentManager_clients, "f").add({
                        client,
                        releaseSocket: release,
                        cleanupListeners,
                    });
                    addedToClients = true;
                    client.start();
                }
                catch (error) {
                    if (!addedToClients) {
                        release();
                    }
                    throw error;
                }
            }
        }
        catch (error) {
            this.destroy();
            throw error;
        }
    }
    destroy() {
        if (__classPrivateFieldGet(this, _WebTorrentManager_destroyed, "f"))
            return;
        __classPrivateFieldSet(this, _WebTorrentManager_destroyed, true, "f");
        // Remove our listeners BEFORE destroying the client. This ensures that
        // if client.destroy() synchronously dispatches events,
        // they won't reach this already-destroyed manager.
        for (const { client, releaseSocket, cleanupListeners } of __classPrivateFieldGet(this, _WebTorrentManager_clients, "f")) {
            cleanupListeners();
            client.destroy();
            releaseSocket();
        }
        __classPrivateFieldGet(this, _WebTorrentManager_clients, "f").clear();
        __classPrivateFieldGet(this, _WebTorrentManager_connectingPeers, "f").clear();
        const connectedSnapshot = [...__classPrivateFieldGet(this, _WebTorrentManager_connectedPeers, "f").entries()];
        __classPrivateFieldGet(this, _WebTorrentManager_connectedPeers, "f").clear();
        for (const [peerId, peer] of connectedSnapshot) {
            peer.cleanup();
            try {
                peer.channel.close();
            }
            catch (_a) {
                // ignore
            }
            try {
                peer.connection.close();
            }
            catch (_b) {
                // ignore
            }
            __classPrivateFieldGet(this, _WebTorrentManager_eventTarget, "f").dispatchEvent("peerDisconnected", {
                peerId,
                trackerUrl: peer.trackerUrl,
                disconnectReason: "Manager destroyed",
            });
        }
        __classPrivateFieldGet(this, _WebTorrentManager_eventTarget, "f").clear();
    }
}
_WebTorrentManager_config = new WeakMap(), _WebTorrentManager_eventTarget = new WeakMap(), _WebTorrentManager_connectingPeers = new WeakMap(), _WebTorrentManager_connectedPeers = new WeakMap(), _WebTorrentManager_clients = new WeakMap(), _WebTorrentManager_destroyed = new WeakMap(), _WebTorrentManager_started = new WeakMap(), _WebTorrentManager_claimPeer = new WeakMap(), _WebTorrentManager_instances = new WeakSet(), _WebTorrentManager_closePeer = function _WebTorrentManager_closePeer(peerId, cause) {
    if (__classPrivateFieldGet(this, _WebTorrentManager_destroyed, "f"))
        return;
    const connected = __classPrivateFieldGet(this, _WebTorrentManager_connectedPeers, "f").get(peerId);
    if (!connected)
        return;
    // Synchronously extract from map first to prevent re-entrant double-fire
    // if close() synchronously triggers event listeners.
    __classPrivateFieldGet(this, _WebTorrentManager_connectedPeers, "f").delete(peerId);
    connected.cleanup();
    try {
        connected.channel.close();
    }
    catch (_a) {
        // ignore
    }
    try {
        connected.connection.close();
    }
    catch (_b) {
        // ignore
    }
    __classPrivateFieldGet(this, _WebTorrentManager_eventTarget, "f").dispatchEvent("peerDisconnected", Object.assign({ peerId, trackerUrl: connected.trackerUrl }, cause));
}, _WebTorrentManager_addConnectedPeer = function _WebTorrentManager_addConnectedPeer(peerId, connection, channel, trackerUrl) {
    if (isTerminalConnectionState(connection.iceConnectionState)) {
        try {
            connection.close();
        }
        catch (_a) {
            // ignore
        }
        __classPrivateFieldGet(this, _WebTorrentManager_eventTarget, "f").dispatchEvent("peerConnectFailed", {
            peerId,
            trackerUrl,
            error: new PeerConnectError("connection-failed", "Connection failed during promotion"),
        });
        return;
    }
    const onDisconnect = (cause) => __classPrivateFieldGet(this, _WebTorrentManager_instances, "m", _WebTorrentManager_closePeer).call(this, peerId, cause);
    const onIceConnectionStateChange = () => {
        if (isTerminalConnectionState(connection.iceConnectionState)) {
            onDisconnect({
                error: new PeerError("connection-lost", `ICE connection state became ${connection.iceConnectionState}`),
            });
        }
    };
    const onChannelClose = () => onDisconnect({ disconnectReason: "Data channel closed" });
    const onChannelClosing = () => onDisconnect({ disconnectReason: "Data channel closing" });
    const onChannelError = (event) => {
        const msg = getRTCErrorMessage(event, "Data channel error");
        onDisconnect({
            error: new PeerError("transport-error", `Data channel error: ${msg}`),
        });
    };
    // Indirection so that cleanup() can null out the reference. Without this,
    // the close() closure exposed in the peerConnected event would capture
    // `this` permanently, preventing GC of the manager after destruction.
    let closeRef = (error) => __classPrivateFieldGet(this, _WebTorrentManager_instances, "m", _WebTorrentManager_closePeer).call(this, peerId, error ? { error } : { disconnectReason: "Closed by consumer" });
    const cleanup = () => {
        closeRef = null;
        connection.removeEventListener("iceconnectionstatechange", onIceConnectionStateChange);
        channel.removeEventListener("close", onChannelClose);
        channel.removeEventListener("closing", onChannelClosing);
        channel.removeEventListener("error", onChannelError);
    };
    __classPrivateFieldGet(this, _WebTorrentManager_connectedPeers, "f").set(peerId, {
        connection,
        channel,
        trackerUrl,
        cleanup,
    });
    connection.addEventListener("iceconnectionstatechange", onIceConnectionStateChange);
    channel.addEventListener("close", onChannelClose);
    channel.addEventListener("closing", onChannelClosing);
    channel.addEventListener("error", onChannelError);
    __classPrivateFieldGet(this, _WebTorrentManager_eventTarget, "f").dispatchEvent("peerConnected", {
        peerId,
        connection,
        channel,
        trackerUrl,
        close: (error) => closeRef === null || closeRef === void 0 ? void 0 : closeRef(error),
    });
};
//# sourceMappingURL=index.js.map