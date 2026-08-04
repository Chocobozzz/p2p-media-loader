import * as Utils from "./stream-utils.js";
// The minimum time interval (in seconds) between segments to assign unique IDs.
// If two segments in the same playlist start within a time frame shorter than this interval,
// they risk being assigned the same ID.
// Such overlapping IDs can lead to potential conflicts or issues in segment processing.
const SEGMENT_ID_RESOLUTION_IN_SECONDS = 0.5;
export class SegmentManager {
    constructor(streamInfo, core) {
        Object.defineProperty(this, "core", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "streamInfo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.core = core;
        this.streamInfo = streamInfo;
    }
    setStream(shakaStream, type, properties) {
        this.core.addStreamIfNoneExists({
            runtimeId: shakaStream.id.toString(),
            type,
            properties,
            shakaStream,
        });
        if (shakaStream.segmentIndex)
            this.updateStreamSegments(shakaStream);
    }
    updateStreamSegments(shakaStream, segmentReferences) {
        const stream = this.core.getStream(shakaStream.id.toString());
        if (!stream)
            return;
        const registeredSegmentIds = this.core.getStreamSegmentRuntimeIds(stream.runtimeId);
        if (!registeredSegmentIds)
            return;
        const { segmentIndex } = stream.shakaStream;
        if (!segmentReferences && segmentIndex) {
            try {
                segmentReferences = [...segmentIndex].filter((ref) => !!ref);
            }
            catch (_a) {
                return;
            }
        }
        if (!segmentReferences)
            return;
        if (this.streamInfo.protocol === "hls") {
            this.processHlsSegmentReferences(stream, registeredSegmentIds, segmentReferences);
        }
        else {
            this.processDashSegmentReferences(stream, registeredSegmentIds, segmentReferences);
        }
    }
    processDashSegmentReferences(managerStream, registeredSegmentIds, segmentReferences) {
        const staleSegmentsIds = new Set(registeredSegmentIds);
        const newSegments = [];
        for (const reference of segmentReferences) {
            const externalId = Math.trunc(reference.getStartTime() / SEGMENT_ID_RESOLUTION_IN_SECONDS);
            const runtimeId = Utils.getSegmentRuntimeIdFromReference(reference);
            if (!registeredSegmentIds.has(runtimeId)) {
                const segment = Utils.createSegment({
                    segmentReference: reference,
                    externalId,
                    runtimeId,
                });
                newSegments.push(segment);
            }
            staleSegmentsIds.delete(runtimeId);
        }
        if (!newSegments.length && !staleSegmentsIds.size)
            return;
        this.core.updateStream(managerStream.runtimeId, newSegments, staleSegmentsIds.values());
    }
    processHlsSegmentReferences(managerStream, registeredSegmentIds, segmentReferences) {
        const lastMediaSequence = Utils.getStreamLastMediaSequence(managerStream);
        const newSegments = [];
        if (registeredSegmentIds.size === 0) {
            const firstReferenceMediaSequence = lastMediaSequence === undefined
                ? 0
                : lastMediaSequence - segmentReferences.length + 1;
            for (const [index, reference] of segmentReferences.entries()) {
                const segment = Utils.createSegment({
                    segmentReference: reference,
                    externalId: firstReferenceMediaSequence + index,
                });
                newSegments.push(segment);
            }
            this.core.updateStream(managerStream.runtimeId, newSegments);
            return;
        }
        if (lastMediaSequence === undefined)
            return;
        let mediaSequence = lastMediaSequence;
        for (const reference of itemsBackwards(segmentReferences)) {
            const runtimeId = Utils.getSegmentRuntimeIdFromReference(reference);
            if (registeredSegmentIds.has(runtimeId))
                break;
            const segment = Utils.createSegment({
                runtimeId,
                segmentReference: reference,
                externalId: mediaSequence,
            });
            newSegments.push(segment);
            mediaSequence--;
        }
        newSegments.reverse();
        const staleSegmentIds = [];
        const countToDelete = newSegments.length;
        // Segments register in manifest order and live updates only append at the
        // tail, so iteration order is chronological and the first N registered IDs
        // are the oldest segments — the ones that slid out of the live window.
        // Playback position never affects registration: the hooked segmentIndex
        // always reports the full window, and seeking within it is deduplicated
        // upstream. (If a refresh shares no segments with the registry — e.g.
        // after a very long stall — this deletes only as many old segments as
        // arrived, matching the pre-v4 behavior.)
        for (const runtimeId of registeredSegmentIds) {
            if (staleSegmentIds.length >= countToDelete)
                break;
            staleSegmentIds.push(runtimeId);
        }
        if (!newSegments.length && !staleSegmentIds.length)
            return;
        this.core.updateStream(managerStream.runtimeId, newSegments, staleSegmentIds);
    }
}
function* itemsBackwards(items) {
    for (let i = items.length - 1; i >= 0; i--)
        yield items[i];
}
//# sourceMappingURL=segment-manager.js.map