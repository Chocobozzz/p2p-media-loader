var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { HybridLoader } from "./hybrid-loader.js";
import debug from "debug";
import * as StreamUtils from "./utils/stream.js";
import { buildStreamSwarmId, computeInfoHash, computeStreamIdentityHash, PEER_PROTOCOL_VERSION, } from "./stream-identity.js";
import { BandwidthCalculator } from "./bandwidth-calculator.js";
import { SegmentMemoryStorage } from "./segment-storage/segment-memory-storage.js";
import { EventTarget } from "./utils/event-target.js";
import { overrideConfig, mergeAndFilterConfig, deepCopy, filterUndefinedProps, } from "./utils/utils.js";
import { TRACKER_CLIENT_VERSION_PREFIX, generatePeerId } from "./utils/peer.js";
import { WebTorrentSocketPool } from "./webtorrent/webtorrent-socket-pool/index.js";
/** Core class for managing media streams loading via P2P. */
export class Core {
    /**
     * Constructs a new Core instance with optional initial configuration.
     *
     * @param config - Optional partial configuration to override default settings.
     *
     * @example
     * // Create a Core instance with custom configuration for HTTP and P2P downloads.
     * const core = new Core({
     *   simultaneousHttpDownloads: 5,
     *   simultaneousP2PDownloads: 5,
     *   httpErrorRetries: 5,
     *   p2pErrorRetries: 5
     * });
     *
     * @example
     * // Create a Core instance using the default configuration.
     * const core = new Core();
     */
    constructor(config) {
        Object.defineProperty(this, "eventTarget", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new EventTarget()
        });
        Object.defineProperty(this, "manifestResponseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "streams", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "mainStreamConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "secondaryStreamConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "commonCoreConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "bandwidthCalculators", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                all: new BandwidthCalculator(),
                http: new BandwidthCalculator(),
            }
        });
        Object.defineProperty(this, "segmentStorage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "webTorrentSocketPool", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new WebTorrentSocketPool()
        });
        Object.defineProperty(this, "logger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: debug("p2pml-core:core")
        });
        Object.defineProperty(this, "socketPoolLogger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: debug("p2pml-core:webtorrent-socket-pool")
        });
        Object.defineProperty(this, "peerId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "mainStreamLoader", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "secondaryStreamLoader", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "streamDetails", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                isLive: false,
                activeLevelBitrate: 0,
            }
        });
        Object.defineProperty(this, "storageInitPromise", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const filteredConfig = filterUndefinedProps(config !== null && config !== void 0 ? config : {});
        this.commonCoreConfig = mergeAndFilterConfig({
            defaultConfig: Core.DEFAULT_COMMON_CORE_CONFIG,
            baseConfig: filteredConfig,
        });
        this.mainStreamConfig = mergeAndFilterConfig({
            defaultConfig: Core.DEFAULT_STREAM_CONFIG,
            baseConfig: filteredConfig,
            specificStreamConfig: filteredConfig.mainStream,
        });
        this.secondaryStreamConfig = mergeAndFilterConfig({
            defaultConfig: Core.DEFAULT_STREAM_CONFIG,
            baseConfig: filteredConfig,
            specificStreamConfig: filteredConfig.secondaryStream,
        });
        this.peerId = generatePeerId(this.commonCoreConfig.trackerClientVersionPrefix);
        this.webTorrentSocketPool.addEventListener("error", (error, url) => {
            this.socketPoolLogger(`WebSocket error for tracker url ${url}:`, error);
        });
    }
    /**
     * Retrieves the current configuration for the core instance, ensuring immutability.
     *
     * @returns A deep readonly version of the core configuration.
     */
    getConfig() {
        return Object.assign(Object.assign({}, deepCopy(this.commonCoreConfig)), { mainStream: deepCopy(this.mainStreamConfig), secondaryStream: deepCopy(this.secondaryStreamConfig) });
    }
    /**
     * Applies a set of dynamic configuration updates to the core, merging with the existing configuration.
     *
     * @param dynamicConfig - A set of configuration changes to apply.
     *
     * @example
     * // Example of dynamically updating the download time windows and timeout settings.
     * const dynamicConfig = {
     *   httpDownloadTimeWindow: 60,  // Set HTTP download time window to 60 seconds
     *   p2pDownloadTimeWindow: 60,   // Set P2P download time window to 60 seconds
     *   httpNotReceivingBytesTimeoutMs: 1500,  // Set HTTP timeout to 1500 milliseconds
     *   p2pNotReceivingBytesTimeoutMs: 1500    // Set P2P timeout to 1500 milliseconds
     * };
     * core.applyDynamicConfig(dynamicConfig);
     */
    applyDynamicConfig(dynamicConfig) {
        const { mainStream, secondaryStream } = dynamicConfig;
        const mainStreamConfigCopy = deepCopy(this.mainStreamConfig);
        const secondaryStreamConfigCopy = deepCopy(this.secondaryStreamConfig);
        this.overrideAllConfigs(dynamicConfig, mainStream, secondaryStream);
        this.processSpecificDynamicConfigParams(mainStreamConfigCopy, dynamicConfig, "main");
        this.processSpecificDynamicConfigParams(secondaryStreamConfigCopy, dynamicConfig, "secondary");
    }
    processSpecificDynamicConfigParams(prevConfig, updatedConfig, streamType) {
        const isP2PDisabled = this.getUpdatedStreamProperty("isP2PDisabled", updatedConfig, streamType);
        if (isP2PDisabled && prevConfig.isP2PDisabled !== isP2PDisabled) {
            this.destroyStreamLoader(streamType);
        }
        const isP2PUploadDisabled = this.getUpdatedStreamProperty("isP2PUploadDisabled", updatedConfig, streamType);
        if (isP2PUploadDisabled !== undefined &&
            prevConfig.isP2PUploadDisabled !== isP2PUploadDisabled) {
            const streamLoader = streamType === "main"
                ? this.mainStreamLoader
                : this.secondaryStreamLoader;
            streamLoader === null || streamLoader === void 0 ? void 0 : streamLoader.sendBroadcastAnnouncement(isP2PUploadDisabled);
        }
    }
    getUpdatedStreamProperty(propertyName, updatedConfig, streamType) {
        var _a;
        const updatedStreamConfig = streamType === "main"
            ? updatedConfig.mainStream
            : updatedConfig.secondaryStream;
        return (_a = updatedStreamConfig === null || updatedStreamConfig === void 0 ? void 0 : updatedStreamConfig[propertyName]) !== null && _a !== void 0 ? _a : updatedConfig[propertyName];
    }
    /**
     * Adds an event listener for the specified event type on the core event target.
     *
     * @param eventName - The name of the event to listen for.
     * @param listener - The callback function to invoke when the event is fired.
     */
    addEventListener(eventName, listener) {
        this.eventTarget.addEventListener(eventName, listener);
    }
    /**
     * Removes an event listener for the specified event type on the core event target.
     *
     * @param eventName - The name of the event to listen for.
     * @param listener - The callback function to be removed.
     */
    removeEventListener(eventName, listener) {
        this.eventTarget.removeEventListener(eventName, listener);
    }
    /**
     * Sets the response URL for the manifest, stripping any query parameters.
     *
     * @param url - The full URL to the manifest response.
     */
    setManifestResponseUrl(url) {
        this.manifestResponseUrl = url.split("?")[0];
    }
    /**
     * Checks if a segment is already stored within the core.
     *
     * @param segmentRuntimeId - The runtime identifier of the segment to check.
     * @returns `true` if the segment is present, otherwise `false`.
     */
    hasSegment(segmentRuntimeId) {
        return !!StreamUtils.getSegmentFromStreamsMap(this.streams, segmentRuntimeId);
    }
    /**
     * Retrieves a specific stream by its runtime identifier, if it exists.
     *
     * @param streamRuntimeId - The runtime identifier of the stream to retrieve.
     * @returns The registered stream with its computed identity, or `undefined` if not found.
     */
    getStream(streamRuntimeId) {
        return this.streams.get(streamRuntimeId);
    }
    /**
     * Retrieves the runtime identifiers of the segments currently registered
     * for a stream. Player integrations use this to diff a refreshed manifest
     * against the core's registry before calling `updateStream`.
     *
     * @param streamRuntimeId - The runtime identifier of the stream.
     * @returns A snapshot set of the registered segment runtime IDs, or
     * `undefined` if the stream is not registered.
     */
    getStreamSegmentRuntimeIds(streamRuntimeId) {
        const stream = this.streams.get(streamRuntimeId);
        if (!stream)
            return undefined;
        return new Set(stream.segments.keys());
    }
    /**
     * Retrieves all currently registered streams with their computed identities,
     * including the infohashes announced to trackers. Unlike the `onStreamAdded`
     * event, this reflects the full set at any moment, so late subscribers can
     * catch up on streams registered before they attached.
     *
     * @returns The registered streams, in registration order.
     */
    getStreams() {
        return [...this.streams.values()];
    }
    /**
     * Ensures a stream exists in the map; adds it if it does not.
     *
     * Computes the stream's identity (`swarmId`, `identityHash`, `streamSwarmId`,
     * `infoHash`) exactly once at registration and freezes it on the stream.
     * Requires the swarm ID to be resolvable: either a `swarmId` is configured
     * or `setManifestResponseUrl()` has been called.
     *
     * @param stream - The stream to potentially add to the map.
     */
    addStreamIfNoneExists(stream) {
        var _a;
        if (this.streams.has(stream.runtimeId))
            return;
        const config = stream.type === "main"
            ? this.mainStreamConfig
            : this.secondaryStreamConfig;
        const swarmId = (_a = config.swarmId) !== null && _a !== void 0 ? _a : this.manifestResponseUrl;
        if (swarmId === undefined) {
            throw new Error("Failed to register stream: no swarmId is configured and the manifest response URL is not set. Call setManifestResponseUrl() before adding streams.");
        }
        const properties = Object.freeze(Object.assign({}, stream.properties));
        const identityHash = computeStreamIdentityHash(properties);
        let streamSwarmId = buildStreamSwarmId(swarmId, stream.type, identityHash);
        if (config.streamSwarmIdBuilder) {
            const customStreamSwarmId = config.streamSwarmIdBuilder({
                swarmId,
                runtimeId: stream.runtimeId,
                streamType: stream.type,
                properties,
                identityHash,
                defaultStreamSwarmId: streamSwarmId,
                peerProtocolVersion: PEER_PROTOCOL_VERSION,
            });
            if (customStreamSwarmId !== undefined) {
                if (typeof customStreamSwarmId !== "string" ||
                    customStreamSwarmId === "") {
                    throw new Error("streamSwarmIdBuilder must return a non-empty string or undefined");
                }
                streamSwarmId = customStreamSwarmId;
            }
        }
        for (const registered of this.streams.values()) {
            if (registered.streamSwarmId !== streamSwarmId)
                continue;
            // Sharing a stream swarm ID is only legitimate for streams with the same
            // default identity (e.g. the same rendition served from multiple CDNs).
            // A stream's identity is the whole (swarmId, type, identityHash) tuple —
            // identityHash alone excludes type and swarmId, so comparing it is not
            // enough. If any part differs, a custom builder has merged distinct
            // streams into one swarm and peers would exchange wrong-stream segments.
            if (registered.swarmId !== swarmId ||
                registered.type !== stream.type ||
                registered.identityHash !== identityHash) {
                throw new Error(`streamSwarmIdBuilder produced the same stream swarm ID ("${streamSwarmId}") for streams with different identities. Peers of these streams would exchange segments of the wrong stream.`);
            }
        }
        const registeredStream = Object.assign(Object.assign({}, stream), { properties,
            swarmId,
            identityHash,
            streamSwarmId, infoHash: computeInfoHash(streamSwarmId), segments: new Map() });
        this.streams.set(stream.runtimeId, registeredStream);
        // Dispatch a snapshot without the internal segments map, so listeners
        // cannot reach into core state.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { segments } = registeredStream, streamSnapshot = __rest(registeredStream, ["segments"]);
        this.eventTarget.dispatchEvent("onStreamAdded", {
            stream: streamSnapshot,
        });
    }
    /**
     * Updates the segments associated with a specific stream.
     *
     * @param streamRuntimeId - The runtime identifier of the stream to update.
     * @param addSegments - Optional segments to add to the stream.
     * @param removeSegmentIds - Optional segment IDs to remove from the stream.
     */
    updateStream(streamRuntimeId, addSegments, removeSegmentIds) {
        var _a, _b;
        const stream = this.streams.get(streamRuntimeId);
        if (!stream)
            return;
        if (addSegments) {
            for (const segment of addSegments) {
                if (stream.segments.has(segment.runtimeId))
                    continue; // should not happen
                stream.segments.set(segment.runtimeId, Object.assign(Object.assign({}, segment), { stream }));
            }
        }
        if (removeSegmentIds) {
            for (const id of removeSegmentIds) {
                stream.segments.delete(id);
            }
        }
        (_a = this.mainStreamLoader) === null || _a === void 0 ? void 0 : _a.updateStream(stream);
        (_b = this.secondaryStreamLoader) === null || _b === void 0 ? void 0 : _b.updateStream(stream);
    }
    /**
     * Loads a segment given its runtime identifier and invokes the provided callbacks during the process.
     * Initializes segment storage if it has not been initialized yet.
     *
     * @param segmentRuntimeId - The runtime identifier of the segment to load.
     * @param callbacks - The callbacks to be invoked during segment loading.
     * @throws {Error} - Throws if the manifest response URL is not defined.
     */
    loadSegment(segmentRuntimeId, callbacks) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.manifestResponseUrl) {
                throw new Error("Manifest response url is not defined");
            }
            yield this.initializeSegmentStorage();
            const segment = this.identifySegment(segmentRuntimeId);
            const loader = this.getStreamHybridLoader(segment);
            void loader.loadSegment(segment, callbacks);
        });
    }
    /**
     * Aborts the loading of a segment specified by its runtime identifier.
     *
     * @param segmentRuntimeId - The runtime identifier of the segment whose loading is to be aborted.
     */
    abortSegmentLoading(segmentRuntimeId) {
        var _a, _b;
        (_a = this.mainStreamLoader) === null || _a === void 0 ? void 0 : _a.abortSegmentRequest(segmentRuntimeId);
        (_b = this.secondaryStreamLoader) === null || _b === void 0 ? void 0 : _b.abortSegmentRequest(segmentRuntimeId);
    }
    /**
     * Updates the playback parameters while play head moves, specifically position and playback rate, for stream loaders.
     *
     * @param position - The new position in the stream, in seconds.
     * @param rate - The new playback rate.
     */
    updatePlayback(position, rate) {
        var _a, _b;
        (_a = this.mainStreamLoader) === null || _a === void 0 ? void 0 : _a.updatePlayback(position, rate);
        (_b = this.secondaryStreamLoader) === null || _b === void 0 ? void 0 : _b.updatePlayback(position, rate);
    }
    /**
     * Sets the active level bitrate, used for adjusting quality levels in adaptive streaming.
     * Notifies the stream loaders if a change occurs.
     *
     * @param bitrate - The new bitrate to set as active.
     */
    setActiveLevelBitrate(bitrate) {
        var _a, _b;
        if (bitrate !== this.streamDetails.activeLevelBitrate) {
            this.streamDetails.activeLevelBitrate = bitrate;
            (_a = this.mainStreamLoader) === null || _a === void 0 ? void 0 : _a.notifyLevelChanged();
            (_b = this.secondaryStreamLoader) === null || _b === void 0 ? void 0 : _b.notifyLevelChanged();
        }
    }
    /**
     * Updates the 'isLive' status of the stream
     *
     * @param isLive - Boolean indicating whether the stream is live.
     */
    setIsLive(isLive) {
        this.streamDetails.isLive = isLive;
    }
    /**
     * Identify if a segment is loadable by the P2P core based on the segment's stream type and configuration.
     * @param segmentRuntimeId Segment runtime identifier to check.
     * @returns `true` if the segment is loadable by the P2P core, otherwise `false`.
     */
    isSegmentLoadable(segmentRuntimeId) {
        try {
            const segment = this.identifySegment(segmentRuntimeId);
            if (segment.stream.type === "main" &&
                this.mainStreamConfig.isP2PDisabled) {
                return false;
            }
            if (segment.stream.type === "secondary" &&
                this.secondaryStreamConfig.isP2PDisabled) {
                return false;
            }
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    /**
     * Cleans up resources used by the Core instance, including destroying any active stream loaders
     * and clearing stored segments.
     *
     * Event listeners deliberately survive: the player integrations reuse one
     * Core instance across media sources, destroying it between loads, and
     * subscriptions (e.g. `onStreamAdded`, `onPeerConnect`) are expected to
     * keep working after the next source loads. Use `removeEventListener` to
     * unsubscribe explicitly.
     */
    destroy() {
        var _a, _b, _c, _d;
        this.streams.clear();
        (_a = this.mainStreamLoader) === null || _a === void 0 ? void 0 : _a.destroy();
        (_b = this.secondaryStreamLoader) === null || _b === void 0 ? void 0 : _b.destroy();
        (_c = this.segmentStorage) === null || _c === void 0 ? void 0 : _c.setSegmentChangeCallback(undefined);
        (_d = this.segmentStorage) === null || _d === void 0 ? void 0 : _d.destroy();
        this.mainStreamLoader = undefined;
        this.secondaryStreamLoader = undefined;
        this.segmentStorage = undefined;
        this.manifestResponseUrl = undefined;
        this.streamDetails = { isLive: false, activeLevelBitrate: 0 };
        this.storageInitPromise = undefined;
        this.webTorrentSocketPool.destroy();
    }
    initializeSegmentStorage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.segmentStorage)
                return;
            if (this.storageInitPromise)
                return this.storageInitPromise;
            this.storageInitPromise = (() => __awaiter(this, void 0, void 0, function* () {
                const { isLive } = this.streamDetails;
                const createCustomStorage = this.commonCoreConfig.customSegmentStorageFactory;
                if (createCustomStorage && typeof createCustomStorage !== "function") {
                    throw new Error("Storage configuration is invalid");
                }
                const segmentStorage = createCustomStorage
                    ? createCustomStorage(isLive)
                    : new SegmentMemoryStorage();
                try {
                    yield segmentStorage.initialize(this.commonCoreConfig, this.mainStreamConfig, this.secondaryStreamConfig);
                }
                catch (error) {
                    segmentStorage.destroy();
                    throw error;
                }
                if (!this.storageInitPromise) {
                    segmentStorage.setSegmentChangeCallback(undefined);
                    segmentStorage.destroy();
                    return;
                }
                segmentStorage.setSegmentChangeCallback((streamSwarmId) => {
                    this.eventTarget.dispatchEvent(`onStorageUpdated-${streamSwarmId}`);
                });
                this.segmentStorage = segmentStorage;
            }))();
            try {
                yield this.storageInitPromise;
            }
            finally {
                this.storageInitPromise = undefined;
            }
        });
    }
    identifySegment(segmentRuntimeId) {
        if (!this.manifestResponseUrl) {
            throw new Error("Manifest response url is undefined");
        }
        const segment = StreamUtils.getSegmentFromStreamsMap(this.streams, segmentRuntimeId);
        if (!segment) {
            throw new Error(`Not found segment with id: ${segmentRuntimeId}`);
        }
        return segment;
    }
    overrideAllConfigs(dynamicConfig, mainStream, secondaryStream) {
        // Stream identity is derived from these properties once, at stream
        // registration; changing them at runtime would silently desynchronize
        // the announced swarms from the registered streams.
        const sanitizedDynamicConfig = this.stripStaticOnlyProps(dynamicConfig);
        const sanitizedMainStream = mainStream && this.stripStaticOnlyProps(mainStream);
        const sanitizedSecondaryStream = secondaryStream && this.stripStaticOnlyProps(secondaryStream);
        overrideConfig(this.commonCoreConfig, sanitizedDynamicConfig);
        overrideConfig(this.mainStreamConfig, sanitizedDynamicConfig);
        overrideConfig(this.secondaryStreamConfig, sanitizedDynamicConfig);
        if (sanitizedMainStream) {
            overrideConfig(this.mainStreamConfig, sanitizedMainStream);
        }
        if (sanitizedSecondaryStream) {
            overrideConfig(this.secondaryStreamConfig, sanitizedSecondaryStream);
        }
    }
    stripStaticOnlyProps(config) {
        if (!("swarmId" in config) && !("streamSwarmIdBuilder" in config)) {
            return config;
        }
        // TypeScript excludes these properties from DynamicCoreConfig, but
        // plain-JS callers can still pass them — signal instead of silently
        // ignoring the update.
        this.logger("swarmId and streamSwarmIdBuilder cannot be changed at runtime; ignoring them in the dynamic configuration update");
        const sanitized = Object.assign({}, config);
        delete sanitized.swarmId;
        delete sanitized.streamSwarmIdBuilder;
        return sanitized;
    }
    destroyStreamLoader(streamType) {
        var _a, _b;
        if (streamType === "main") {
            (_a = this.mainStreamLoader) === null || _a === void 0 ? void 0 : _a.destroy();
            this.mainStreamLoader = undefined;
        }
        else {
            (_b = this.secondaryStreamLoader) === null || _b === void 0 ? void 0 : _b.destroy();
            this.secondaryStreamLoader = undefined;
        }
    }
    getStreamHybridLoader(segment) {
        var _a, _b;
        if (segment.stream.type === "main") {
            (_a = this.mainStreamLoader) !== null && _a !== void 0 ? _a : (this.mainStreamLoader = this.createNewHybridLoader(segment));
            return this.mainStreamLoader;
        }
        else {
            (_b = this.secondaryStreamLoader) !== null && _b !== void 0 ? _b : (this.secondaryStreamLoader = this.createNewHybridLoader(segment));
            return this.secondaryStreamLoader;
        }
    }
    createNewHybridLoader(segment) {
        if (!this.segmentStorage) {
            throw new Error("Segment storage is not initialized");
        }
        const streamConfig = segment.stream.type === "main"
            ? this.mainStreamConfig
            : this.secondaryStreamConfig;
        return new HybridLoader(segment, this.streamDetails, streamConfig, this.bandwidthCalculators, this.segmentStorage, this.webTorrentSocketPool, this.eventTarget, this.peerId);
    }
}
/** Default configuration for common core settings. */
Object.defineProperty(Core, "DEFAULT_COMMON_CORE_CONFIG", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: {
        segmentMemoryStorageLimit: undefined,
        customSegmentStorageFactory: undefined,
        trackerClientVersionPrefix: TRACKER_CLIENT_VERSION_PREFIX,
    }
});
/** Default configuration for stream settings. */
Object.defineProperty(Core, "DEFAULT_STREAM_CONFIG", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: {
        isP2PUploadDisabled: false,
        isP2PDisabled: false,
        simultaneousHttpDownloads: 2,
        simultaneousP2PDownloads: 3,
        highDemandTimeWindow: 15,
        httpDownloadInitialTimeoutMs: 0,
        httpDownloadTimeWindow: 3000,
        p2pDownloadTimeWindow: 6000,
        webRtcMaxMessageSize: 64 * 1024 - 1,
        p2pNotReceivingBytesTimeoutMs: 2000,
        p2pInactiveLoaderDestroyTimeoutMs: 30 * 1000,
        httpNotReceivingBytesTimeoutMs: 3000,
        httpErrorRetries: 3,
        p2pErrorRetries: 3,
        announceTrackers: [
            "wss://tracker.novage.com.ua",
            "wss://tracker.webtorrent.dev",
            "wss://tracker.openwebtorrent.com",
        ],
        rtcConfig: {
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:global.stun.twilio.com:3478" },
            ],
        },
        validateP2PSegment: undefined,
        validateHTTPSegment: undefined,
        httpRequestSetup: undefined,
        swarmId: undefined,
        streamSwarmIdBuilder: undefined,
        p2pMaxPeers: 50,
        p2pChurnMaxPeersMultiplier: 1.5,
        p2pChurnCleanupIntervalMs: 30000,
        p2pChurnGracePeriodMs: 15000,
        webRtcOffersCount: 5,
        webRtcOfferTimeoutMs: 50000,
        webRtcIceGatheringTimeoutMs: 5000,
        webRtcConnectionTimeoutMs: 15000,
    }
});
//# sourceMappingURL=core.js.map