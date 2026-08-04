import { FragmentLoaderBase } from "./fragment-loader.js";
import { PlaylistLoaderBase } from "./playlist-loader.js";
import { SegmentManager } from "./segment-manager.js";
import { Core, debug, } from "p2p-media-loader-core";
import { injectMixin } from "./engine-static.js";
const MAX_LIVE_SYNC_DURATION = 120;
/**
 * Represents a Peer-to-Peer (P2P) engine for HLS (HTTP Live Streaming) to enhance media streaming efficiency.
 * This class integrates P2P technologies into Hls.js, enabling the distribution of media segments via a peer network
 * alongside traditional HTTP fetching. This reduces server bandwidth costs and improves scalability by sharing the load
 * across multiple clients.
 *
 * The engine manages core functionalities such as segment fetching, segment management, peer connection management,
 * and event handling related to the P2P and HLS processes.
 *
 * @example
 * // Creating an instance of HlsJsP2PEngine with custom configuration
 * const hlsP2PEngine = new HlsJsP2PEngine({
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
 *
 */
export class HlsJsP2PEngine {
    /**
     * Enhances a given `Hls.js` class by injecting additional Peer-to-Peer (P2P) functionalities.
     *
     * @returns The enhanced `Hls.js` class with P2P functionalities.
     *
     * @example
     * const HlsWithP2P = HlsJsP2PEngine.injectMixin(Hls);
     *
     * const hls = new HlsWithP2P({
     *   // Hls.js configuration
     *   startLevel: 0, // Example of Hls.js config parameter
     *   p2p: {
     *     core: {
     *       // P2P core configuration
     *     },
     *     onHlsJsCreated(hls) {
     *       // Do something with the Hls.js instance
     *     },
     *   },
     * });
     */
    static injectMixin(hls) {
        return injectMixin(hls);
    }
    /**
     * Constructs an instance of `HlsJsP2PEngine`.
     * @param config An optional configuration for the P2P engine setup.
     */
    constructor(config) {
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
        Object.defineProperty(this, "hlsInstanceGetter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "currentHlsInstance", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "debug", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: debug("p2pml-hlsjs:engine")
        });
        Object.defineProperty(this, "updateMediaElementEventHandlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (type) => {
                var _a;
                const media = (_a = this.currentHlsInstance) === null || _a === void 0 ? void 0 : _a.media;
                if (!media)
                    return;
                const method = type === "register" ? "addEventListener" : "removeEventListener";
                media[method]("timeupdate", this.handlePlaybackUpdate);
                media[method]("seeking", this.handlePlaybackUpdate);
                media[method]("ratechange", this.handlePlaybackUpdate);
            }
        });
        Object.defineProperty(this, "handleManifestLoaded", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (event, data) => {
                // eslint-disable-next-line prefer-destructuring
                const networkDetails = data.networkDetails;
                if (networkDetails instanceof XMLHttpRequest) {
                    this.core.setManifestResponseUrl(networkDetails.responseURL);
                }
                else if (networkDetails instanceof Response) {
                    this.core.setManifestResponseUrl(networkDetails.url);
                }
                else {
                    // Custom hls.js loaders may report networkDetails of any shape.
                    // Fall back to the request URL so stream registration, which
                    // requires a resolvable swarm ID, does not depend on the loader.
                    this.core.setManifestResponseUrl(data.url);
                }
                this.segmentManager.processMainManifest(data);
            }
        });
        Object.defineProperty(this, "handleLevelSwitching", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (event, data) => {
                if (data.bitrate)
                    this.core.setActiveLevelBitrate(data.bitrate);
            }
        });
        Object.defineProperty(this, "handleLevelUpdated", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (event, data) => {
                if (this.currentHlsInstance &&
                    data.details.fragments[0].type === "main" &&
                    data.details.fragments.length > 4) {
                    if (data.details.live &&
                        !this.currentHlsInstance.userConfig.liveSyncDuration &&
                        !this.currentHlsInstance.userConfig.liveSyncDurationCount) {
                        this.updateLiveSyncDurationCount(data);
                    }
                    if (!this.currentHlsInstance.userConfig.maxBufferLength &&
                        !this.currentHlsInstance.userConfig.maxMaxBufferLength) {
                        this.updateMaxBufferLength(data.details.targetduration);
                    }
                }
                this.core.setIsLive(data.details.live);
                this.segmentManager.updatePlaylist(data);
            }
        });
        Object.defineProperty(this, "handleMediaAttached", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.updateMediaElementEventHandlers("register");
            }
        });
        Object.defineProperty(this, "handleMediaDetached", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.updateMediaElementEventHandlers("unregister");
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
        Object.defineProperty(this, "destroyCore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => this.core.destroy()
        });
        /** Cleans up and releases all resources, and unregisters all event handlers. */
        Object.defineProperty(this, "destroy", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.destroyCore();
                this.updateHlsEventsHandlers("unregister");
                this.updateMediaElementEventHandlers("unregister");
                this.currentHlsInstance = undefined;
            }
        });
        this.core = new Core(config === null || config === void 0 ? void 0 : config.core);
        this.segmentManager = new SegmentManager(this.core);
    }
    /**
     * Adds an event listener for the specified event.
     * @param eventName The name of the event to listen for.
     * @param listener The callback function to be invoked when the event is triggered.
     *
     * @example
     * // Listening for a segment being successfully loaded
     * p2pEngine.addEventListener('onSegmentLoaded', (details) => {
     *   console.log('Segment Loaded:', details);
     * });
     *
     * @example
     * // Handling segment load errors
     * p2pEngine.addEventListener('onSegmentError', (errorDetails) => {
     *   console.error('Error loading segment:', errorDetails);
     * });
     *
     * @example
     * // Tracking data downloaded from peers
     * p2pEngine.addEventListener('onChunkDownloaded', (bytesLength, downloadSource, peerId) => {
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
    /**
     * Provides the Hls.js P2P specific configuration for Hls.js loaders.
     * @returns An object containing the fragment loader (`fLoader`) and playlist loader (`pLoader`).
     */
    getConfigForHlsJs() {
        return {
            fLoader: this.createFragmentLoaderClass(),
            pLoader: this.createPlaylistLoaderClass(),
        };
    }
    /**
     * Retrieves the current configuration of the Hls.js P2P engine.
     * @returns A readonly version of the `HlsJsP2PEngineConfig`.
     */
    getConfig() {
        return { core: this.core.getConfig() };
    }
    /**
     * Applies dynamic configuration updates to the P2P engine.
     * @param dynamicConfig The configuration changes to apply.
     *
     * @example
     * // Assuming `hlsP2PEngine` is an instance of HlsJsP2PEngine
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
     * hlsP2PEngine.applyDynamicConfig(newDynamicConfig);
     */
    applyDynamicConfig(dynamicConfig) {
        if (dynamicConfig.core)
            this.core.applyDynamicConfig(dynamicConfig.core);
    }
    /**
     * Sets the HLS instance used for handling media.
     * @param hls The HLS instance, or a function that returns an HLS instance.
     */
    bindHls(hls) {
        this.hlsInstanceGetter =
            typeof hls === "function" ? hls : () => hls;
    }
    initHlsEvents() {
        var _a;
        const hlsInstance = (_a = this.hlsInstanceGetter) === null || _a === void 0 ? void 0 : _a.call(this);
        if (this.currentHlsInstance === hlsInstance)
            return;
        if (this.currentHlsInstance)
            this.destroy();
        this.currentHlsInstance = hlsInstance;
        this.updateHlsEventsHandlers("register");
        this.updateMediaElementEventHandlers("register");
    }
    updateHlsEventsHandlers(type) {
        const hls = this.currentHlsInstance;
        if (!hls)
            return;
        const method = type === "register" ? "on" : "off";
        hls[method]("hlsManifestLoaded", this.handleManifestLoaded);
        hls[method]("hlsLevelSwitching", this.handleLevelSwitching);
        hls[method]("hlsLevelUpdated", this.handleLevelUpdated);
        hls[method]("hlsAudioTrackLoaded", this.handleLevelUpdated);
        hls[method]("hlsDestroying", this.destroy);
        hls[method]("hlsMediaAttaching", this.destroyCore);
        hls[method]("hlsManifestLoading", this.destroyCore);
        hls[method]("hlsMediaDetached", this.handleMediaDetached);
        hls[method]("hlsMediaAttached", this.handleMediaAttached);
    }
    updateLiveSyncDurationCount(data) {
        const fragmentDuration = data.details.targetduration;
        const maxLiveSyncCount = Math.floor(MAX_LIVE_SYNC_DURATION / fragmentDuration);
        const newLiveSyncDurationCount = Math.min(data.details.fragments.length - 1, maxLiveSyncCount);
        if (this.currentHlsInstance &&
            this.currentHlsInstance.config.liveSyncDurationCount !==
                newLiveSyncDurationCount) {
            this.debug(`Setting liveSyncDurationCount to ${newLiveSyncDurationCount}`);
            this.currentHlsInstance.config.liveSyncDurationCount =
                newLiveSyncDurationCount;
        }
    }
    updateMaxBufferLength(fragmentDuration) {
        if (!this.currentHlsInstance)
            return;
        const config = this.core.getConfig();
        const highDemandTimeWindow = Math.max(config.mainStream.highDemandTimeWindow, config.secondaryStream.highDemandTimeWindow);
        // Hls.js maxBufferLength dictates how many seconds AHEAD OF THE PLAYHEAD it buffers.
        // To ensure Hls.js only buffers up to the highDemandTimeWindow and lets the
        // background loader do all the advance fetching, we set p2pOptimalBufferLength
        // directly equal to highDemandTimeWindow, but with a lower bound based on fragment duration.
        const p2pOptimalBufferLength = Math.max(fragmentDuration * 2, highDemandTimeWindow);
        if (this.currentHlsInstance.config.maxBufferLength > p2pOptimalBufferLength) {
            this.debug(`Setting maxBufferLength to ${p2pOptimalBufferLength}`);
            this.currentHlsInstance.config.maxBufferLength = p2pOptimalBufferLength;
        }
        if (this.currentHlsInstance.config.maxMaxBufferLength > p2pOptimalBufferLength) {
            this.debug(`Setting maxMaxBufferLength to ${p2pOptimalBufferLength}`);
            this.currentHlsInstance.config.maxMaxBufferLength =
                p2pOptimalBufferLength;
        }
    }
    createFragmentLoaderClass() {
        const { core } = this;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const engine = this;
        return class FragmentLoader extends FragmentLoaderBase {
            constructor(config) {
                super(config, core);
            }
            static getEngine() {
                return engine;
            }
        };
    }
    createPlaylistLoaderClass() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const engine = this;
        return class PlaylistLoader extends PlaylistLoaderBase {
            constructor(config) {
                super(config);
                engine.initHlsEvents();
            }
        };
    }
}
//# sourceMappingURL=engine.js.map