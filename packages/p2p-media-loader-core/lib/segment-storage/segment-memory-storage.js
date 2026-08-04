var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import debug from "debug";
import { isAndroid, isIPadOrIPhone, isAndroidWebview, getStorageItemId, } from "./utils.js";
const BYTES_PER_MiB = 1048576;
export class SegmentMemoryStorage {
    constructor() {
        Object.defineProperty(this, "userAgent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: navigator.userAgent
        });
        Object.defineProperty(this, "segmentMemoryStorageLimit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 4 * 1024
        });
        Object.defineProperty(this, "currentStorageUsage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "logger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "coreConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "mainStreamConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "secondaryStreamConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "currentPlayback", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lastRequestedSegment", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "segmentChangeCallback", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.logger = debug("p2pml-core:segment-memory-storage");
        this.logger.color = "RebeccaPurple";
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    initialize(coreConfig, mainStreamConfig, secondaryStreamConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            this.coreConfig = coreConfig;
            this.mainStreamConfig = mainStreamConfig;
            this.secondaryStreamConfig = secondaryStreamConfig;
            this.setMemoryStorageLimit();
            this.logger("initialized");
        });
    }
    onPlaybackUpdated(position, rate) {
        this.currentPlayback = { position, rate };
    }
    onSegmentRequested(swarmId, streamSwarmId, segmentId, startTime, endTime, streamType, isLiveStream) {
        this.lastRequestedSegment = {
            streamSwarmId,
            segmentId,
            startTime,
            endTime,
            swarmId,
            streamType,
            isLiveStream,
        };
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    storeSegment(_swarmId, streamSwarmId, segmentId, data, startTime, endTime, streamType, isLiveStream) {
        return __awaiter(this, void 0, void 0, function* () {
            this.clear(isLiveStream, data.byteLength);
            const storageId = getStorageItemId(streamSwarmId, segmentId);
            this.cache.set(storageId, {
                data,
                segmentId,
                streamSwarmId,
                startTime,
                endTime,
                streamType,
            });
            this.increaseStorageUsage(data.byteLength);
            this.logger(`add segment: ${segmentId} to ${streamSwarmId}`);
            if (!this.segmentChangeCallback) {
                throw new Error("dispatchStorageUpdatedEvent is not set");
            }
            this.segmentChangeCallback(streamSwarmId);
        });
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    getSegmentData(_swarmId, streamSwarmId, segmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const segmentStorageId = getStorageItemId(streamSwarmId, segmentId);
            const dataItem = this.cache.get(segmentStorageId);
            if (dataItem === undefined)
                return undefined;
            return dataItem.data;
        });
    }
    getUsage() {
        if (!this.lastRequestedSegment || !this.currentPlayback) {
            return {
                totalCapacity: this.segmentMemoryStorageLimit,
                usedCapacity: this.currentStorageUsage,
            };
        }
        const playbackPosition = this.currentPlayback.position;
        let calculatedUsedCapacity = 0;
        for (const { endTime, data } of this.cache.values()) {
            if (playbackPosition > endTime)
                continue;
            calculatedUsedCapacity += data.byteLength;
        }
        return {
            totalCapacity: this.segmentMemoryStorageLimit,
            usedCapacity: calculatedUsedCapacity / BYTES_PER_MiB,
        };
    }
    hasSegment(_swarmId, streamSwarmId, externalId) {
        const segmentStorageId = getStorageItemId(streamSwarmId, externalId);
        const segment = this.cache.get(segmentStorageId);
        return segment !== undefined;
    }
    getStoredSegmentIds(_swarmId, streamSwarmId) {
        const externalIds = [];
        for (const { segmentId, streamSwarmId: streamCacheId, } of this.cache.values()) {
            if (streamCacheId !== streamSwarmId)
                continue;
            externalIds.push(segmentId);
        }
        return externalIds;
    }
    clear(isLiveStream, newSegmentSize) {
        if (!this.currentPlayback ||
            !this.mainStreamConfig ||
            !this.secondaryStreamConfig ||
            !this.coreConfig) {
            return;
        }
        const isMemoryLimitReached = this.isMemoryLimitReached(newSegmentSize);
        if (!isMemoryLimitReached && !isLiveStream)
            return;
        const affectedStreams = new Set();
        const sortedCache = Array.from(this.cache.values()).sort((a, b) => a.startTime - b.startTime);
        for (const segmentData of sortedCache) {
            const { streamSwarmId, segmentId, data } = segmentData;
            const storageId = getStorageItemId(streamSwarmId, segmentId);
            const shouldRemove = this.shouldRemoveSegment(segmentData, isLiveStream, this.currentPlayback.position);
            if (!shouldRemove)
                continue;
            this.cache.delete(storageId);
            affectedStreams.add(streamSwarmId);
            this.decreaseStorageUsage(data.byteLength);
            this.logger(`Removed segment ${segmentId} from stream ${streamSwarmId}`);
            if (!this.isMemoryLimitReached(newSegmentSize) && !isLiveStream)
                break;
        }
        this.sendUpdatesToAffectedStreams(affectedStreams);
    }
    isMemoryLimitReached(segmentByteLength) {
        return (this.currentStorageUsage + segmentByteLength / BYTES_PER_MiB >
            this.segmentMemoryStorageLimit);
    }
    setSegmentChangeCallback(callback) {
        this.segmentChangeCallback = callback;
    }
    sendUpdatesToAffectedStreams(affectedStreams) {
        if (affectedStreams.size === 0)
            return;
        affectedStreams.forEach((stream) => {
            if (!this.segmentChangeCallback) {
                throw new Error("dispatchStorageUpdatedEvent is not set");
            }
            this.segmentChangeCallback(stream);
        });
    }
    shouldRemoveSegment(segmentData, isLiveStream, currentPlaybackPosition) {
        const { endTime, streamType } = segmentData;
        const highDemandTimeWindow = this.getStreamTimeWindow(streamType, "highDemandTimeWindow");
        if (currentPlaybackPosition <= endTime)
            return false;
        if (isLiveStream) {
            return currentPlaybackPosition > highDemandTimeWindow + endTime;
        }
        return true;
    }
    increaseStorageUsage(segmentByteLength) {
        this.currentStorageUsage += segmentByteLength / BYTES_PER_MiB;
    }
    decreaseStorageUsage(segmentByteLength) {
        this.currentStorageUsage -= segmentByteLength / BYTES_PER_MiB;
    }
    setMemoryStorageLimit() {
        var _a;
        if ((_a = this.coreConfig) === null || _a === void 0 ? void 0 : _a.segmentMemoryStorageLimit) {
            this.segmentMemoryStorageLimit =
                this.coreConfig.segmentMemoryStorageLimit;
            return;
        }
        if (isAndroidWebview(this.userAgent) || isIPadOrIPhone(this.userAgent)) {
            this.segmentMemoryStorageLimit = 1024;
        }
        else if (isAndroid(this.userAgent)) {
            this.segmentMemoryStorageLimit = 2 * 1024;
        }
    }
    getStreamTimeWindow(streamType, configKey) {
        var _a;
        const config = streamType === "main"
            ? this.mainStreamConfig
            : this.secondaryStreamConfig;
        return (_a = config === null || config === void 0 ? void 0 : config[configKey]) !== null && _a !== void 0 ? _a : 0;
    }
    destroy() {
        this.cache.clear();
        this.segmentChangeCallback = undefined;
    }
}
//# sourceMappingURL=segment-memory-storage.js.map