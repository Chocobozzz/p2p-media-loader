// Minimum time denominator in ms to prevent division by zero for instantaneous
// downloads (e.g., from cache), maintaining a high bandwidth estimate so the
// ABR doesn't downshift.
const MIN_TIME_DIFF_MS = 1;
export class BandwidthCalculator {
    constructor(clearThresholdMs = 20000) {
        Object.defineProperty(this, "clearThresholdMs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: clearThresholdMs
        });
        Object.defineProperty(this, "loadingsCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "bytes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "loadingOnlyTimestamps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "timestamps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "noLoadingsTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "loadingsStoppedAt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    addBytes(bytesLength, now = performance.now()) {
        this.bytes.push(bytesLength);
        this.loadingOnlyTimestamps.push(now - this.noLoadingsTime);
        this.timestamps.push(now);
    }
    startLoading(now = performance.now()) {
        this.clearStale();
        if (this.loadingsCount === 0 && this.loadingsStoppedAt !== 0) {
            this.noLoadingsTime += now - this.loadingsStoppedAt;
        }
        this.loadingsCount++;
    }
    stopLoading(now = performance.now()) {
        if (this.loadingsCount > 0) {
            this.loadingsCount--;
            if (this.loadingsCount === 0)
                this.loadingsStoppedAt = now;
        }
    }
    getBandwidthLoadingOnly(seconds, ignoreThresholdTimestamp = Number.NEGATIVE_INFINITY) {
        if (!this.loadingOnlyTimestamps.length)
            return 0;
        const milliseconds = seconds * 1000;
        const lastItemTimestamp = this.loadingOnlyTimestamps[this.loadingOnlyTimestamps.length - 1];
        let lastCountedTimestamp = lastItemTimestamp;
        const threshold = lastItemTimestamp - milliseconds;
        let totalBytes = 0;
        for (let i = this.bytes.length - 1; i >= 0; i--) {
            const timestamp = this.loadingOnlyTimestamps[i];
            if (timestamp < threshold ||
                this.timestamps[i] < ignoreThresholdTimestamp) {
                break;
            }
            lastCountedTimestamp = timestamp;
            totalBytes += this.bytes[i];
        }
        const timeDiff = Math.max(lastItemTimestamp - lastCountedTimestamp, MIN_TIME_DIFF_MS);
        return (totalBytes * 8000) / timeDiff;
    }
    getBandwidth(seconds, ignoreThresholdTimestamp = Number.NEGATIVE_INFINITY, now = performance.now()) {
        if (!this.timestamps.length)
            return 0;
        const milliseconds = seconds * 1000;
        const threshold = now - milliseconds;
        let lastCountedTimestamp = now;
        let totalBytes = 0;
        for (let i = this.bytes.length - 1; i >= 0; i--) {
            const timestamp = this.timestamps[i];
            if (timestamp < threshold || timestamp < ignoreThresholdTimestamp)
                break;
            lastCountedTimestamp = timestamp;
            totalBytes += this.bytes[i];
        }
        const timeDiff = Math.max(now - lastCountedTimestamp, MIN_TIME_DIFF_MS);
        return (totalBytes * 8000) / timeDiff;
    }
    clearStale() {
        if (!this.loadingOnlyTimestamps.length)
            return;
        const threshold = this.loadingOnlyTimestamps[this.loadingOnlyTimestamps.length - 1] -
            this.clearThresholdMs;
        let samplesToRemove = 0;
        for (const timestamp of this.loadingOnlyTimestamps) {
            if (timestamp > threshold)
                break;
            samplesToRemove++;
        }
        this.bytes.splice(0, samplesToRemove);
        this.loadingOnlyTimestamps.splice(0, samplesToRemove);
        this.timestamps.splice(0, samplesToRemove);
    }
    clear() {
        this.bytes.length = 0;
        this.loadingOnlyTimestamps.length = 0;
        this.timestamps.length = 0;
        this.loadingsCount = 0;
        this.noLoadingsTime = 0;
        this.loadingsStoppedAt = 0;
    }
}
//# sourceMappingURL=bandwidth-calculator.js.map