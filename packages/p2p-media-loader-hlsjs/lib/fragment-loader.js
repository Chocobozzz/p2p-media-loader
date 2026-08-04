var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _FragmentLoaderBase_instances, _FragmentLoaderBase_callbacks, _FragmentLoaderBase_createDefaultLoader, _FragmentLoaderBase_defaultLoader, _FragmentLoaderBase_core, _FragmentLoaderBase_response, _FragmentLoaderBase_segmentId, _FragmentLoaderBase_handleError, _FragmentLoaderBase_abortInternal;
import * as Utils from "./utils.js";
import { CoreRequestError } from "p2p-media-loader-core";
const DEFAULT_DOWNLOAD_LATENCY = 10;
export class FragmentLoaderBase {
    constructor(config, core) {
        _FragmentLoaderBase_instances.add(this);
        Object.defineProperty(this, "context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "stats", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        _FragmentLoaderBase_callbacks.set(this, void 0);
        _FragmentLoaderBase_createDefaultLoader.set(this, void 0);
        _FragmentLoaderBase_defaultLoader.set(this, void 0);
        _FragmentLoaderBase_core.set(this, void 0);
        _FragmentLoaderBase_response.set(this, void 0);
        _FragmentLoaderBase_segmentId.set(this, void 0);
        __classPrivateFieldSet(this, _FragmentLoaderBase_core, core, "f");
        __classPrivateFieldSet(this, _FragmentLoaderBase_createDefaultLoader, () => new config.loader(config), "f");
        this.stats = {
            aborted: false,
            chunkCount: 0,
            loading: { start: 0, first: 0, end: 0 },
            buffering: { start: 0, first: 0, end: 0 },
            parsing: { start: 0, end: 0 },
            // set total and loaded to 1 to prevent hls.js
            // on progress loading monitoring in AbrController
            total: 1,
            loaded: 1,
            bwEstimate: 0,
            retry: 0,
        };
    }
    load(context, config, callbacks) {
        this.context = context;
        this.config = config;
        __classPrivateFieldSet(this, _FragmentLoaderBase_callbacks, callbacks, "f");
        const { stats } = this;
        const { rangeStart: start, rangeEnd: end } = context;
        const byteRange = Utils.getByteRange(start, end !== undefined ? end - 1 : undefined);
        __classPrivateFieldSet(this, _FragmentLoaderBase_segmentId, Utils.getSegmentRuntimeId(context.url, byteRange), "f");
        const isSegmentDownloadableByP2PCore = __classPrivateFieldGet(this, _FragmentLoaderBase_core, "f").isSegmentLoadable(__classPrivateFieldGet(this, _FragmentLoaderBase_segmentId, "f"));
        if (!__classPrivateFieldGet(this, _FragmentLoaderBase_core, "f").hasSegment(__classPrivateFieldGet(this, _FragmentLoaderBase_segmentId, "f")) ||
            !isSegmentDownloadableByP2PCore) {
            __classPrivateFieldSet(this, _FragmentLoaderBase_defaultLoader, __classPrivateFieldGet(this, _FragmentLoaderBase_createDefaultLoader, "f").call(this), "f");
            __classPrivateFieldGet(this, _FragmentLoaderBase_defaultLoader, "f").stats = this.stats;
            __classPrivateFieldGet(this, _FragmentLoaderBase_defaultLoader, "f").load(context, config, callbacks);
            return;
        }
        const onSuccess = (response) => {
            if (!__classPrivateFieldGet(this, _FragmentLoaderBase_callbacks, "f"))
                return;
            __classPrivateFieldSet(this, _FragmentLoaderBase_response, response, "f");
            const loadedBytes = __classPrivateFieldGet(this, _FragmentLoaderBase_response, "f").data.byteLength;
            stats.loading = getLoadingStat(__classPrivateFieldGet(this, _FragmentLoaderBase_response, "f").bandwidth, loadedBytes, performance.now());
            stats.total = loadedBytes;
            stats.loaded = loadedBytes;
            // hls.js transfers the ArrayBuffer to a Web Worker for transmuxing, which
            // detaches the ArrayBuffer and sets its byteLength to 0. We clone it here
            // to keep our cached ArrayBuffer intact for seeding to other peers.
            const engineData = __classPrivateFieldGet(this, _FragmentLoaderBase_response, "f").data.slice(0);
            if (__classPrivateFieldGet(this, _FragmentLoaderBase_callbacks, "f").onProgress) {
                __classPrivateFieldGet(this, _FragmentLoaderBase_callbacks, "f").onProgress(this.stats, context, engineData, undefined);
            }
            __classPrivateFieldGet(this, _FragmentLoaderBase_callbacks, "f").onSuccess({ data: engineData, url: context.url }, this.stats, context, undefined);
        };
        const onError = (error) => {
            if (error instanceof CoreRequestError &&
                error.type === "aborted" &&
                this.stats.aborted) {
                return;
            }
            __classPrivateFieldGet(this, _FragmentLoaderBase_instances, "m", _FragmentLoaderBase_handleError).call(this, error);
        };
        void __classPrivateFieldGet(this, _FragmentLoaderBase_core, "f").loadSegment(__classPrivateFieldGet(this, _FragmentLoaderBase_segmentId, "f"), { onSuccess, onError });
    }
    abort() {
        var _a, _b;
        if (__classPrivateFieldGet(this, _FragmentLoaderBase_defaultLoader, "f")) {
            __classPrivateFieldGet(this, _FragmentLoaderBase_defaultLoader, "f").abort();
        }
        else {
            __classPrivateFieldGet(this, _FragmentLoaderBase_instances, "m", _FragmentLoaderBase_abortInternal).call(this);
            (_b = (_a = __classPrivateFieldGet(this, _FragmentLoaderBase_callbacks, "f")) === null || _a === void 0 ? void 0 : _a.onAbort) === null || _b === void 0 ? void 0 : _b.call(_a, this.stats, this.context, {});
        }
    }
    destroy() {
        if (__classPrivateFieldGet(this, _FragmentLoaderBase_defaultLoader, "f")) {
            __classPrivateFieldGet(this, _FragmentLoaderBase_defaultLoader, "f").destroy();
        }
        else {
            if (!this.stats.aborted)
                __classPrivateFieldGet(this, _FragmentLoaderBase_instances, "m", _FragmentLoaderBase_abortInternal).call(this);
            __classPrivateFieldSet(this, _FragmentLoaderBase_callbacks, null, "f");
            this.config = null;
        }
    }
}
_FragmentLoaderBase_callbacks = new WeakMap(), _FragmentLoaderBase_createDefaultLoader = new WeakMap(), _FragmentLoaderBase_defaultLoader = new WeakMap(), _FragmentLoaderBase_core = new WeakMap(), _FragmentLoaderBase_response = new WeakMap(), _FragmentLoaderBase_segmentId = new WeakMap(), _FragmentLoaderBase_instances = new WeakSet(), _FragmentLoaderBase_handleError = function _FragmentLoaderBase_handleError(thrownError) {
    var _a;
    const error = { code: 0, text: "" };
    if (thrownError instanceof CoreRequestError &&
        thrownError.type === "failed") {
        // error.code = thrownError.code;
        error.text = thrownError.message;
    }
    else if (thrownError instanceof Error) {
        error.text = thrownError.message;
    }
    (_a = __classPrivateFieldGet(this, _FragmentLoaderBase_callbacks, "f")) === null || _a === void 0 ? void 0 : _a.onError(error, this.context, null, this.stats);
}, _FragmentLoaderBase_abortInternal = function _FragmentLoaderBase_abortInternal() {
    if (!__classPrivateFieldGet(this, _FragmentLoaderBase_response, "f") && __classPrivateFieldGet(this, _FragmentLoaderBase_segmentId, "f")) {
        this.stats.aborted = true;
        __classPrivateFieldGet(this, _FragmentLoaderBase_core, "f").abortSegmentLoading(__classPrivateFieldGet(this, _FragmentLoaderBase_segmentId, "f"));
    }
};
function getLoadingStat(targetBitrate, loadedBytes, loadingEndTime) {
    const timeForLoading = targetBitrate > 0 ? (loadedBytes * 8000) / targetBitrate : 0;
    const first = Math.max(0, loadingEndTime - timeForLoading);
    const start = Math.max(0, first - DEFAULT_DOWNLOAD_LATENCY);
    return { start, first, end: loadingEndTime };
}
//# sourceMappingURL=fragment-loader.js.map