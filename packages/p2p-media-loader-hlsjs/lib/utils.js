export function getSegmentRuntimeId(segmentRequestUrl, byteRange) {
    if (!byteRange)
        return segmentRequestUrl;
    return `${segmentRequestUrl}|${byteRange.start}-${byteRange.end}`;
}
export function getByteRange(rangeStart, rangeEnd) {
    if (rangeStart !== undefined &&
        rangeEnd !== undefined &&
        rangeStart <= rangeEnd) {
        return { start: rangeStart, end: rangeEnd };
    }
}
//# sourceMappingURL=utils.js.map