export function createSegment({ segmentReference, externalId, runtimeId, }) {
    const { byteRange, url, startTime, endTime } = getSegmentInfoFromReference(segmentReference);
    return {
        runtimeId: runtimeId !== null && runtimeId !== void 0 ? runtimeId : getSegmentRuntimeId(url, byteRange),
        externalId,
        byteRange,
        url,
        startTime,
        endTime,
    };
}
export function getSegmentRuntimeIdFromReference(segmentReference) {
    const { url, byteRange } = getSegmentInfoFromReference(segmentReference);
    return getSegmentRuntimeId(url, byteRange);
}
export function getSegmentRuntimeId(url, byteRange) {
    if (!byteRange)
        return url;
    const range = typeof byteRange === "string"
        ? getByteRangeFromHeaderString(byteRange)
        : byteRange;
    if (!range)
        return url;
    return `${url}|${range.start}-${range.end}`;
}
export function getByteRangeFromHeaderString(rangeStr) {
    if (!(rangeStr === null || rangeStr === void 0 ? void 0 : rangeStr.includes("bytes=")))
        return undefined;
    const parts = rangeStr.split("=")[1].split("-");
    const start = parseInt(parts[0]);
    const end = parseInt(parts[1]);
    if (isNaN(start) || isNaN(end))
        return undefined;
    return { start, end };
}
export function getSegmentInfoFromReference(segmentReference) {
    var _a, _b;
    const uris = segmentReference.getUris();
    const responseUrl = (_a = uris[1]) !== null && _a !== void 0 ? _a : uris[0];
    const start = segmentReference.getStartByte();
    const end = (_b = segmentReference.getEndByte()) !== null && _b !== void 0 ? _b : undefined;
    const startTime = segmentReference.getStartTime();
    const endTime = segmentReference.getEndTime();
    return {
        byteRange: end !== undefined ? { start, end } : undefined,
        url: responseUrl,
        startTime,
        endTime,
    };
}
export function getStreamLastMediaSequence(stream) {
    const { shakaStream } = stream;
    const map = shakaStream.mediaSequenceTimeMap;
    if (!map)
        return;
    const firstMediaSequence = map.keys().next().value;
    if (firstMediaSequence === undefined)
        return;
    return firstMediaSequence + map.size - 1;
}
//# sourceMappingURL=stream-utils.js.map