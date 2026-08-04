var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AbortSignalPolyfill_listeners;
class AbortSignalPolyfill {
    constructor() {
        Object.defineProperty(this, "aborted", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        _AbortSignalPolyfill_listeners.set(this, new Set());
    }
    addEventListener(_type, listener) {
        __classPrivateFieldGet(this, _AbortSignalPolyfill_listeners, "f").add(listener);
    }
    removeEventListener(_type, listener) {
        __classPrivateFieldGet(this, _AbortSignalPolyfill_listeners, "f").delete(listener);
    }
    dispatchEvent(_type) {
        this.aborted = true;
        for (const listener of __classPrivateFieldGet(this, _AbortSignalPolyfill_listeners, "f")) {
            try {
                listener();
            }
            catch (_a) {
                // Swallow listener errors
            }
        }
        __classPrivateFieldGet(this, _AbortSignalPolyfill_listeners, "f").clear();
    }
}
_AbortSignalPolyfill_listeners = new WeakMap();
class AbortControllerPolyfill {
    constructor() {
        Object.defineProperty(this, "signal", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new AbortSignalPolyfill()
        });
    }
    abort() {
        this.signal.dispatchEvent("abort");
    }
}
export const isAbortControllerSupported = typeof AbortController !== "undefined";
export const SafeAbortController = isAbortControllerSupported
    ? AbortController
    : AbortControllerPolyfill;
//# sourceMappingURL=abort-controller.js.map