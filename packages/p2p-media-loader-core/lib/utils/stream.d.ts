import { StreamConfig } from "../types.js";
import { Playback, SegmentWithStream, StreamWithSegments } from "../internal-types.js";
import { P2PLoader } from "../p2p/loader.js";
export type SegmentPlaybackStatuses = {
    isHighDemand: boolean;
    isHttpDownloadable: boolean;
    isP2PDownloadable: boolean;
};
export type PlaybackTimeWindowsConfig = Pick<StreamConfig, "highDemandTimeWindow" | "httpDownloadTimeWindow" | "p2pDownloadTimeWindow">;
export declare function getSegmentFromStreamsMap(streams: Map<string, StreamWithSegments>, segmentRuntimeId: string): SegmentWithStream | undefined;
export declare function getSegmentFromStreamByExternalId(stream: StreamWithSegments, segmentExternalId: number): SegmentWithStream | undefined;
export declare function getSegmentAvgDuration(stream: StreamWithSegments): number;
export declare function getSegmentPlaybackStatuses(segment: SegmentWithStream, playback: Playback, timeWindowsConfig: PlaybackTimeWindowsConfig, currentP2PLoader: P2PLoader, availableMemoryPercent: number): SegmentPlaybackStatuses;
