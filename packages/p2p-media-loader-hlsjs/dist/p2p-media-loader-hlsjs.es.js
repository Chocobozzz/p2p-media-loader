import { Core, Core as Core$1, CoreRequestError, debug } from "p2p-media-loader-core";
//#region src/utils.ts
function getSegmentRuntimeId(segmentRequestUrl, byteRange) {
	if (!byteRange) return segmentRequestUrl;
	return `${segmentRequestUrl}|${byteRange.start}-${byteRange.end}`;
}
function getByteRange(rangeStart, rangeEnd) {
	if (rangeStart !== void 0 && rangeEnd !== void 0 && rangeStart <= rangeEnd) return {
		start: rangeStart,
		end: rangeEnd
	};
}
//#endregion
//#region src/fragment-loader.ts
var DEFAULT_DOWNLOAD_LATENCY = 10;
var FragmentLoaderBase = class {
	context;
	config;
	stats;
	#callbacks;
	#createDefaultLoader;
	#defaultLoader;
	#core;
	#response;
	#segmentId;
	constructor(config, core) {
		this.#core = core;
		this.#createDefaultLoader = () => new config.loader(config);
		this.stats = {
			aborted: false,
			chunkCount: 0,
			loading: {
				start: 0,
				first: 0,
				end: 0
			},
			buffering: {
				start: 0,
				first: 0,
				end: 0
			},
			parsing: {
				start: 0,
				end: 0
			},
			total: 1,
			loaded: 1,
			bwEstimate: 0,
			retry: 0
		};
	}
	load(context, config, callbacks) {
		this.context = context;
		this.config = config;
		this.#callbacks = callbacks;
		const { stats } = this;
		const { rangeStart: start, rangeEnd: end } = context;
		const byteRange = getByteRange(start, end !== void 0 ? end - 1 : void 0);
		this.#segmentId = getSegmentRuntimeId(context.url, byteRange);
		const isSegmentDownloadableByP2PCore = this.#core.isSegmentLoadable(this.#segmentId);
		if (!this.#core.hasSegment(this.#segmentId) || !isSegmentDownloadableByP2PCore) {
			this.#defaultLoader = this.#createDefaultLoader();
			this.#defaultLoader.stats = this.stats;
			this.#defaultLoader.load(context, config, callbacks);
			return;
		}
		const onSuccess = (response) => {
			if (!this.#callbacks) return;
			this.#response = response;
			const loadedBytes = this.#response.data.byteLength;
			stats.loading = getLoadingStat(this.#response.bandwidth, loadedBytes, performance.now());
			stats.total = loadedBytes;
			stats.loaded = loadedBytes;
			const engineData = this.#response.data.slice(0);
			if (this.#callbacks.onProgress) this.#callbacks.onProgress(this.stats, context, engineData, void 0);
			this.#callbacks.onSuccess({
				data: engineData,
				url: context.url
			}, this.stats, context, void 0);
		};
		const onError = (error) => {
			if (error instanceof CoreRequestError && error.type === "aborted" && this.stats.aborted) return;
			this.#handleError(error);
		};
		this.#core.loadSegment(this.#segmentId, {
			onSuccess,
			onError
		});
	}
	#handleError(thrownError) {
		const error = {
			code: 0,
			text: ""
		};
		if (thrownError instanceof CoreRequestError && thrownError.type === "failed") error.text = thrownError.message;
		else if (thrownError instanceof Error) error.text = thrownError.message;
		this.#callbacks?.onError(error, this.context, null, this.stats);
	}
	#abortInternal() {
		if (!this.#response && this.#segmentId) {
			this.stats.aborted = true;
			this.#core.abortSegmentLoading(this.#segmentId);
		}
	}
	abort() {
		if (this.#defaultLoader) this.#defaultLoader.abort();
		else {
			this.#abortInternal();
			this.#callbacks?.onAbort?.(this.stats, this.context, {});
		}
	}
	destroy() {
		if (this.#defaultLoader) this.#defaultLoader.destroy();
		else {
			if (!this.stats.aborted) this.#abortInternal();
			this.#callbacks = null;
			this.config = null;
		}
	}
};
function getLoadingStat(targetBitrate, loadedBytes, loadingEndTime) {
	const timeForLoading = targetBitrate > 0 ? loadedBytes * 8e3 / targetBitrate : 0;
	const first = Math.max(0, loadingEndTime - timeForLoading);
	return {
		start: Math.max(0, first - DEFAULT_DOWNLOAD_LATENCY),
		first,
		end: loadingEndTime
	};
}
//#endregion
//#region src/playlist-loader.ts
var PlaylistLoaderBase = class {
	#defaultLoader;
	context;
	stats;
	constructor(config) {
		this.#defaultLoader = new config.loader(config);
		this.stats = this.#defaultLoader.stats;
		this.context = this.#defaultLoader.context;
	}
	load(context, config, callbacks) {
		this.#defaultLoader.load(context, config, callbacks);
	}
	abort() {
		this.#defaultLoader.abort();
	}
	destroy() {
		this.#defaultLoader.destroy();
	}
};
//#endregion
//#region src/stream-properties.ts
function getVideoStreamProperties(level) {
	const { bitrate, maxBitrate, videoCodec, width, height } = level;
	const b = maxBitrate ?? bitrate;
	const isMissingMetadata = b === 0;
	return {
		bitrate: b,
		codecs: isMissingMetadata ? void 0 : videoCodec,
		width: isMissingMetadata ? void 0 : width,
		height: isMissingMetadata ? void 0 : height,
		frameRate: isMissingMetadata ? void 0 : level.attrs["FRAME-RATE"],
		videoRange: isMissingMetadata ? void 0 : level.attrs["VIDEO-RANGE"]
	};
}
function getAudioStreamProperties(track) {
	const { audioCodec, lang, channels, name } = track;
	return {
		bitrate: 0,
		codecs: audioCodec,
		language: lang,
		channels,
		name
	};
}
//#endregion
//#region src/segment-manager.ts
var SegmentManager = class {
	core;
	logger = debug("p2pml-hlsjs:segment-manager");
	constructor(core) {
		this.core = core;
	}
	processMainManifest(data) {
		const { levels, audioTracks } = data;
		for (const level of levels) {
			const { url } = level;
			this.addStream({
				runtimeId: Array.isArray(url) ? url[0] : url,
				type: "main",
				properties: getVideoStreamProperties(level)
			});
		}
		for (const track of audioTracks) {
			const { url } = track;
			this.addStream({
				runtimeId: Array.isArray(url) ? url[0] : url,
				type: "secondary",
				properties: getAudioStreamProperties(track)
			});
		}
	}
	addStream(stream) {
		try {
			this.core.addStreamIfNoneExists(stream);
		} catch (error) {
			this.logger(`failed to register stream ${stream.runtimeId}:`, error);
		}
	}
	updatePlaylist(data) {
		const { details: { url, fragments, live } } = data;
		const registeredSegmentIds = this.core.getStreamSegmentRuntimeIds(url);
		if (!registeredSegmentIds) return;
		const segmentToRemoveIds = new Set(registeredSegmentIds);
		const newSegments = [];
		fragments.forEach((fragment, index) => {
			const { url: responseUrl, byteRange: fragByteRange, sn, start: startTime, end: endTime } = fragment;
			const [start, end] = fragByteRange;
			const byteRange = getByteRange(start, end !== void 0 ? end - 1 : void 0);
			const runtimeId = getSegmentRuntimeId(responseUrl, byteRange);
			segmentToRemoveIds.delete(runtimeId);
			if (registeredSegmentIds.has(runtimeId)) return;
			newSegments.push({
				runtimeId,
				url: responseUrl,
				externalId: live ? sn : index,
				byteRange,
				startTime,
				endTime
			});
		});
		if (!newSegments.length && !segmentToRemoveIds.size) return;
		this.core.updateStream(url, newSegments, segmentToRemoveIds.values());
	}
};
//#endregion
//#region src/engine-static.ts
function injectMixin(HlsJsClass) {
	return class HlsJsWithP2PClass extends HlsJsClass {
		#p2pEngine;
		get p2pEngine() {
			return this.#p2pEngine;
		}
		constructor(...args) {
			const { p2p, ...hlsJsConfig } = args[0] ?? {};
			const p2pEngine = new HlsJsP2PEngine(p2p);
			super({
				...hlsJsConfig,
				...p2pEngine.getConfigForHlsJs()
			});
			p2pEngine.bindHls(this);
			this.#p2pEngine = p2pEngine;
			p2p?.onHlsJsCreated?.(this);
		}
	};
}
//#endregion
//#region src/engine.ts
var MAX_LIVE_SYNC_DURATION = 120;
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
var HlsJsP2PEngine = class {
	core;
	segmentManager;
	hlsInstanceGetter;
	currentHlsInstance;
	debug = debug("p2pml-hlsjs:engine");
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
		this.core = new Core$1(config?.core);
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
			pLoader: this.createPlaylistLoaderClass()
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
		if (dynamicConfig.core) this.core.applyDynamicConfig(dynamicConfig.core);
	}
	/**
	* Sets the HLS instance used for handling media.
	* @param hls The HLS instance, or a function that returns an HLS instance.
	*/
	bindHls(hls) {
		this.hlsInstanceGetter = typeof hls === "function" ? hls : () => hls;
	}
	initHlsEvents() {
		const hlsInstance = this.hlsInstanceGetter?.();
		if (this.currentHlsInstance === hlsInstance) return;
		if (this.currentHlsInstance) this.destroy();
		this.currentHlsInstance = hlsInstance;
		this.updateHlsEventsHandlers("register");
		this.updateMediaElementEventHandlers("register");
	}
	updateHlsEventsHandlers(type) {
		const hls = this.currentHlsInstance;
		if (!hls) return;
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
	updateMediaElementEventHandlers = (type) => {
		const media = this.currentHlsInstance?.media;
		if (!media) return;
		const method = type === "register" ? "addEventListener" : "removeEventListener";
		media[method]("timeupdate", this.handlePlaybackUpdate);
		media[method]("seeking", this.handlePlaybackUpdate);
		media[method]("ratechange", this.handlePlaybackUpdate);
	};
	handleManifestLoaded = (event, data) => {
		const networkDetails = data.networkDetails;
		if (networkDetails instanceof XMLHttpRequest) this.core.setManifestResponseUrl(networkDetails.responseURL);
		else if (networkDetails instanceof Response) this.core.setManifestResponseUrl(networkDetails.url);
		else this.core.setManifestResponseUrl(data.url);
		this.segmentManager.processMainManifest(data);
	};
	handleLevelSwitching = (event, data) => {
		if (data.bitrate) this.core.setActiveLevelBitrate(data.bitrate);
	};
	handleLevelUpdated = (event, data) => {
		if (this.currentHlsInstance && data.details.fragments[0].type === "main" && data.details.fragments.length > 4) {
			if (data.details.live && !this.currentHlsInstance.userConfig.liveSyncDuration && !this.currentHlsInstance.userConfig.liveSyncDurationCount) this.updateLiveSyncDurationCount(data);
			if (!this.currentHlsInstance.userConfig.maxBufferLength && !this.currentHlsInstance.userConfig.maxMaxBufferLength) this.updateMaxBufferLength(data.details.targetduration);
		}
		this.core.setIsLive(data.details.live);
		this.segmentManager.updatePlaylist(data);
	};
	updateLiveSyncDurationCount(data) {
		const fragmentDuration = data.details.targetduration;
		const maxLiveSyncCount = Math.floor(MAX_LIVE_SYNC_DURATION / fragmentDuration);
		const newLiveSyncDurationCount = Math.min(data.details.fragments.length - 1, maxLiveSyncCount);
		if (this.currentHlsInstance && this.currentHlsInstance.config.liveSyncDurationCount !== newLiveSyncDurationCount) {
			this.debug(`Setting liveSyncDurationCount to ${newLiveSyncDurationCount}`);
			this.currentHlsInstance.config.liveSyncDurationCount = newLiveSyncDurationCount;
		}
	}
	updateMaxBufferLength(fragmentDuration) {
		if (!this.currentHlsInstance) return;
		const config = this.core.getConfig();
		const highDemandTimeWindow = Math.max(config.mainStream.highDemandTimeWindow, config.secondaryStream.highDemandTimeWindow);
		const p2pOptimalBufferLength = Math.max(fragmentDuration * 2, highDemandTimeWindow);
		if (this.currentHlsInstance.config.maxBufferLength > p2pOptimalBufferLength) {
			this.debug(`Setting maxBufferLength to ${p2pOptimalBufferLength}`);
			this.currentHlsInstance.config.maxBufferLength = p2pOptimalBufferLength;
		}
		if (this.currentHlsInstance.config.maxMaxBufferLength > p2pOptimalBufferLength) {
			this.debug(`Setting maxMaxBufferLength to ${p2pOptimalBufferLength}`);
			this.currentHlsInstance.config.maxMaxBufferLength = p2pOptimalBufferLength;
		}
	}
	handleMediaAttached = () => {
		this.updateMediaElementEventHandlers("register");
	};
	handleMediaDetached = () => {
		this.updateMediaElementEventHandlers("unregister");
	};
	handlePlaybackUpdate = (event) => {
		const media = event.target;
		this.core.updatePlayback(media.currentTime, media.playbackRate);
	};
	destroyCore = () => this.core.destroy();
	/** Cleans up and releases all resources, and unregisters all event handlers. */
	destroy = () => {
		this.destroyCore();
		this.updateHlsEventsHandlers("unregister");
		this.updateMediaElementEventHandlers("unregister");
		this.currentHlsInstance = void 0;
	};
	createFragmentLoaderClass() {
		const { core } = this;
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
		const engine = this;
		return class PlaylistLoader extends PlaylistLoaderBase {
			constructor(config) {
				super(config);
				engine.initHlsEvents();
			}
		};
	}
};
//#endregion
export { Core, HlsJsP2PEngine };

//# sourceMappingURL=p2p-media-loader-hlsjs.es.js.map