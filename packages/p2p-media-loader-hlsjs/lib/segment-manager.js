import * as Utils from "./utils.js";
import { debug, } from "p2p-media-loader-core";
import { getAudioStreamProperties, getVideoStreamProperties, } from "./stream-properties.js";
export class SegmentManager {
    constructor(core) {
        Object.defineProperty(this, "core", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "logger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: debug("p2pml-hlsjs:segment-manager")
        });
        this.core = core;
    }
    processMainManifest(data) {
        const { levels, audioTracks } = data;
        // in the case of audio only stream it is stored in levels
        for (const level of levels) {
            const { url } = level;
            this.addStream({
                runtimeId: Array.isArray(url) ? url[0] : url,
                type: "main",
                properties: getVideoStreamProperties(level),
            });
        }
        for (const track of audioTracks) {
            const { url } = track;
            this.addStream({
                runtimeId: Array.isArray(url) ? url[0] : url,
                type: "secondary",
                properties: getAudioStreamProperties(track),
            });
        }
    }
    addStream(stream) {
        // Isolate per-stream registration failures: this method runs inside
        // hls.js event dispatch, so a throw would abort manifest processing.
        // A stream that fails to register stays unknown to the core and its
        // segments load through the default hls.js loader without P2P.
        try {
            this.core.addStreamIfNoneExists(stream);
        }
        catch (error) {
            this.logger(`failed to register stream ${stream.runtimeId}:`, error);
        }
    }
    updatePlaylist(data) {
        const { details: { url, fragments, live }, } = data;
        const registeredSegmentIds = this.core.getStreamSegmentRuntimeIds(url);
        if (!registeredSegmentIds)
            return;
        const segmentToRemoveIds = new Set(registeredSegmentIds);
        const newSegments = [];
        fragments.forEach((fragment, index) => {
            const { url: responseUrl, byteRange: fragByteRange, sn, start: startTime, end: endTime, } = fragment;
            const [start, end] = fragByteRange;
            const byteRange = Utils.getByteRange(start, end !== undefined ? end - 1 : undefined);
            const runtimeId = Utils.getSegmentRuntimeId(responseUrl, byteRange);
            segmentToRemoveIds.delete(runtimeId);
            if (registeredSegmentIds.has(runtimeId))
                return;
            newSegments.push({
                runtimeId,
                url: responseUrl,
                externalId: live ? sn : index,
                byteRange,
                startTime,
                endTime,
            });
        });
        if (!newSegments.length && !segmentToRemoveIds.size)
            return;
        this.core.updateStream(url, newSegments, segmentToRemoveIds.values());
    }
}
//# sourceMappingURL=segment-manager.js.map