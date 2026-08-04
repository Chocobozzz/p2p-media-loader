export function getSegmentFromStreamsMap(streams, segmentRuntimeId) {
    for (const stream of streams.values()) {
        const segment = stream.segments.get(segmentRuntimeId);
        if (segment)
            return segment;
    }
}
export function getSegmentFromStreamByExternalId(stream, segmentExternalId) {
    for (const segment of stream.segments.values()) {
        if (segment.externalId === segmentExternalId)
            return segment;
    }
}
export function getSegmentAvgDuration(stream) {
    const { segments } = stream;
    let sumDuration = 0;
    const { size } = segments;
    if (size === 0)
        return 0;
    for (const segment of segments.values()) {
        const duration = segment.endTime - segment.startTime;
        sumDuration += duration;
    }
    return sumDuration / size;
}
function calculateTimeWindows(timeWindowsConfig, availableMemoryInPercent) {
    const { highDemandTimeWindow, httpDownloadTimeWindow, p2pDownloadTimeWindow, } = timeWindowsConfig;
    const result = {
        highDemandTimeWindow,
        httpDownloadTimeWindow,
        p2pDownloadTimeWindow,
    };
    if (availableMemoryInPercent <= 5) {
        result.httpDownloadTimeWindow = 0;
        result.p2pDownloadTimeWindow = 0;
    }
    else if (availableMemoryInPercent <= 10) {
        result.p2pDownloadTimeWindow = result.httpDownloadTimeWindow;
    }
    return result;
}
export function getSegmentPlaybackStatuses(segment, playback, timeWindowsConfig, currentP2PLoader, availableMemoryPercent) {
    const { highDemandTimeWindow, httpDownloadTimeWindow, p2pDownloadTimeWindow, } = calculateTimeWindows(timeWindowsConfig, availableMemoryPercent);
    return {
        isHighDemand: isSegmentInTimeWindow(segment, playback, highDemandTimeWindow),
        isHttpDownloadable: isSegmentInTimeWindow(segment, playback, httpDownloadTimeWindow),
        isP2PDownloadable: isSegmentInTimeWindow(segment, playback, p2pDownloadTimeWindow) &&
            currentP2PLoader.isSegmentLoadingOrLoadedBySomeone(segment),
    };
}
function isSegmentInTimeWindow(segment, playback, timeWindowLength) {
    const { startTime, endTime } = segment;
    const { position, rate } = playback;
    const rightMargin = position + timeWindowLength * rate;
    return !(rightMargin < startTime || position > endTime);
}
//# sourceMappingURL=stream.js.map