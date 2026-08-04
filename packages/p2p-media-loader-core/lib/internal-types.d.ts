import { BandwidthCalculator } from "./bandwidth-calculator.js";
import { Segment, Stream } from "./types.js";
export type Playback = {
    position: number;
    rate: number;
};
/** Extends a Segment with a reference to its associated stream. */
export type SegmentWithStream<TStream extends Stream = Stream> = Segment & {
    readonly stream: StreamWithSegments<TStream>;
};
/**
 * A registered stream together with the core's live segment registry.
 * Internal: the public API exposes only the base stream (`Core.getStream`)
 * and a snapshot of the segment runtime IDs
 * (`Core.getStreamSegmentRuntimeIds`).
 */
export type StreamWithSegments<TStream extends Stream = Stream> = TStream & {
    readonly segments: Map<string, SegmentWithStream<TStream>>;
};
export type BandwidthCalculators = Readonly<{
    all: BandwidthCalculator;
    http: BandwidthCalculator;
}>;
export type StreamDetails = {
    isLive: boolean;
    activeLevelBitrate: number;
};
