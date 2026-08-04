export declare class BandwidthCalculator {
    private readonly clearThresholdMs;
    private loadingsCount;
    private readonly bytes;
    private readonly loadingOnlyTimestamps;
    private readonly timestamps;
    private noLoadingsTime;
    private loadingsStoppedAt;
    constructor(clearThresholdMs?: number);
    addBytes(bytesLength: number, now?: number): void;
    startLoading(now?: number): void;
    stopLoading(now?: number): void;
    getBandwidthLoadingOnly(seconds: number, ignoreThresholdTimestamp?: number): number;
    getBandwidth(seconds: number, ignoreThresholdTimestamp?: number, now?: number): number;
    clearStale(): void;
    clear(): void;
}
