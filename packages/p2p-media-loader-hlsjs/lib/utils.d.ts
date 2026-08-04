import { ByteRange } from "p2p-media-loader-core";
export declare function getSegmentRuntimeId(segmentRequestUrl: string, byteRange?: ByteRange): string;
export declare function getByteRange(rangeStart: number | undefined, rangeEnd: number | undefined): ByteRange | undefined;
