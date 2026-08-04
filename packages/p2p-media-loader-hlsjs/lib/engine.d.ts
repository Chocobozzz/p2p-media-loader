import type Hls from "hls.js";
import type { HlsConfig } from "hls.js";
import { CoreConfig, CoreEventMap, DynamicCoreConfig, DefinedCoreConfig } from "p2p-media-loader-core";
/** Represents the complete configuration for the `HlsJsP2PEngine`. */
export type HlsJsP2PEngineConfig = {
    /** Complete core configuration settings. */
    core: DefinedCoreConfig;
};
/** Allows for partial configuration of the `HlsJsP2PEngine`, useful for providing overrides or partial updates. */
export type PartialHlsJsP2PEngineConfig = Partial<Omit<HlsJsP2PEngineConfig, "core">> & {
    /** Partial core config */
    core?: Partial<CoreConfig>;
};
/** A type for specifying dynamic configuration options that can be changed at runtime for the P2P engine's core. */
export type DynamicHlsJsP2PEngineConfig = {
    /** Dynamic core config */
    core?: DynamicCoreConfig;
};
/**
 * Extends a generic HLS type to include the P2P engine, integrating P2P capabilities directly into the HLS instance.
 * @template HlsType The base HLS type that is being extended.
 */
export type HlsWithP2PInstance<HlsType> = HlsType & {
    /** HlsJsP2PEngine instance */
    readonly p2pEngine: HlsJsP2PEngine;
};
/**
 * Configuration type for HLS instances that includes P2P settings, augmenting standard HLS configuration with P2P capabilities.
 * @template HlsType A constructor type that produces an HLS instance.
 */
export type HlsWithP2PConfig<HlsType extends abstract new () => unknown> = ConstructorParameters<HlsType>[0] & {
    p2p?: PartialHlsJsP2PEngineConfig & {
        onHlsJsCreated?: (hls: HlsWithP2PInstance<HlsType>) => void;
    };
};
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
export declare class HlsJsP2PEngine {
    private readonly core;
    private readonly segmentManager;
    private hlsInstanceGetter?;
    private currentHlsInstance?;
    private readonly debug;
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
    static injectMixin(hls: typeof Hls): new (config?: (Partial<HlsConfig> & {
        p2p?: (Partial<Omit<HlsJsP2PEngineConfig, "core">> & {
            /** Partial core config */
            core?: Partial<CoreConfig>;
        } & {
            onHlsJsCreated?: ((hls: HlsWithP2PInstance<typeof Hls>) => void) | undefined;
        }) | undefined;
    }) | undefined) => HlsWithP2PInstance<Hls>;
    /**
     * Constructs an instance of `HlsJsP2PEngine`.
     * @param config An optional configuration for the P2P engine setup.
     */
    constructor(config?: PartialHlsJsP2PEngineConfig);
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
    addEventListener<K extends keyof CoreEventMap>(eventName: K, listener: CoreEventMap[K]): void;
    /**
     * Removes an event listener for the specified event.
     * @param eventName The name of the event.
     * @param listener The callback function that was previously added.
     */
    removeEventListener<K extends keyof CoreEventMap>(eventName: K, listener: CoreEventMap[K]): void;
    /**
     * Provides the Hls.js P2P specific configuration for Hls.js loaders.
     * @returns An object containing the fragment loader (`fLoader`) and playlist loader (`pLoader`).
     */
    getConfigForHlsJs(): {
        fLoader: unknown;
        pLoader: unknown;
    };
    /**
     * Retrieves the current configuration of the Hls.js P2P engine.
     * @returns A readonly version of the `HlsJsP2PEngineConfig`.
     */
    getConfig(): HlsJsP2PEngineConfig;
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
    applyDynamicConfig(dynamicConfig: DynamicHlsJsP2PEngineConfig): void;
    /**
     * Sets the HLS instance used for handling media.
     * @param hls The HLS instance, or a function that returns an HLS instance.
     */
    bindHls<T = unknown>(hls: T | (() => T)): void;
    private initHlsEvents;
    private updateHlsEventsHandlers;
    private updateMediaElementEventHandlers;
    private handleManifestLoaded;
    private handleLevelSwitching;
    private handleLevelUpdated;
    private updateLiveSyncDurationCount;
    private updateMaxBufferLength;
    private handleMediaAttached;
    private handleMediaDetached;
    private handlePlaybackUpdate;
    private destroyCore;
    /** Cleans up and releases all resources, and unregisters all event handlers. */
    destroy: () => void;
    private createFragmentLoaderClass;
    private createPlaylistLoaderClass;
}
