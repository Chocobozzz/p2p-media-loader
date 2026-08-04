import { Stream, CoreConfig, Segment, CoreEventMap, DynamicCoreConfig, EngineCallbacks, CommonCoreConfig, StreamConfig, DefinedCoreConfig, StreamRegistration } from "./types.js";
/** Core class for managing media streams loading via P2P. */
export declare class Core<TStream extends Stream = Stream> {
    /** Default configuration for common core settings. */
    static readonly DEFAULT_COMMON_CORE_CONFIG: CommonCoreConfig;
    /** Default configuration for stream settings. */
    static readonly DEFAULT_STREAM_CONFIG: StreamConfig;
    private readonly eventTarget;
    private manifestResponseUrl?;
    private readonly streams;
    private mainStreamConfig;
    private secondaryStreamConfig;
    private commonCoreConfig;
    private readonly bandwidthCalculators;
    private segmentStorage?;
    private readonly webTorrentSocketPool;
    private readonly logger;
    private readonly socketPoolLogger;
    private readonly peerId;
    private mainStreamLoader?;
    private secondaryStreamLoader?;
    private streamDetails;
    private storageInitPromise?;
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
    constructor(config?: Partial<CoreConfig>);
    /**
     * Retrieves the current configuration for the core instance, ensuring immutability.
     *
     * @returns A deep readonly version of the core configuration.
     */
    getConfig(): DefinedCoreConfig;
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
    applyDynamicConfig(dynamicConfig: DynamicCoreConfig): void;
    private processSpecificDynamicConfigParams;
    private getUpdatedStreamProperty;
    /**
     * Adds an event listener for the specified event type on the core event target.
     *
     * @param eventName - The name of the event to listen for.
     * @param listener - The callback function to invoke when the event is fired.
     */
    addEventListener<K extends keyof CoreEventMap>(eventName: K, listener: CoreEventMap[K]): void;
    /**
     * Removes an event listener for the specified event type on the core event target.
     *
     * @param eventName - The name of the event to listen for.
     * @param listener - The callback function to be removed.
     */
    removeEventListener<K extends keyof CoreEventMap>(eventName: K, listener: CoreEventMap[K]): void;
    /**
     * Sets the response URL for the manifest, stripping any query parameters.
     *
     * @param url - The full URL to the manifest response.
     */
    setManifestResponseUrl(url: string): void;
    /**
     * Checks if a segment is already stored within the core.
     *
     * @param segmentRuntimeId - The runtime identifier of the segment to check.
     * @returns `true` if the segment is present, otherwise `false`.
     */
    hasSegment(segmentRuntimeId: string): boolean;
    /**
     * Retrieves a specific stream by its runtime identifier, if it exists.
     *
     * @param streamRuntimeId - The runtime identifier of the stream to retrieve.
     * @returns The registered stream with its computed identity, or `undefined` if not found.
     */
    getStream(streamRuntimeId: string): TStream | undefined;
    /**
     * Retrieves the runtime identifiers of the segments currently registered
     * for a stream. Player integrations use this to diff a refreshed manifest
     * against the core's registry before calling `updateStream`.
     *
     * @param streamRuntimeId - The runtime identifier of the stream.
     * @returns A snapshot set of the registered segment runtime IDs, or
     * `undefined` if the stream is not registered.
     */
    getStreamSegmentRuntimeIds(streamRuntimeId: string): ReadonlySet<string> | undefined;
    /**
     * Retrieves all currently registered streams with their computed identities,
     * including the infohashes announced to trackers. Unlike the `onStreamAdded`
     * event, this reflects the full set at any moment, so late subscribers can
     * catch up on streams registered before they attached.
     *
     * @returns The registered streams, in registration order.
     */
    getStreams(): TStream[];
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
    addStreamIfNoneExists(stream: StreamRegistration<TStream>): void;
    /**
     * Updates the segments associated with a specific stream.
     *
     * @param streamRuntimeId - The runtime identifier of the stream to update.
     * @param addSegments - Optional segments to add to the stream.
     * @param removeSegmentIds - Optional segment IDs to remove from the stream.
     */
    updateStream(streamRuntimeId: string, addSegments?: Iterable<Segment>, removeSegmentIds?: Iterable<string>): void;
    /**
     * Loads a segment given its runtime identifier and invokes the provided callbacks during the process.
     * Initializes segment storage if it has not been initialized yet.
     *
     * @param segmentRuntimeId - The runtime identifier of the segment to load.
     * @param callbacks - The callbacks to be invoked during segment loading.
     * @throws {Error} - Throws if the manifest response URL is not defined.
     */
    loadSegment(segmentRuntimeId: string, callbacks: EngineCallbacks): Promise<void>;
    /**
     * Aborts the loading of a segment specified by its runtime identifier.
     *
     * @param segmentRuntimeId - The runtime identifier of the segment whose loading is to be aborted.
     */
    abortSegmentLoading(segmentRuntimeId: string): void;
    /**
     * Updates the playback parameters while play head moves, specifically position and playback rate, for stream loaders.
     *
     * @param position - The new position in the stream, in seconds.
     * @param rate - The new playback rate.
     */
    updatePlayback(position: number, rate: number): void;
    /**
     * Sets the active level bitrate, used for adjusting quality levels in adaptive streaming.
     * Notifies the stream loaders if a change occurs.
     *
     * @param bitrate - The new bitrate to set as active.
     */
    setActiveLevelBitrate(bitrate: number): void;
    /**
     * Updates the 'isLive' status of the stream
     *
     * @param isLive - Boolean indicating whether the stream is live.
     */
    setIsLive(isLive: boolean): void;
    /**
     * Identify if a segment is loadable by the P2P core based on the segment's stream type and configuration.
     * @param segmentRuntimeId Segment runtime identifier to check.
     * @returns `true` if the segment is loadable by the P2P core, otherwise `false`.
     */
    isSegmentLoadable(segmentRuntimeId: string): boolean;
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
    destroy(): void;
    private initializeSegmentStorage;
    private identifySegment;
    private overrideAllConfigs;
    private stripStaticOnlyProps;
    private destroyStreamLoader;
    private getStreamHybridLoader;
    private createNewHybridLoader;
}
