import { Core, Core as Core$1, CoreRequestError, debug } from "p2p-media-loader-core";
//#region src/stream-properties.ts
var AUDIO_CODECS = [
	"mp4a",
	"ac-3",
	"ec-3",
	"ec+3",
	"opus",
	"vorb",
	"flac"
];
function getVideoStreamProperties(variant, video) {
	const isMissingMetadata = variant.bandwidth === 0;
	const videoCodecs = video.codecs ? video.codecs.split(",").map((c) => c.trim().toLowerCase()).filter((c) => !AUDIO_CODECS.some((p) => c.startsWith(p))).join(",") : void 0;
	const { frameRate, hdr: videoRange } = video;
	return {
		bitrate: variant.bandwidth,
		codecs: isMissingMetadata ? void 0 : videoCodecs,
		width: isMissingMetadata ? void 0 : video.width,
		height: isMissingMetadata ? void 0 : video.height,
		frameRate: isMissingMetadata ? void 0 : frameRate,
		videoRange: isMissingMetadata ? void 0 : videoRange
	};
}
function getAudioStreamProperties(variant, audio, isMain) {
	const name = audio.label ?? audio.originalId ?? void 0;
	return {
		bitrate: isMain ? variant.bandwidth : 0,
		codecs: isMain ? void 0 : audio.codecs,
		language: isMain ? void 0 : audio.language,
		channels: isMain ? void 0 : audio.channelsCount,
		name: isMain ? void 0 : name
	};
}
//#endregion
//#region src/manifest-parser-decorator.ts
var ManifestParserDecorator = class {
	shaka;
	originalManifestParser;
	debug = debug("p2pml-shaka:manifest-parser");
	isHls;
	segmentManager;
	player;
	constructor(shaka, originalManifestParser) {
		this.shaka = shaka;
		this.originalManifestParser = originalManifestParser;
		this.isHls = this.originalManifestParser instanceof shaka.hls.HlsParser;
	}
	configure(config) {
		return this.originalManifestParser.configure(config);
	}
	banLocation(uri) {
		return this.originalManifestParser.banLocation(uri);
	}
	onInitialVariantChosen(variant) {
		return this.originalManifestParser.onInitialVariantChosen(variant);
	}
	setP2PMediaLoaderData(p2pml) {
		if (!p2pml) return;
		this.segmentManager = p2pml.segmentManager;
		this.player = p2pml.player;
		p2pml.streamInfo.protocol = this.isHls ? "hls" : "dash";
	}
	async start(uri, playerInterface) {
		const { p2pml } = playerInterface.networkingEngine;
		this.setP2PMediaLoaderData(p2pml);
		const manifest = await this.originalManifestParser.start(uri, playerInterface);
		if (!p2pml) return manifest;
		if (this.isHls) this.hookHlsStreamMediaSequenceTimeMaps(manifest.variants);
		this.processStreams(manifest.variants);
		return manifest;
	}
	stop() {
		return this.originalManifestParser.stop();
	}
	update() {
		return this.originalManifestParser.update();
	}
	setMediaElement(mediaElement) {
		return this.originalManifestParser.setMediaElement(mediaElement);
	}
	onExpirationUpdated(sessionId, expiration) {
		return this.originalManifestParser.onExpirationUpdated(sessionId, expiration);
	}
	processStreams(variants) {
		const { segmentManager } = this;
		if (!segmentManager) return;
		const processedStreams = /* @__PURE__ */ new Set();
		const processStream = (stream, type, properties) => {
			try {
				this.hookSegmentIndex(stream);
				segmentManager.setStream(stream, type, properties);
			} catch (error) {
				this.debug(`failed to register stream ${stream.id}:`, error);
			}
			processedStreams.add(stream.id);
			return true;
		};
		for (const variant of variants) {
			const { video, audio } = variant;
			if (video && !processedStreams.has(video.id)) processStream(video, "main", getVideoStreamProperties(variant, video));
			if (audio && !processedStreams.has(audio.id)) {
				const isMain = !video;
				processStream(audio, isMain ? "main" : "secondary", getAudioStreamProperties(variant, audio, isMain));
			}
		}
	}
	hookSegmentIndex(stream) {
		const { segmentManager } = this;
		if (!segmentManager) return;
		const substituteSegmentIndexGet = (segmentIndex, callFromCreateSegmentIndexMethod = false) => {
			let prevReference = null;
			let prevFirstItemReference;
			let prevLastItemReference;
			const originalGet = segmentIndex.get;
			const customGet = (position) => {
				const reference = originalGet.call(segmentIndex, position);
				if (reference === prevReference || !this.player?.isLive() && stream.isSegmentIndexAlreadyRead) return reference;
				prevReference = reference;
				segmentIndex.get = originalGet;
				try {
					const references = getReferencesArray(segmentIndex, this.shaka);
					if (!references) throw new Error("Segment references not found");
					const firstItemReference = references[0];
					const lastItemReference = references[references.length - 1];
					if (firstItemReference === prevFirstItemReference && lastItemReference === prevLastItemReference) return reference;
					prevFirstItemReference = firstItemReference;
					prevLastItemReference = lastItemReference;
					segmentManager.updateStreamSegments(stream, references);
					stream.isSegmentIndexAlreadyRead = true;
					this.debug(`Stream ${stream.id} is updated`);
				} catch {} finally {
					if (!stream.isSegmentIndexAlreadyRead || !!this.player?.isLive() || !callFromCreateSegmentIndexMethod) segmentIndex.get = customGet;
				}
				return reference;
			};
			segmentIndex.get = customGet;
		};
		if (stream.segmentIndex) {
			substituteSegmentIndexGet(stream.segmentIndex);
			return;
		}
		const createSegmentIndexOriginal = stream.createSegmentIndex;
		stream.createSegmentIndex = async () => {
			const result = await createSegmentIndexOriginal.call(stream);
			if (stream.segmentIndex) substituteSegmentIndexGet(stream.segmentIndex, true);
			return result;
		};
	}
	hookHlsStreamMediaSequenceTimeMaps(variants) {
		const maps = getMapPropertiesFromObject(this.originalManifestParser);
		let videoMap;
		let audioMap;
		const keysToCheck = [
			"video",
			"audio",
			"text",
			"image"
		];
		for (const map of maps) {
			if (!keysToCheck.every((key) => map.has(key))) continue;
			videoMap = map.get("video");
			audioMap = map.get("audio");
		}
		if (videoMap && audioMap) {
			for (const variant of variants) {
				const { video: videoStream, audio: audioStream } = variant;
				if (videoStream) videoStream.mediaSequenceTimeMap = videoMap;
				if (audioStream) audioStream.mediaSequenceTimeMap = audioMap;
			}
			return;
		}
		const manifestVariantsMap = maps.find((map) => {
			const item = map.values().next().value;
			return typeof item === "object" && item?.streams?.createSegmentIndex;
		});
		if (!manifestVariantsMap) return;
		const manifestVariantMapValues = [...manifestVariantsMap.values()];
		for (const variant of manifestVariantMapValues) {
			if (variant?.stream?.mediaSequenceTimeMap) continue;
			const mediaSequenceTimeMap = getMapPropertiesFromObject(variant).find((map) => {
				const [key, value] = map.entries().next().value ?? [];
				return typeof key === "number" && typeof value === "number";
			});
			if (!mediaSequenceTimeMap) continue;
			variant.stream.mediaSequenceTimeMap = mediaSequenceTimeMap;
		}
	}
};
var HlsManifestParser = class extends ManifestParserDecorator {
	constructor(shaka) {
		super(shaka, new shaka.hls.HlsParser());
	}
};
var DashManifestParser = class extends ManifestParserDecorator {
	constructor(shaka) {
		super(shaka, new shaka.dash.DashParser());
	}
};
function getReferencesArray(obj, shaka) {
	for (const key in obj) if (Array.isArray(obj[key]) && obj[key].length > 0 && obj[key][0] instanceof shaka.media.SegmentReference) return obj[key];
	else if (typeof obj[key] === "object") {
		const references = getReferencesArray(obj[key], shaka);
		if (references) return references;
	}
	return null;
}
function getMapPropertiesFromObject(object) {
	return Object.keys(object).map((key) => object[key]).filter((property) => property instanceof Map);
}
//#endregion
//#region src/stream-utils.ts
function createSegment({ segmentReference, externalId, runtimeId }) {
	const { byteRange, url, startTime, endTime } = getSegmentInfoFromReference(segmentReference);
	return {
		runtimeId: runtimeId ?? getSegmentRuntimeId(url, byteRange),
		externalId,
		byteRange,
		url,
		startTime,
		endTime
	};
}
function getSegmentRuntimeIdFromReference(segmentReference) {
	const { url, byteRange } = getSegmentInfoFromReference(segmentReference);
	return getSegmentRuntimeId(url, byteRange);
}
function getSegmentRuntimeId(url, byteRange) {
	if (!byteRange) return url;
	const range = typeof byteRange === "string" ? getByteRangeFromHeaderString(byteRange) : byteRange;
	if (!range) return url;
	return `${url}|${range.start}-${range.end}`;
}
function getByteRangeFromHeaderString(rangeStr) {
	if (!rangeStr?.includes("bytes=")) return void 0;
	const parts = rangeStr.split("=")[1].split("-");
	const start = parseInt(parts[0]);
	const end = parseInt(parts[1]);
	if (isNaN(start) || isNaN(end)) return void 0;
	return {
		start,
		end
	};
}
function getSegmentInfoFromReference(segmentReference) {
	const uris = segmentReference.getUris();
	const responseUrl = uris[1] ?? uris[0];
	const start = segmentReference.getStartByte();
	const end = segmentReference.getEndByte() ?? void 0;
	const startTime = segmentReference.getStartTime();
	const endTime = segmentReference.getEndTime();
	return {
		byteRange: end !== void 0 ? {
			start,
			end
		} : void 0,
		url: responseUrl,
		startTime,
		endTime
	};
}
function getStreamLastMediaSequence(stream) {
	const { shakaStream } = stream;
	const map = shakaStream.mediaSequenceTimeMap;
	if (!map) return;
	const firstMediaSequence = map.keys().next().value;
	if (firstMediaSequence === void 0) return;
	return firstMediaSequence + map.size - 1;
}
//#endregion
//#region src/segment-manager.ts
var SEGMENT_ID_RESOLUTION_IN_SECONDS = .5;
var SegmentManager = class {
	core;
	streamInfo;
	constructor(streamInfo, core) {
		this.core = core;
		this.streamInfo = streamInfo;
	}
	setStream(shakaStream, type, properties) {
		this.core.addStreamIfNoneExists({
			runtimeId: shakaStream.id.toString(),
			type,
			properties,
			shakaStream
		});
		if (shakaStream.segmentIndex) this.updateStreamSegments(shakaStream);
	}
	updateStreamSegments(shakaStream, segmentReferences) {
		const stream = this.core.getStream(shakaStream.id.toString());
		if (!stream) return;
		const registeredSegmentIds = this.core.getStreamSegmentRuntimeIds(stream.runtimeId);
		if (!registeredSegmentIds) return;
		const { segmentIndex } = stream.shakaStream;
		if (!segmentReferences && segmentIndex) try {
			segmentReferences = [...segmentIndex].filter((ref) => !!ref);
		} catch {
			return;
		}
		if (!segmentReferences) return;
		if (this.streamInfo.protocol === "hls") this.processHlsSegmentReferences(stream, registeredSegmentIds, segmentReferences);
		else this.processDashSegmentReferences(stream, registeredSegmentIds, segmentReferences);
	}
	processDashSegmentReferences(managerStream, registeredSegmentIds, segmentReferences) {
		const staleSegmentsIds = new Set(registeredSegmentIds);
		const newSegments = [];
		for (const reference of segmentReferences) {
			const externalId = Math.trunc(reference.getStartTime() / SEGMENT_ID_RESOLUTION_IN_SECONDS);
			const runtimeId = getSegmentRuntimeIdFromReference(reference);
			if (!registeredSegmentIds.has(runtimeId)) {
				const segment = createSegment({
					segmentReference: reference,
					externalId,
					runtimeId
				});
				newSegments.push(segment);
			}
			staleSegmentsIds.delete(runtimeId);
		}
		if (!newSegments.length && !staleSegmentsIds.size) return;
		this.core.updateStream(managerStream.runtimeId, newSegments, staleSegmentsIds.values());
	}
	processHlsSegmentReferences(managerStream, registeredSegmentIds, segmentReferences) {
		const lastMediaSequence = getStreamLastMediaSequence(managerStream);
		const newSegments = [];
		if (registeredSegmentIds.size === 0) {
			const firstReferenceMediaSequence = lastMediaSequence === void 0 ? 0 : lastMediaSequence - segmentReferences.length + 1;
			for (const [index, reference] of segmentReferences.entries()) {
				const segment = createSegment({
					segmentReference: reference,
					externalId: firstReferenceMediaSequence + index
				});
				newSegments.push(segment);
			}
			this.core.updateStream(managerStream.runtimeId, newSegments);
			return;
		}
		if (lastMediaSequence === void 0) return;
		let mediaSequence = lastMediaSequence;
		for (const reference of itemsBackwards(segmentReferences)) {
			const runtimeId = getSegmentRuntimeIdFromReference(reference);
			if (registeredSegmentIds.has(runtimeId)) break;
			const segment = createSegment({
				runtimeId,
				segmentReference: reference,
				externalId: mediaSequence
			});
			newSegments.push(segment);
			mediaSequence--;
		}
		newSegments.reverse();
		const staleSegmentIds = [];
		const countToDelete = newSegments.length;
		for (const runtimeId of registeredSegmentIds) {
			if (staleSegmentIds.length >= countToDelete) break;
			staleSegmentIds.push(runtimeId);
		}
		if (!newSegments.length && !staleSegmentIds.length) return;
		this.core.updateStream(managerStream.runtimeId, newSegments, staleSegmentIds);
	}
};
function* itemsBackwards(items) {
	for (let i = items.length - 1; i >= 0; i--) yield items[i];
}
//#endregion
//#region src/loading-handler.ts
var Loader = class {
	shaka;
	core;
	streamInfo;
	loadArgs;
	constructor(shaka, core, streamInfo) {
		this.shaka = shaka;
		this.core = core;
		this.streamInfo = streamInfo;
	}
	defaultLoad() {
		return this.shaka.net.HttpFetchPlugin.parse(...this.loadArgs);
	}
	load(...args) {
		this.loadArgs = args;
		const { RequestType } = this.shaka.net.NetworkingEngine;
		const [url, request, requestType] = args;
		if (requestType === RequestType.SEGMENT) return this.loadSegment(url, request);
		const loading = this.defaultLoad();
		if (requestType === RequestType.MANIFEST) this.handleManifestLoading(loading.promise).catch(() => void 0);
		return loading;
	}
	async handleManifestLoading(loadingPromise) {
		if (!this.streamInfo.manifestResponseUrl) {
			const response = await loadingPromise;
			this.setManifestResponseUrl(response.uri);
		}
	}
	loadSegment(segmentUrl, originalRequest) {
		const byteRangeString = originalRequest.headers.Range;
		const segmentRuntimeId = getSegmentRuntimeId(segmentUrl, byteRangeString);
		const isSegmentDownloadableByP2PCore = this.core.isSegmentLoadable(segmentRuntimeId);
		if (!this.core.hasSegment(segmentRuntimeId) || !isSegmentDownloadableByP2PCore) return this.defaultLoad();
		const loadSegment = async () => {
			const { request, callbacks } = getSegmentRequest();
			this.core.loadSegment(segmentRuntimeId, callbacks);
			try {
				const { data, bandwidth } = await request;
				return {
					data,
					headers: {},
					originalRequest,
					uri: segmentUrl,
					originalUri: segmentUrl,
					timeMs: getLoadingDurationBasedOnBandwidth(bandwidth, data.byteLength)
				};
			} catch (error) {
				if (error instanceof CoreRequestError) {
					const { Error: ShakaError } = this.shaka.util;
					if (error.type === "aborted") throw new ShakaError(ShakaError.Severity.RECOVERABLE, ShakaError.Category.NETWORK, this.shaka.util.Error.Code.OPERATION_ABORTED);
				}
				throw error;
			}
		};
		return new this.shaka.util.AbortableOperation(loadSegment(), () => {
			this.core.abortSegmentLoading(segmentRuntimeId);
			return Promise.resolve();
		});
	}
	setManifestResponseUrl(responseUrl) {
		this.streamInfo.manifestResponseUrl = responseUrl;
		this.core.setManifestResponseUrl(responseUrl);
	}
};
function getLoadingDurationBasedOnBandwidth(bandwidth, bytesLoaded) {
	const bits = bytesLoaded * 8;
	return bandwidth > 0 ? Math.round(bits / bandwidth) * 1e3 : 0;
}
function getSegmentRequest() {
	let onSuccess;
	let onError;
	return {
		request: new Promise((resolve, reject) => {
			onSuccess = resolve;
			onError = reject;
		}),
		callbacks: {
			onSuccess,
			onError
		}
	};
}
//#endregion
//#region src/engine.ts
var LIVE_EDGE_DELAY = 25;
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
var ShakaP2PEngine = class ShakaP2PEngine {
	player;
	shaka;
	streamInfo = {};
	core;
	segmentManager;
	requestFilter;
	/**
	* Constructs an instance of `ShakaP2PEngine`.
	*
	* @param config An optional configuration for customizing the P2P engine's behavior.
	* @param shaka The Shaka Player library instance.
	*/
	constructor(config, shaka = window.shaka) {
		validateShaka(shaka);
		this.shaka = shaka;
		this.core = new Core$1(config?.core);
		this.segmentManager = new SegmentManager(this.streamInfo, this.core);
	}
	/**
	* Configures and initializes the Shaka Player instance with predefined settings optimized for P2P performance.
	*
	* @param player The Shaka Player instance to configure.
	*/
	bindShakaPlayer(player) {
		if (this.player === player) return;
		if (this.player) this.destroy();
		this.player = player;
		this.player.configure("manifest.defaultPresentationDelay", LIVE_EDGE_DELAY);
		this.player.configure("manifest.dash.ignoreSuggestedPresentationDelay", true);
		const versionMatch = /\d+/.exec(this.shaka.Player.version);
		if (parseInt(versionMatch ? versionMatch[0] : "0", 10) >= 5) this.player.configure("streaming.preferNativeHls", false);
		else this.player.configure("streaming.useNativeHlsOnSafari", false);
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
		if (dynamicConfig.core) this.core.applyDynamicConfig(dynamicConfig.core);
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
	updatePlayerEventHandlers = (type) => {
		const { player } = this;
		if (!player) return;
		const networkingEngine = player.getNetworkingEngine();
		if (networkingEngine) if (type === "register") {
			const p2pml = {
				player,
				shaka: this.shaka,
				core: this.core,
				streamInfo: this.streamInfo,
				segmentManager: this.segmentManager
			};
			this.requestFilter = (requestType, request) => {
				request.p2pml = p2pml;
			};
			networkingEngine.p2pml = p2pml;
			networkingEngine.registerRequestFilter(this.requestFilter);
		} else {
			networkingEngine.p2pml = void 0;
			if (this.requestFilter) networkingEngine.unregisterRequestFilter(this.requestFilter);
		}
		const method = type === "register" ? "addEventListener" : "removeEventListener";
		player[method]("loaded", this.handlePlayerLoaded);
		player[method]("loading", this.destroyCurrentStreamContext);
		player[method]("unloading", this.handlePlayerUnloading);
		player[method]("adaptation", this.onVariantChanged);
		player[method]("variantchanged", this.onVariantChanged);
	};
	onVariantChanged = () => {
		if (!this.player) return;
		const activeTrack = this.player.getVariantTracks().find((track) => track.active);
		if (!activeTrack) return;
		this.core.setActiveLevelBitrate(activeTrack.bandwidth);
	};
	handlePlayerLoaded = () => {
		if (!this.player) return;
		this.core.setIsLive(this.player.isLive());
		this.updateMediaElementEventHandlers("register");
	};
	handlePlayerUnloading = () => {
		this.destroyCurrentStreamContext();
		this.updateMediaElementEventHandlers("unregister");
	};
	destroyCurrentStreamContext = () => {
		this.streamInfo.protocol = void 0;
		this.streamInfo.manifestResponseUrl = void 0;
		this.core.destroy();
	};
	updateMediaElementEventHandlers = (type) => {
		const media = this.player?.getMediaElement();
		if (!media) return;
		const method = type === "register" ? "addEventListener" : "removeEventListener";
		media[method]("timeupdate", this.handlePlaybackUpdate);
		media[method]("ratechange", this.handlePlaybackUpdate);
		media[method]("seeking", this.handlePlaybackUpdate);
	};
	handlePlaybackUpdate = (event) => {
		const media = event.target;
		this.core.updatePlayback(media.currentTime, media.playbackRate);
	};
	/** Cleans up and releases all resources, and unregisters all event handlers. */
	destroy() {
		this.destroyCurrentStreamContext();
		this.updatePlayerEventHandlers("unregister");
		this.updateMediaElementEventHandlers("unregister");
		this.player = void 0;
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
			const { p2pml } = args[1];
			if (!p2pml) return shaka.net.HttpFetchPlugin.parse(...args);
			return new Loader(p2pml.shaka, p2pml.core, p2pml.streamInfo).load(...args);
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
};
function validateShaka(shaka) {
	if (!shaka) throw new Error("shaka namespace is not defined in global scope and not passed as an argument to Shaka P2P engine constructor");
}
//#endregion
export { Core, ShakaP2PEngine };

//# sourceMappingURL=p2p-media-loader-shaka.es.js.map