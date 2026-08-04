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
var _P2PLoadersContainer_instances, _P2PLoadersContainer_loaders, _P2PLoadersContainer_currentLoaderItem, _P2PLoadersContainer_logger, _P2PLoadersContainer_requests, _P2PLoadersContainer_segmentStorage, _P2PLoadersContainer_config, _P2PLoadersContainer_webTorrentSocketPool, _P2PLoadersContainer_eventTarget, _P2PLoadersContainer_peerId, _P2PLoadersContainer_onSegmentAnnouncement, _P2PLoadersContainer_createLoader, _P2PLoadersContainer_findOrCreateLoaderForStream, _P2PLoadersContainer_setLoaderDestroyTimeout, _P2PLoadersContainer_destroyAndRemoveLoader;
import { P2PLoader } from "./loader.js";
import debug from "debug";
import * as LoggerUtils from "../utils/logger.js";
export class P2PLoadersContainer {
    constructor(stream, requests, segmentStorage, config, webTorrentSocketPool, eventTarget, peerId, onSegmentAnnouncement) {
        _P2PLoadersContainer_instances.add(this);
        _P2PLoadersContainer_loaders.set(this, new Map());
        _P2PLoadersContainer_currentLoaderItem.set(this, void 0);
        _P2PLoadersContainer_logger.set(this, debug("p2pml-core:p2p-loaders-container"));
        _P2PLoadersContainer_requests.set(this, void 0);
        _P2PLoadersContainer_segmentStorage.set(this, void 0);
        _P2PLoadersContainer_config.set(this, void 0);
        _P2PLoadersContainer_webTorrentSocketPool.set(this, void 0);
        _P2PLoadersContainer_eventTarget.set(this, void 0);
        _P2PLoadersContainer_peerId.set(this, void 0);
        _P2PLoadersContainer_onSegmentAnnouncement.set(this, void 0);
        __classPrivateFieldSet(this, _P2PLoadersContainer_requests, requests, "f");
        __classPrivateFieldSet(this, _P2PLoadersContainer_segmentStorage, segmentStorage, "f");
        __classPrivateFieldSet(this, _P2PLoadersContainer_config, config, "f");
        __classPrivateFieldSet(this, _P2PLoadersContainer_webTorrentSocketPool, webTorrentSocketPool, "f");
        __classPrivateFieldSet(this, _P2PLoadersContainer_eventTarget, eventTarget, "f");
        __classPrivateFieldSet(this, _P2PLoadersContainer_peerId, peerId, "f");
        __classPrivateFieldSet(this, _P2PLoadersContainer_onSegmentAnnouncement, onSegmentAnnouncement, "f");
        __classPrivateFieldSet(this, _P2PLoadersContainer_currentLoaderItem, __classPrivateFieldGet(this, _P2PLoadersContainer_instances, "m", _P2PLoadersContainer_findOrCreateLoaderForStream).call(this, stream), "f");
        __classPrivateFieldGet(this, _P2PLoadersContainer_logger, "f").call(this, `set current p2p loader: ${LoggerUtils.getStreamString(stream)}`);
    }
    changeCurrentLoader(stream) {
        const currentStream = __classPrivateFieldGet(this, _P2PLoadersContainer_currentLoaderItem, "f").stream;
        const ids = __classPrivateFieldGet(this, _P2PLoadersContainer_segmentStorage, "f").getStoredSegmentIds(currentStream.swarmId, currentStream.streamSwarmId);
        if (!ids.length)
            __classPrivateFieldGet(this, _P2PLoadersContainer_instances, "m", _P2PLoadersContainer_destroyAndRemoveLoader).call(this, __classPrivateFieldGet(this, _P2PLoadersContainer_currentLoaderItem, "f"));
        else
            __classPrivateFieldGet(this, _P2PLoadersContainer_instances, "m", _P2PLoadersContainer_setLoaderDestroyTimeout).call(this, __classPrivateFieldGet(this, _P2PLoadersContainer_currentLoaderItem, "f"));
        __classPrivateFieldSet(this, _P2PLoadersContainer_currentLoaderItem, __classPrivateFieldGet(this, _P2PLoadersContainer_instances, "m", _P2PLoadersContainer_findOrCreateLoaderForStream).call(this, stream), "f");
        __classPrivateFieldGet(this, _P2PLoadersContainer_logger, "f").call(this, `change current p2p loader: ${LoggerUtils.getStreamString(stream)}`);
    }
    get currentLoader() {
        return __classPrivateFieldGet(this, _P2PLoadersContainer_currentLoaderItem, "f").loader;
    }
    destroy() {
        for (const { loader, destroyTimeoutId } of __classPrivateFieldGet(this, _P2PLoadersContainer_loaders, "f").values()) {
            loader.destroy();
            clearTimeout(destroyTimeoutId);
        }
        __classPrivateFieldGet(this, _P2PLoadersContainer_loaders, "f").clear();
    }
}
_P2PLoadersContainer_loaders = new WeakMap(), _P2PLoadersContainer_currentLoaderItem = new WeakMap(), _P2PLoadersContainer_logger = new WeakMap(), _P2PLoadersContainer_requests = new WeakMap(), _P2PLoadersContainer_segmentStorage = new WeakMap(), _P2PLoadersContainer_config = new WeakMap(), _P2PLoadersContainer_webTorrentSocketPool = new WeakMap(), _P2PLoadersContainer_eventTarget = new WeakMap(), _P2PLoadersContainer_peerId = new WeakMap(), _P2PLoadersContainer_onSegmentAnnouncement = new WeakMap(), _P2PLoadersContainer_instances = new WeakSet(), _P2PLoadersContainer_createLoader = function _P2PLoadersContainer_createLoader(stream) {
    if (__classPrivateFieldGet(this, _P2PLoadersContainer_loaders, "f").has(stream.runtimeId)) {
        throw new Error("Loader for this stream already exists");
    }
    const loader = new P2PLoader(stream, __classPrivateFieldGet(this, _P2PLoadersContainer_requests, "f"), __classPrivateFieldGet(this, _P2PLoadersContainer_segmentStorage, "f"), __classPrivateFieldGet(this, _P2PLoadersContainer_config, "f"), __classPrivateFieldGet(this, _P2PLoadersContainer_webTorrentSocketPool, "f"), __classPrivateFieldGet(this, _P2PLoadersContainer_eventTarget, "f"), __classPrivateFieldGet(this, _P2PLoadersContainer_peerId, "f"), () => {
        if (__classPrivateFieldGet(this, _P2PLoadersContainer_currentLoaderItem, "f").loader === loader) {
            __classPrivateFieldGet(this, _P2PLoadersContainer_onSegmentAnnouncement, "f").call(this);
        }
    });
    const loggerInfo = LoggerUtils.getStreamString(stream);
    __classPrivateFieldGet(this, _P2PLoadersContainer_logger, "f").call(this, `created new loader: ${loggerInfo}`);
    return {
        loader,
        stream,
        loggerInfo,
    };
}, _P2PLoadersContainer_findOrCreateLoaderForStream = function _P2PLoadersContainer_findOrCreateLoaderForStream(stream) {
    const loaderItem = __classPrivateFieldGet(this, _P2PLoadersContainer_loaders, "f").get(stream.runtimeId);
    if (loaderItem) {
        clearTimeout(loaderItem.destroyTimeoutId);
        loaderItem.destroyTimeoutId = undefined;
        return loaderItem;
    }
    else {
        const loader = __classPrivateFieldGet(this, _P2PLoadersContainer_instances, "m", _P2PLoadersContainer_createLoader).call(this, stream);
        __classPrivateFieldGet(this, _P2PLoadersContainer_loaders, "f").set(stream.runtimeId, loader);
        return loader;
    }
}, _P2PLoadersContainer_setLoaderDestroyTimeout = function _P2PLoadersContainer_setLoaderDestroyTimeout(item) {
    item.destroyTimeoutId = window.setTimeout(() => __classPrivateFieldGet(this, _P2PLoadersContainer_instances, "m", _P2PLoadersContainer_destroyAndRemoveLoader).call(this, item), __classPrivateFieldGet(this, _P2PLoadersContainer_config, "f").p2pInactiveLoaderDestroyTimeoutMs);
}, _P2PLoadersContainer_destroyAndRemoveLoader = function _P2PLoadersContainer_destroyAndRemoveLoader(item) {
    item.loader.destroy();
    __classPrivateFieldGet(this, _P2PLoadersContainer_loaders, "f").delete(item.stream.runtimeId);
    __classPrivateFieldGet(this, _P2PLoadersContainer_logger, "f").call(this, `destroy p2p loader: `, item.loggerInfo);
};
//# sourceMappingURL=loaders-container.js.map