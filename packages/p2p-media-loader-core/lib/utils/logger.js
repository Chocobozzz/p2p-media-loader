export function getStreamString(stream) {
    return `${stream.type}-${stream.identityHash}`;
}
export function getSegmentString(segment) {
    const { externalId } = segment;
    return `(${getStreamString(segment.stream)} | ${externalId})`;
}
export function getSegmentPlaybackStatusesString(statuses) {
    const { isHighDemand, isHttpDownloadable, isP2PDownloadable } = statuses;
    if (isHighDemand)
        return "high-demand";
    if (isHttpDownloadable && isP2PDownloadable)
        return "http-p2p-window";
    if (isHttpDownloadable)
        return "http-window";
    if (isP2PDownloadable)
        return "p2p-window";
    return "-";
}
//# sourceMappingURL=logger.js.map