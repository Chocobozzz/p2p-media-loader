import type shaka from "shaka-player/dist/shaka-player.compiled.d.ts";
import { Stream } from "./types.js";
import { Segment, ByteRange } from "p2p-media-loader-core";
export declare function createSegment({ segmentReference, externalId, runtimeId, }: {
    segmentReference: shaka.media.SegmentReference;
    externalId: number;
    runtimeId?: string;
}): Segment;
export declare function getSegmentRuntimeIdFromReference(segmentReference: shaka.media.SegmentReference): string;
export declare function getSegmentRuntimeId(url: string, byteRange?: ByteRange | string): string;
export declare function getByteRangeFromHeaderString(rangeStr: string | undefined): ByteRange | undefined;
export declare function getSegmentInfoFromReference(segmentReference: shaka.media.SegmentReference): {
    byteRange: {
        start: number;
        end: number;
    } | undefined;
    url: string;
    startTime: number;
    endTime: number;
};
export declare function getStreamLastMediaSequence(stream: Stream): number | undefined;
