import { HlsManifestParser, DashManifestParser, } from "./manifest-parser-decorator.js";
import { SegmentManager } from "./segment-manager.js";
import { Loader } from "./loading-handler.js";
import { Core, } from "p2p-media-loader-core";
const LIVE_EDGE_DELAY = 25;
/**
 * Represents a Peer-to-Peer (P2P) engine designed to enhance media streaming efficiency.
 * This class integrates P2P technologies into Shaka Player, enabling the distribution of media segments via a peer network
 * alongside traditional HTTP fetching. This reduces server bandwidth costs and improves scalability by sharing the load
 * across multiple clients.
 *
 * The engine manages core functionalities such as segment fetching, segment management, peer connection management,
 * and event handling related to the P2P and HLS processes.
 *
 * @example
 * // Initializing the ShakaP2PEngine with custom configuration
 * const shakaP2PEngine = new ShakaP2PEngine({
 *   core: {
 *     highDemandTimeWindow: 30, // 30 seconds
 *     simultaneousHttpDownloads: 3,
 *     webRtcMaxMessageSize: 64 * 1024, // 64 KB
 *     p2pNotReceivingBytesTimeoutMs: 10000, // 10 seconds
 *     p2pInactiveLoaderDestroyTimeoutMs: 15000, // 15 seconds
 *     httpNotReceivingBytesTimeoutMs: 8000, // 8 seconds
 *     httpErrorRetries: 2,
 *     p2pErrorRetries: 2,
 *     announceTrackers: ["wss://personal.tracker.com"],
 *     rtcConfig: {
 *       iceServers: [{ urls: "stun:personal.stun.com" }]
 *     },
 *     swarmId: "example-swarm-id"
 *   }
 * });
 */
export class ShakaP2PEngine {
    /**
     * Constructs an instance of `ShakaP2PEngine`.
     *
     * @param config An optional configuration for customizing the P2P engine's behavior.
     * @param shaka The Shaka Player library instance.
     */
    constructor(config, shaka = window.shaka) {
        Object.defineProperty(this, "player", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "shaka", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "streamInfo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "core", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "segmentManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "requestFilter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "updatePlayerEventHandlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (type) => {
                const { player } = this;
                if (!player)
                    return;
                const networkingEngine = player.getNetworkingEngine();
                if (networkingEngine) {
                    if (type === "register") {
                        const p2pml = {
                            player,
                            shaka: this.shaka,
                            core: this.core,
                            streamInfo: this.streamInfo,
                            segmentManager: this.segmentManager,
                        };
                        this.requestFilter = (requestType, request) => {
                            request.p2pml = p2pml;
                        };
                        networkingEngine.p2pml = p2pml;
                        networkingEngine.registerRequestFilter(this.requestFilter);
                    }
                    else {
                        networkingEngine.p2pml = undefined;
                        if (this.requestFilter) {
                            networkingEngine.unregisterRequestFilter(this.requestFilter);
                        }
                    }
                }
                const method = type === "register" ? "addEventListener" : "removeEventListener";
                player[method]("loaded", this.handlePlayerLoaded);
                player[method]("loading", this.destroyCurrentStreamContext);
                player[method]("unloading", this.handlePlayerUnloading);
                player[method]("adaptation", this.onVariantChanged);
                player[method]("variantchanged", this.onVariantChanged);
            }
        });
        Object.defineProperty(this, "onVariantChanged", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                if (!this.player)
                    return;
                const activeTrack = this.player
                    .getVariantTracks()
                    .find((track) => track.active);
                if (!activeTrack)
                    return;
                this.core.setActiveLevelBitrate(activeTrack.bandwidth);
            }
        });
        Object.defineProperty(this, "handlePlayerLoaded", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                if (!this.player)
                    return;
                this.core.setIsLive(this.player.isLive());
                this.updateMediaElementEventHandlers("register");
            }
        });
        Object.defineProperty(this, "handlePlayerUnloading", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.destroyCurrentStreamContext();
                this.updateMediaElementEventHandlers("unregister");
            }
        });
        Object.defineProperty(this, "destroyCurrentStreamContext", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.streamInfo.protocol = undefined;
                this.streamInfo.manifestResponseUrl = undefined;
                this.core.destroy();
            }
        });
        Object.defineProperty(this, "updateMediaElementEventHandlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (type) => {
                var _a;
                const media = (_a = this.player) === null || _a === void 0 ? void 0 : _a.getMediaElement();
                if (!media)
                    return;
                const method = type === "register" ? "addEventListener" : "removeEventListener";
                media[method]("timeupdate", this.handlePlaybackUpdate);
                media[method]("ratechange", this.handlePlaybackUpdate);
                media[method]("seeking", this.handlePlaybackUpdate);
            }
        });
        Object.defineProperty(this, "handlePlaybackUpdate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (event) => {
                const media = event.target;
                this.core.updatePlayback(media.currentTime, media.playbackRate);
            }
        });
        validateShaka(shaka);
        this.shaka = shaka;
        this.core = new Core(config === null || config === void 0 ? void 0 : config.core);
        this.segmentManager = new SegmentManager(this.streamInfo, this.core);
    }
    /**
     * Configures and initializes the Shaka Player instance with predefined settings optimized for P2P performance.
     *
     * @param player The Shaka Player instance to configure.
     */
    bindShakaPlayer(player) {
        if (this.player === player)
            return;
        if (this.player)
            this.destroy();
        this.player = player;
        this.player.configure("manifest.defaultPresentationDelay", LIVE_EDGE_DELAY);
        this.player.configure("manifest.dash.ignoreSuggestedPresentationDelay", true);
        const versionMatch = /\d+/.exec(this.shaka.Player.version);
        const versionMajor = parseInt(versionMatch ? versionMatch[0] : "0", 10);
        if (versionMajor >= 5) {
            this.player.configure("streaming.preferNativeHls", false);
        }
        else {
            this.player.configure("streaming.useNativeHlsOnSafari", false);
        }
        this.updatePlayerEventHandlers("register");
    }
    /**
     * Applies dynamic configuration updates to the P2P engine.
     *
     * @param dynamicConfig The configuration changes to apply.
     *
     * @example
     * // Assuming `shakaP2PEngine` is an instance of ShakaP2PEngine
     *
     * const newDynamicConfig = {
     *   core: {
     *     // Increase the number of cached segments to 1000
     *     cachedSegmentsCount: 1000,
     *     // 50 minutes of segments will be preemptively downloaded via HTTP connections
     *     httpDownloadTimeWindow: 3000,
     *     // 100 minutes of segments will be preemptively downloaded via P2P connections
     *     p2pDownloadTimeWindow: 6000,
     *   }
     * };
     *
     * shakaP2PEngine.applyDynamicConfig(newDynamicConfig);
     */
    applyDynamicConfig(dynamicConfig) {
        if (dynamicConfig.core)
            this.core.applyDynamicConfig(dynamicConfig.core);
    }
    /**
     * Retrieves the current configuration of the `ShakaP2PEngine`.
     *
     * @returns The configuration as a readonly object.
     */
    getConfig() {
        return { core: this.core.getConfig() };
    }
    /**
     * Adds an event listener for the specified event.
     * @param eventName The name of the event to listen for.
     * @param listener The callback function to be invoked when the event is triggered.
     *
     * @example
     * // Listening for a segment being successfully loaded
     * shakaP2PEngine.addEventListener('onSegmentLoaded', (details) => {
     *   console.log('Segment Loaded:', details);
     * });
     *
     * @example
     * // Handling segment load errors
     * shakaP2PEngine.addEventListener('onSegmentError', (errorDetails) => {
     *   console.error('Error loading segment:', errorDetails);
     * });
     *
     * @example
     * // Tracking data downloaded from peers
     * shakaP2PEngine.addEventListener('onChunkDownloaded', (bytesLength, downloadSource, peerId) => {
     *   console.log(`Downloaded ${bytesLength} bytes from ${downloadSource} ${peerId ? 'from peer ' + peerId : 'from server'}`);
     * });
     */
    addEventListener(eventName, listener) {
        this.core.addEventListener(eventName, listener);
    }
    /**
     * Removes an event listener for the specified event.
     * @param eventName The name of the event.
     * @param listener The callback function that was previously added.
     */
    removeEventListener(eventName, listener) {
        this.core.removeEventListener(eventName, listener);
    }
    /** Cleans up and releases all resources, and unregisters all event handlers. */
    destroy() {
        this.destroyCurrentStreamContext();
        this.updatePlayerEventHandlers("unregister");
        this.updateMediaElementEventHandlers("unregister");
        this.player = undefined;
    }
    static registerManifestParsers(shaka) {
        const hlsParserFactory = () => new HlsManifestParser(shaka);
        const dashParserFactory = () => new DashManifestParser(shaka);
        const Parser = shaka.media.ManifestParser;
        Parser.registerParserByMime("application/dash+xml", dashParserFactory);
        Parser.registerParserByMime("application/x-mpegurl", hlsParserFactory);
        Parser.registerParserByMime("application/vnd.apple.mpegurl", hlsParserFactory);
    }
    static unregisterManifestParsers(shaka) {
        const Parser = shaka.media.ManifestParser;
        Parser.unregisterParserByMime("mpd");
        Parser.unregisterParserByMime("application/dash+xml");
        Parser.unregisterParserByMime("m3u8");
        Parser.unregisterParserByMime("application/x-mpegurl");
        Parser.unregisterParserByMime("application/vnd.apple.mpegurl");
    }
    static registerNetworkingEngineSchemes(shaka) {
        const { NetworkingEngine } = shaka.net;
        const handleLoading = (...args) => {
            const request = args[1];
            const { p2pml } = request;
            if (!p2pml) {
                return shaka.net.HttpFetchPlugin.parse(...args);
            }
            const loader = new Loader(p2pml.shaka, p2pml.core, p2pml.streamInfo);
            return loader.load(...args);
        };
        NetworkingEngine.registerScheme("http", handleLoading);
        NetworkingEngine.registerScheme("https", handleLoading);
        NetworkingEngine.registerScheme("data", handleLoading);
    }
    static unregisterNetworkingEngineSchemes(shaka) {
        const { NetworkingEngine } = shaka.net;
        NetworkingEngine.unregisterScheme("http");
        NetworkingEngine.unregisterScheme("https");
        NetworkingEngine.unregisterScheme("data");
    }
    /**
     * Registers plugins related to P2P functionality into the Shaka Player.
     * Plugins must be registered before initializing the player to ensure proper integration.
     *
     * @param shaka The Shaka Player library. Defaults to the global Shaka Player instance if not provided.
     */
    static registerPlugins(shaka = window.shaka) {
        validateShaka(shaka);
        ShakaP2PEngine.registerManifestParsers(shaka);
        ShakaP2PEngine.registerNetworkingEngineSchemes(shaka);
    }
    /**
     * Unregisters plugins related to P2P functionality from the Shaka Player.
     *
     * @param shaka The Shaka Player library. Defaults to the global Shaka Player instance if not provided.
     */
    static unregisterPlugins(shaka = window.shaka) {
        validateShaka(shaka);
        ShakaP2PEngine.unregisterManifestParsers(shaka);
        ShakaP2PEngine.unregisterNetworkingEngineSchemes(shaka);
    }
}
function validateShaka(shaka) {
    if (!shaka) {
        throw new Error("shaka namespace is not defined in global scope and not passed as an argument to Shaka P2P engine constructor");
    }
}
//# sourceMappingURL=engine.js.map