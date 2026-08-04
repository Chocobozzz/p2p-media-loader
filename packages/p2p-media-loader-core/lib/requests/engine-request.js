import { CoreRequestError } from "../types.js";
export class EngineRequest {
    constructor(segment, engineCallbacks) {
        Object.defineProperty(this, "segment", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: segment
        });
        Object.defineProperty(this, "engineCallbacks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: engineCallbacks
        });
        Object.defineProperty(this, "_status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "pending"
        });
        Object.defineProperty(this, "_shouldBeStartedImmediately", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    get status() {
        return this._status;
    }
    get shouldBeStartedImmediately() {
        return this._shouldBeStartedImmediately;
    }
    resolve(data, bandwidth) {
        if (this._status !== "pending")
            return;
        this._status = "succeed";
        this.engineCallbacks.onSuccess({ data, bandwidth });
    }
    reject() {
        if (this._status !== "pending")
            return;
        this._status = "failed";
        this.engineCallbacks.onError(new CoreRequestError("failed"));
    }
    abort() {
        if (this._status !== "pending")
            return;
        this._status = "aborted";
        this.engineCallbacks.onError(new CoreRequestError("aborted"));
    }
    markAsShouldBeStartedImmediately() {
        this._shouldBeStartedImmediately = true;
    }
}
//# sourceMappingURL=engine-request.js.map