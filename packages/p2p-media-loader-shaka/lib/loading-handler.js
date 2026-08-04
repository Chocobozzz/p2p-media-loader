var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as Utils from "./stream-utils.js";
import { CoreRequestError, } from "p2p-media-loader-core";
export class Loader {
    constructor(shaka, core, streamInfo) {
        Object.defineProperty(this, "shaka", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: shaka
        });
        Object.defineProperty(this, "core", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: core
        });
        Object.defineProperty(this, "streamInfo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: streamInfo
        });
        Object.defineProperty(this, "loadArgs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    defaultLoad() {
        const fetchPlugin = this.shaka.net.HttpFetchPlugin;
        return fetchPlugin.parse(...this.loadArgs);
    }
    load(...args) {
        this.loadArgs = args;
        const { RequestType } = this.shaka.net.NetworkingEngine;
        const [url, request, requestType] = args;
        if (requestType === RequestType.SEGMENT) {
            return this.loadSegment(url, request);
        }
        const loading = this.defaultLoad();
        if (requestType === RequestType.MANIFEST) {
            // Ordering invariant: this continuation is attached to the manifest
            // promise BEFORE Shaka's parser receives it, so setManifestResponseUrl
            // runs in an earlier microtask than manifest processing — stream
            // registration, which requires a resolvable swarm ID, depends on it.
            // Manifests that bypass the networking engine (e.g. offline playback)
            // never reach this handler; their streams are skipped by the
            // registration guard and play without P2P.
            this.handleManifestLoading(loading.promise).catch(() => undefined);
        }
        return loading;
    }
    handleManifestLoading(loadingPromise) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.streamInfo.manifestResponseUrl) {
                // loading main manifest either HLS or DASH
                const response = yield loadingPromise;
                this.setManifestResponseUrl(response.uri);
            }
        });
    }
    loadSegment(segmentUrl, originalRequest) {
        const byteRangeString = originalRequest.headers.Range;
        const segmentRuntimeId = Utils.getSegmentRuntimeId(segmentUrl, byteRangeString);
        const isSegmentDownloadableByP2PCore = this.core.isSegmentLoadable(segmentRuntimeId);
        if (!this.core.hasSegment(segmentRuntimeId) ||
            !isSegmentDownloadableByP2PCore) {
            return this.defaultLoad();
        }
        const loadSegment = () => __awaiter(this, void 0, void 0, function* () {
            const { request, callbacks } = getSegmentRequest();
            void this.core.loadSegment(segmentRuntimeId, callbacks);
            try {
                const { data, bandwidth } = yield request;
                return {
                    data,
                    headers: {},
                    originalRequest,
                    uri: segmentUrl,
                    originalUri: segmentUrl,
                    timeMs: getLoadingDurationBasedOnBandwidth(bandwidth, data.byteLength),
                };
            }
            catch (error) {
                // TODO: throw Shaka Errors
                if (error instanceof CoreRequestError) {
                    const { Error: ShakaError } = this.shaka.util;
                    if (error.type === "aborted") {
                        throw new ShakaError(ShakaError.Severity.RECOVERABLE, ShakaError.Category.NETWORK, this.shaka.util.Error.Code.OPERATION_ABORTED);
                    }
                }
                throw error;
            }
        });
        return new this.shaka.util.AbortableOperation(loadSegment(), () => {
            this.core.abortSegmentLoading(segmentRuntimeId);
            return Promise.resolve();
        });
    }
    setManifestResponseUrl(responseUrl) {
        this.streamInfo.manifestResponseUrl = responseUrl;
        this.core.setManifestResponseUrl(responseUrl);
    }
}
function getLoadingDurationBasedOnBandwidth(bandwidth, bytesLoaded) {
    const bits = bytesLoaded * 8;
    return bandwidth > 0 ? Math.round(bits / bandwidth) * 1000 : 0;
}
function getSegmentRequest() {
    let onSuccess;
    let onError;
    const request = new Promise((resolve, reject) => {
        onSuccess = resolve;
        onError = reject;
    });
    return {
        request,
        callbacks: {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            onSuccess: onSuccess,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            onError: onError,
        },
    };
}
//# sourceMappingURL=loading-handler.js.map