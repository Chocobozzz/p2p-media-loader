var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { debug } from "p2p-media-loader-core";
import { getAudioStreamProperties, getVideoStreamProperties, } from "./stream-properties.js";
export class ManifestParserDecorator {
    constructor(shaka, originalManifestParser) {
        Object.defineProperty(this, "shaka", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: shaka
        });
        Object.defineProperty(this, "originalManifestParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: originalManifestParser
        });
        Object.defineProperty(this, "debug", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: debug("p2pml-shaka:manifest-parser")
        });
        Object.defineProperty(this, "isHls", {
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
        Object.defineProperty(this, "player", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
        if (!p2pml)
            return;
        this.segmentManager = p2pml.segmentManager;
        this.player = p2pml.player;
        p2pml.streamInfo.protocol = this.isHls ? "hls" : "dash";
    }
    start(uri, playerInterface) {
        return __awaiter(this, void 0, void 0, function* () {
            const { p2pml } = playerInterface.networkingEngine;
            this.setP2PMediaLoaderData(p2pml);
            const manifest = yield this.originalManifestParser.start(uri, playerInterface);
            if (!p2pml)
                return manifest;
            if (this.isHls) {
                this.hookHlsStreamMediaSequenceTimeMaps(manifest.variants);
            }
            this.processStreams(manifest.variants);
            return manifest;
        });
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
        if (!segmentManager)
            return;
        const processedStreams = new Set();
        const processStream = (stream, type, properties) => {
            // Isolate per-stream registration failures: this method runs inside
            // the Shaka manifest parser, so a throw would abort manifest loading.
            // A stream that fails to register stays unknown to the core and its
            // segments load through the default fetch plugin without P2P.
            try {
                this.hookSegmentIndex(stream);
                segmentManager.setStream(stream, type, properties);
            }
            catch (error) {
                this.debug(`failed to register stream ${stream.id}:`, error);
            }
            processedStreams.add(stream.id);
            return true;
        };
        for (const variant of variants) {
            const { video, audio } = variant;
            if (video && !processedStreams.has(video.id)) {
                processStream(video, "main", getVideoStreamProperties(variant, video));
            }
            if (audio && !processedStreams.has(audio.id)) {
                const isMain = !video; // audio-only master playlist variants
                processStream(audio, isMain ? "main" : "secondary", getAudioStreamProperties(variant, audio, isMain));
            }
        }
    }
    hookSegmentIndex(stream) {
        const { segmentManager } = this;
        if (!segmentManager)
            return;
        const substituteSegmentIndexGet = (segmentIndex, callFromCreateSegmentIndexMethod = false) => {
            let prevReference = null;
            let prevFirstItemReference;
            let prevLastItemReference;
            // eslint-disable-next-line @typescript-eslint/unbound-method
            const originalGet = segmentIndex.get;
            const customGet = (position) => {
                var _a, _b;
                const reference = originalGet.call(segmentIndex, position);
                if (reference === prevReference ||
                    (!((_a = this.player) === null || _a === void 0 ? void 0 : _a.isLive()) && stream.isSegmentIndexAlreadyRead)) {
                    return reference;
                }
                prevReference = reference;
                segmentIndex.get = originalGet;
                try {
                    const references = getReferencesArray(segmentIndex, this.shaka);
                    if (!references) {
                        throw new Error("Segment references not found");
                    }
                    const firstItemReference = references[0];
                    const lastItemReference = references[references.length - 1];
                    if (firstItemReference === prevFirstItemReference &&
                        lastItemReference === prevLastItemReference) {
                        return reference;
                    }
                    prevFirstItemReference = firstItemReference;
                    prevLastItemReference = lastItemReference;
                    // Segment index have been updated
                    segmentManager.updateStreamSegments(stream, references);
                    stream.isSegmentIndexAlreadyRead = true;
                    this.debug(`Stream ${stream.id} is updated`);
                }
                catch (_c) {
                    // Ignore an error when segmentIndex inner array is empty
                }
                finally {
                    // Do not set custom get again if the segment index is already read and the stream is VOD
                    if (!stream.isSegmentIndexAlreadyRead ||
                        !!((_b = this.player) === null || _b === void 0 ? void 0 : _b.isLive()) ||
                        !callFromCreateSegmentIndexMethod) {
                        segmentIndex.get = customGet;
                    }
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
        stream.createSegmentIndex = () => __awaiter(this, void 0, void 0, function* () {
            const result = yield createSegmentIndexOriginal.call(stream);
            if (stream.segmentIndex) {
                substituteSegmentIndexGet(stream.segmentIndex, true);
            }
            return result;
        });
    }
    hookHlsStreamMediaSequenceTimeMaps(variants) {
        var _a;
        const maps = getMapPropertiesFromObject(this.originalManifestParser);
        // For version 4.3 and above
        let videoMap;
        let audioMap;
        const keysToCheck = ["video", "audio", "text", "image"];
        for (const map of maps) {
            if (!keysToCheck.every((key) => map.has(key)))
                continue;
            videoMap = map.get("video");
            audioMap = map.get("audio");
        }
        if (videoMap && audioMap) {
            for (const variant of variants) {
                const { video: videoStream, audio: audioStream } = variant;
                if (videoStream) {
                    videoStream.mediaSequenceTimeMap = videoMap;
                }
                if (audioStream) {
                    audioStream.mediaSequenceTimeMap = audioMap;
                }
            }
            return;
        }
        // For version 4.2; Retrieving mediaSequence map for each HLS playlist
        const manifestVariantsMap = maps.find((map) => {
            var _a;
            const item = map.values().next().value;
            return (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            typeof item === "object" && ((_a = item === null || item === void 0 ? void 0 : item.streams) === null || _a === void 0 ? void 0 : _a.createSegmentIndex));
        });
        if (!manifestVariantsMap)
            return;
        const manifestVariantMapValues = [...manifestVariantsMap.values()];
        for (const variant of manifestVariantMapValues) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            if ((_a = variant === null || variant === void 0 ? void 0 : variant.stream) === null || _a === void 0 ? void 0 : _a.mediaSequenceTimeMap)
                continue;
            const mediaSequenceTimeMap = getMapPropertiesFromObject(variant).find((map) => {
                var _a;
                const [key, value] = (_a = map.entries().next().value) !== null && _a !== void 0 ? _a : [];
                return typeof key === "number" && typeof value === "number";
            });
            if (!mediaSequenceTimeMap)
                continue;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            variant.stream.mediaSequenceTimeMap =
                mediaSequenceTimeMap;
        }
    }
}
export class HlsManifestParser extends ManifestParserDecorator {
    constructor(shaka) {
        super(shaka, new shaka.hls.HlsParser());
    }
}
export class DashManifestParser extends ManifestParserDecorator {
    constructor(shaka) {
        super(shaka, new shaka.dash.DashParser());
    }
}
function getReferencesArray(obj, shaka) {
    for (const key in obj) {
        if (Array.isArray(obj[key]) &&
            obj[key].length > 0 &&
            obj[key][0] instanceof shaka.media.SegmentReference) {
            return obj[key];
        }
        else if (typeof obj[key] === "object") {
            const references = getReferencesArray(obj[key], shaka);
            if (references)
                return references;
        }
    }
    return null;
}
function getMapPropertiesFromObject(object) {
    // TODO: rewrite to Object.values once the project is migrated to ES2017+
    return Object.keys(object)
        .map((key) => object[key])
        .filter((property) => property instanceof Map);
}
//# sourceMappingURL=manifest-parser-decorator.js.map