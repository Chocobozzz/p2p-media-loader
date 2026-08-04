import type shaka from "shaka-player/dist/shaka-player.compiled.d.ts";
import { CoreConfig, CoreEventMap, DynamicCoreConfig, DefinedCoreConfig } from "p2p-media-loader-core";
/** A type for specifying dynamic configuration options that can be changed at runtime for the P2P engine's core. */
export type DynamicShakaP2PEngineConfig = {
    /** Dynamic core config */
    core?: DynamicCoreConfig;
};
/** Represents the complete configuration for the `ShakaP2PEngine`. */
export type ShakaP2PEngineConfig = {
    /** Complete core configuration settings. */
    core: DefinedCoreConfig;
};
/** Allows for partial configuration settings for the `ShakaP2PEngine`. */
export type PartialShakaP2PEngineConfig = Partial<Omit<ShakaP2PEngineConfig, "core">> & {
    /** Partial core config */
    core?: Partial<CoreConfig>;
};
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
export declare class ShakaP2PEngine {
    private player?;
    private readonly shaka;
    private readonly streamInfo;
    private readonly core;
    private readonly segmentManager;
    private requestFilter?;
    /**
     * Constructs an instance of `ShakaP2PEngine`.
     *
     * @param config An optional configuration for customizing the P2P engine's behavior.
     * @param shaka The Shaka Player library instance.
     */
    constructor(config?: PartialShakaP2PEngineConfig, shaka?: typeof import("shaka-player").default);
    /**
     * Configures and initializes the Shaka Player instance with predefined settings optimized for P2P performance.
     *
     * @param player The Shaka Player instance to configure.
     */
    bindShakaPlayer(player: shaka.Player): void;
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
    applyDynamicConfig(dynamicConfig: DynamicShakaP2PEngineConfig): void;
    /**
     * Retrieves the current configuration of the `ShakaP2PEngine`.
     *
     * @returns The configuration as a readonly object.
     */
    getConfig(): ShakaP2PEngineConfig;
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
    addEventListener<K extends keyof CoreEventMap>(eventName: K, listener: CoreEventMap[K]): void;
    /**
     * Removes an event listener for the specified event.
     * @param eventName The name of the event.
     * @param listener The callback function that was previously added.
     */
    removeEventListener<K extends keyof CoreEventMap>(eventName: K, listener: CoreEventMap[K]): void;
    private updatePlayerEventHandlers;
    private onVariantChanged;
    private handlePlayerLoaded;
    private handlePlayerUnloading;
    private destroyCurrentStreamContext;
    private updateMediaElementEventHandlers;
    private handlePlaybackUpdate;
    /** Cleans up and releases all resources, and unregisters all event handlers. */
    destroy(): void;
    private static registerManifestParsers;
    private static unregisterManifestParsers;
    private static registerNetworkingEngineSchemes;
    private static unregisterNetworkingEngineSchemes;
    /**
     * Registers plugins related to P2P functionality into the Shaka Player.
     * Plugins must be registered before initializing the player to ensure proper integration.
     *
     * @param shaka The Shaka Player library. Defaults to the global Shaka Player instance if not provided.
     */
    static registerPlugins(shaka?: typeof import("shaka-player").default): void;
    /**
     * Unregisters plugins related to P2P functionality from the Shaka Player.
     *
     * @param shaka The Shaka Player library. Defaults to the global Shaka Player instance if not provided.
     */
    static unregisterPlugins(shaka?: typeof import("shaka-player").default): void;
}
