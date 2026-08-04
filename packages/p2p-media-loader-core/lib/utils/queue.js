import { getSegmentPlaybackStatuses, } from "./stream.js";
export function* generateQueue(lastRequestedSegment, playback, playbackConfig, currentP2PLoader, availablePercentMemory) {
    const { runtimeId, stream } = lastRequestedSegment;
    const requestedSegment = stream.segments.get(runtimeId);
    if (!requestedSegment)
        return;
    const queueSegments = stream.segments.values();
    let first;
    do {
        const next = queueSegments.next();
        if (next.done)
            return; // should never happen
        first = next.value;
    } while (first !== requestedSegment);
    const firstStatuses = getSegmentPlaybackStatuses(first, playback, playbackConfig, currentP2PLoader, availablePercentMemory);
    if (isNotActualStatuses(firstStatuses)) {
        const next = queueSegments.next();
        // for cases when engine requests segment that is a little bit
        // earlier than current playhead position
        // it could happen when playhead position is significantly changed by user
        if (next.done)
            return;
        const second = next.value;
        const secondStatuses = getSegmentPlaybackStatuses(second, playback, playbackConfig, currentP2PLoader, availablePercentMemory);
        if (isNotActualStatuses(secondStatuses))
            return;
        firstStatuses.isHighDemand = true;
        yield { segment: first, statuses: firstStatuses };
        yield { segment: second, statuses: secondStatuses };
    }
    else {
        yield { segment: first, statuses: firstStatuses };
    }
    for (const segment of queueSegments) {
        const statuses = getSegmentPlaybackStatuses(segment, playback, playbackConfig, currentP2PLoader, availablePercentMemory);
        if (isNotActualStatuses(statuses))
            break;
        yield { segment, statuses };
    }
}
function isNotActualStatuses(statuses) {
    const { isHighDemand, isHttpDownloadable, isP2PDownloadable } = statuses;
    return !isHighDemand && !isHttpDownloadable && !isP2PDownloadable;
}
//# sourceMappingURL=queue.js.map