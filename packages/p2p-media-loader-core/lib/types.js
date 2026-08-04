/**
 * Base class for all errors and warnings emitted by the library, carrying a
 * machine-readable `type` discriminator. Use `instanceof TypedError` to catch
 * any library error regardless of its specific class.
 */
export class TypedError extends Error {
    constructor(type, message, cause) {
        super(message);
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: type
        });
        Object.defineProperty(this, "cause", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Explicit assignment for ES6 compatibility (ErrorOptions with cause is ES2022)
        this.cause = cause;
    }
}
/** Represents an error that occurred during a peer connection. */
export class PeerError extends TypedError {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "PeerError"
        });
    }
}
/** Represents a warning that occurred during a peer connection. */
export class PeerWarning extends TypedError {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "PeerWarning"
        });
    }
}
/** Represents an error that occurred during a tracker request. */
export class TrackerError extends TypedError {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "TrackerError"
        });
    }
}
/** Represents a warning that occurred during a tracker request. */
export class TrackerWarning extends TypedError {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "TrackerWarning"
        });
    }
}
/** Represents an error that occurred while establishing a peer connection. */
export class PeerConnectError extends TypedError {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "PeerConnectError"
        });
    }
}
/**
 * Represents an error that can occur during the request process, with a timestamp for when the error occurred.
 * @template T - The specific type of request error.
 */
export class RequestError extends TypedError {
    /**
     * Constructs a new RequestError.
     * @param type - The specific error type.
     * @param message - Optional message describing the error.
     * @param cause - Optional underlying cause of the error.
     */
    constructor(type, message, cause) {
        super(type, message, cause);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "RequestError"
        });
        /** Error timestamp. */
        Object.defineProperty(this, "timestamp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.timestamp = performance.now();
    }
}
/** Custom error class for errors that occur during core network requests. */
export class CoreRequestError extends TypedError {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "CoreRequestError"
        });
    }
}
//# sourceMappingURL=types.js.map