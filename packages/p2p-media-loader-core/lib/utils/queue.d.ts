import { Playback, SegmentWithStream } from "../internal-types.js";
import { P2PLoader } from "../p2p/loader.js";
import { SegmentPlaybackStatuses, PlaybackTimeWindowsConfig } from "./stream.js";
export type QueueItem = {
    segment: SegmentWithStream;
    statuses: SegmentPlaybackStatuses;
};
export declare function generateQueue(lastRequestedSegment: Readonly<SegmentWithStream>, playback: Readonly<Playback>, playbackConfig: PlaybackTimeWindowsConfig, currentP2PLoader: P2PLoader, availablePercentMemory: number): Generator<QueueItem, void>;
