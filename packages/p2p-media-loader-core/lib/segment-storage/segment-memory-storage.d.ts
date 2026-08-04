import { CommonCoreConfig, StreamConfig, StreamType } from "../types.js";
import { SegmentStorage } from "./index.js";
export declare class SegmentMemoryStorage implements SegmentStorage {
    private readonly userAgent;
    private segmentMemoryStorageLimit;
    private currentStorageUsage;
    private cache;
    private readonly logger;
    private coreConfig?;
    private mainStreamConfig?;
    private secondaryStreamConfig?;
    private currentPlayback?;
    private lastRequestedSegment?;
    private segmentChangeCallback?;
    constructor();
    initialize(coreConfig: CommonCoreConfig, mainStreamConfig: StreamConfig, secondaryStreamConfig: StreamConfig): Promise<void>;
    onPlaybackUpdated(position: number, rate: number): void;
    onSegmentRequested(swarmId: string, streamSwarmId: string, segmentId: number, startTime: number, endTime: number, streamType: StreamType, isLiveStream: boolean): void;
    storeSegment(_swarmId: string, streamSwarmId: string, segmentId: number, data: ArrayBuffer, startTime: number, endTime: number, streamType: StreamType, isLiveStream: boolean): Promise<void>;
    getSegmentData(_swarmId: string, streamSwarmId: string, segmentId: number): Promise<ArrayBuffer | undefined>;
    getUsage(): {
        totalCapacity: number;
        usedCapacity: number;
    };
    hasSegment(_swarmId: string, streamSwarmId: string, externalId: number): boolean;
    getStoredSegmentIds(_swarmId: string, streamSwarmId: string): number[];
    private clear;
    private isMemoryLimitReached;
    setSegmentChangeCallback(callback: ((streamSwarmId: string) => void) | undefined): void;
    private sendUpdatesToAffectedStreams;
    private shouldRemoveSegment;
    private increaseStorageUsage;
    private decreaseStorageUsage;
    private setMemoryStorageLimit;
    private getStreamTimeWindow;
    destroy(): void;
}
